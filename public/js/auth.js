/**
 * Gerenciamento de Autenticação e Perfis de Acesso
 * Sistema de Acompanhamento Escolar - SENAI Theobaldo De Nigris
 */
const Auth = {
  usuarioAtual: null,

  async inicializar() {
    const token = API.obterToken();

    if (token) {
      try {
        const res = await API.get('/auth/me');
        this.usuarioAtual = res.usuario;
        API.salvarSessao(token, this.usuarioAtual);
        this.exibirTelaSistema();
        this.atualizarInterfaceUsuario();
        await this.carregarOpcoesDemo();
        return;
      } catch (e) {
        // Token inválido ou expirado, limpar
        this.usuarioAtual = null;
        API.limparSessao();
      }
    }

    // Se não há token válido, exibir Tela Inicial de Login
    this.exibirTelaLogin();
  },

  exibirTelaLogin() {
    const elTelaLogin = document.getElementById('tela-login-inicial');
    const elContainerSistema = document.getElementById('container-sistema');
    const elBarraDemo = document.getElementById('barra-demo-topo');
    const watermark = document.querySelector('.fundo-escola-watermark');

    // Fundo 100% preto sólido, sem carômetro nem marca d'água visíveis
    document.body.style.backgroundColor = '#000000';
    if (watermark) watermark.style.display = 'none';

    if (elTelaLogin) elTelaLogin.style.display = 'flex';
    if (elContainerSistema) elContainerSistema.style.display = 'none';
    if (elBarraDemo) elBarraDemo.style.display = 'none';

    // Fechar quaisquer modais abertos
    document.querySelectorAll('.modal-overlay.ativo').forEach(m => m.classList.remove('ativo'));

    // Limpar mensagem de erro e dar foco no campo de usuário
    const alertaErro = document.getElementById('login-alerta-erro');
    if (alertaErro) alertaErro.style.display = 'none';

    const inputUser = document.getElementById('login-input-usuario');
    if (inputUser) {
      setTimeout(() => inputUser.focus(), 100);
    }
  },

  exibirTelaSistema() {
    const elTelaLogin = document.getElementById('tela-login-inicial');
    const elContainerSistema = document.getElementById('container-sistema');
    const elBarraDemo = document.getElementById('barra-demo-topo');
    const watermark = document.querySelector('.fundo-escola-watermark');

    document.body.style.backgroundColor = '#ffffff';
    if (watermark) watermark.style.display = 'block';

    if (elTelaLogin) elTelaLogin.style.display = 'none';
    if (elContainerSistema) elContainerSistema.style.display = 'block';
    if (elBarraDemo) elBarraDemo.style.display = 'flex';
  },

  async submeterFormularioLogin() {
    const inputUser = document.getElementById('login-input-usuario');
    const inputSenha = document.getElementById('login-input-senha');
    const alertaErro = document.getElementById('login-alerta-erro');
    const msgErro = document.getElementById('login-mensagem-erro');
    const btnSubmit = document.getElementById('btn-login-entrar');

    const login = inputUser ? inputUser.value.trim() : '';
    const senha = inputSenha ? inputSenha.value : '';

    if (!login || !senha) {
      if (alertaErro && msgErro) {
        msgErro.textContent = 'Por favor, informe seu usuário e senha.';
        alertaErro.style.display = 'flex';
      }
      return;
    }

    if (alertaErro) alertaErro.style.display = 'none';
    const textoOriginal = btnSubmit ? btnSubmit.innerHTML : '';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '⏳ Autenticando...';
    }

    try {
      await this.login(login, senha);
      this.exibirTelaSistema();

      // Inicializar o carômetro se ainda não foi carregado
      if (window.Carometro) {
        await Carometro.inicializar();
      }
    } catch (e) {
      if (alertaErro && msgErro) {
        msgErro.textContent = e.message || 'Usuário ou senha incorretos.';
        alertaErro.style.display = 'flex';
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal || '🚀 Acessar Sistema';
      }
    }
  },

  preencherELogar(login, senha) {
    const inputUser = document.getElementById('login-input-usuario');
    const inputSenha = document.getElementById('login-input-senha');

    if (inputUser) inputUser.value = login;
    if (inputSenha) inputSenha.value = senha;

    this.submeterFormularioLogin();
  },

  alternarVisibilidadeSenha() {
    const inputSenha = document.getElementById('login-input-senha');
    if (!inputSenha) return;

    if (inputSenha.type === 'password') {
      inputSenha.type = 'text';
    } else {
      inputSenha.type = 'password';
    }
  },

  async login(login, senha) {
    const dados = await API.post('/auth/login', { login, senha });
    this.usuarioAtual = dados.usuario;
    API.salvarSessao(dados.token, dados.usuario);
    this.atualizarInterfaceUsuario();
    await this.carregarOpcoesDemo();
    window.dispatchEvent(new CustomEvent('usuario-autenticado', { detail: dados.usuario }));
    return dados.usuario;
  },

  async trocarPerfilDemo(login) {
    try {
      const dados = await API.post('/auth/trocar-usuario-demo', { login });
      this.usuarioAtual = dados.usuario;
      API.salvarSessao(dados.token, dados.usuario);
      this.atualizarInterfaceUsuario();
      window.dispatchEvent(new CustomEvent('usuario-autenticado', { detail: dados.usuario }));
      return dados.usuario;
    } catch (e) {
      alert('Falha ao alternar usuário: ' + e.message);
    }
  },

  logout() {
    API.limparSessao();
    this.usuarioAtual = null;

    const inputSenha = document.getElementById('login-input-senha');
    if (inputSenha) inputSenha.value = '';

    this.exibirTelaLogin();
  },

  atualizarInterfaceUsuario() {
    const elNome = document.getElementById('usuario-nome-header');
    const elCargo = document.getElementById('usuario-cargo-header');
    const elBadge = document.getElementById('badge-perfil-header');
    const btnAdmin = document.getElementById('btn-abrir-admin');
    const seletorDemo = document.getElementById('select-usuario-demo');

    if (!this.usuarioAtual) {
      if (elNome) elNome.textContent = 'Visitante';
      if (btnAdmin) btnAdmin.style.display = 'none';
      return;
    }

    if (elNome) elNome.textContent = this.usuarioAtual.nome;
    if (elCargo) elCargo.textContent = this.usuarioAtual.cargo || this.usuarioAtual.perfil;
    
    if (elBadge) {
      elBadge.textContent = this.usuarioAtual.perfil.toUpperCase();
      elBadge.className = `badge-perfil-atual perfil-${this.usuarioAtual.perfil}`;
    }

    // Apenas Master ou quem tiver permissão de gerenciar usuários pode ver o botão Admin
    const ehMaster = this.usuarioAtual.perfil === 'master' || this.usuarioAtual.permissoes?.pode_gerenciar_usuarios;
    if (btnAdmin) {
      btnAdmin.style.display = ehMaster ? 'inline-block' : 'none';
    }

    const btnNovaTurma = document.getElementById('btn-carometro-nova-turma');
    if (btnNovaTurma) {
      btnNovaTurma.style.display = this.podeGerenciarTurmas() ? 'inline-block' : 'none';
    }

    const btnNovoAluno = document.getElementById('btn-carometro-novo-aluno');
    if (btnNovoAluno) {
      btnNovoAluno.style.display = this.podeGerenciarAlunos() ? 'inline-block' : 'none';
    }

    if (seletorDemo && seletorDemo.value !== this.usuarioAtual.login) {
      seletorDemo.value = this.usuarioAtual.login;
    }
  },

  async carregarOpcoesDemo() {
    const seletor = document.getElementById('select-usuario-demo');
    if (!seletor) return;

    try {
      const usuarios = await API.get('/auth/usuarios-demo');
      seletor.innerHTML = '';

      usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.login;
        let descricaoRestricao = '';
        if (u.turmas_permitidas && !u.turmas_permitidas.includes('*')) {
          descricaoRestricao = ` [Vê: ${u.turmas_permitidas.join(', ')}]`;
        }
        if (!u.pode_criar_vermelho) {
          descricaoRestricao += ` [Sem permissão para advertências]`;
        }
        opt.textContent = `${u.nome} (${u.perfil.toUpperCase()})${descricaoRestricao}`;
        if (this.usuarioAtual && this.usuarioAtual.login === u.login) {
          opt.selected = true;
        }
        seletor.appendChild(opt);
      });

      seletor.onchange = (e) => {
        this.trocarPerfilDemo(e.target.value);
      };
    } catch (e) {
      console.warn('Não foi possível carregar lista de usuários demo:', e);
    }
  },

  ehMaster() {
    return this.usuarioAtual && (this.usuarioAtual.perfil === 'master' || this.usuarioAtual.permissoes?.pode_gerenciar_usuarios);
  },

  podeGerenciarTurmas() {
    return this.ehMaster() || this.usuarioAtual?.permissoes?.pode_gerenciar_turmas === true;
  },

  podeGerenciarAlunos() {
    return this.ehMaster() || this.usuarioAtual?.permissoes?.pode_gerenciar_alunos === true;
  },

  podeCriarVermelho() {
    return this.usuarioAtual?.permissoes?.pode_criar_vermelho === true;
  },

  podeCriarVerde() {
    return this.usuarioAtual?.permissoes?.pode_criar_verde === true;
  },

  podeExcluirOcorrencia() {
    return this.usuarioAtual?.permissoes?.pode_excluir_ocorrencia === true;
  }
};
