/**
 * Módulo de comunicação HTTP com a API RESTful do backend
 */
const API = {
  tokenChave: 'senai_acomp_token',
  usuarioChave: 'senai_acomp_usuario',

  obterToken() {
    return localStorage.getItem(this.tokenChave);
  },

  salvarSessao(token, usuario) {
    localStorage.setItem(this.tokenChave, token);
    localStorage.setItem(this.usuarioChave, JSON.stringify(usuario));
  },

  limparSessao() {
    localStorage.removeItem(this.tokenChave);
    localStorage.removeItem(this.usuarioChave);
  },

  obterUsuarioArmazenado() {
    try {
      const u = localStorage.getItem(this.usuarioChave);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  async requisitar(endpoint, opcoes = {}) {
    const url = `/api${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(opcoes.headers || {})
    };

    const token = this.obterToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const resposta = await fetch(url, {
        ...opcoes,
        headers
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        if (resposta.status === 401) {
          // Token expirado ou inválido
          this.limparSessao();
          window.dispatchEvent(new CustomEvent('sessao-expirada'));
        }
        throw new Error(dados.erro || `Erro ${resposta.status}: Falha na requisição.`);
      }

      return dados;
    } catch (erro) {
      console.error(`Erro na chamada API ${endpoint}:`, erro);
      throw erro;
    }
  },

  // Métodos de atalho
  get(endpoint) {
    return this.requisitar(endpoint, { method: 'GET' });
  },

  post(endpoint, corpo) {
    return this.requisitar(endpoint, {
      method: 'POST',
      body: JSON.stringify(corpo)
    });
  },

  put(endpoint, corpo) {
    return this.requisitar(endpoint, {
      method: 'PUT',
      body: JSON.stringify(corpo)
    });
  },

  patch(endpoint, corpo) {
    return this.requisitar(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(corpo || {})
    });
  },

  delete(endpoint) {
    return this.requisitar(endpoint, { method: 'DELETE' });
  }
};
