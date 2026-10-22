/**
 * Módulo de Inclusão de Ocorrência Disciplinar
 * Fiel à imagem de referência image (3).png
 */
const ModalOcorrencia = {
  alunoAtual: null,
  tiposOcorrencia: [],

  async abrir(aluno) {
    this.alunoAtual = aluno;
    const overlay = document.getElementById('modal-inclusao-ocorrencia');
    if (!overlay) return;

    // Atualizar dados de cabeçalho
    const elResp = document.getElementById('ocorrencia-responsavel-nome');
    if (elResp) {
      elResp.textContent = Auth.usuarioAtual?.login || 'usuario';
    }

    const elDataTopo = document.getElementById('ocorrencia-data-topo');
    const hoje = new Date();
    const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    if (elDataTopo) {
      elDataTopo.textContent = dataFormatada;
    }

    const inputData = document.getElementById('ocorrencia-input-data');
    if (inputData) {
      inputData.value = hoje.toISOString().split('T')[0];
    }

    const inputDetalhamento = document.getElementById('ocorrencia-detalhamento');
    if (inputDetalhamento) {
      inputDetalhamento.value = '';
    }

    await this.carregarTiposOcorrencia();
    overlay.classList.add('ativo');
  },

  fechar() {
    const overlay = document.getElementById('modal-inclusao-ocorrencia');
    if (overlay) overlay.classList.remove('ativo');
  },

  async carregarTiposOcorrencia() {
    const select = document.getElementById('ocorrencia-select-tipo');
    if (!select) return;

    try {
      if (this.tiposOcorrencia.length === 0) {
        const res = await API.get('/ocorrencias/tipos');
        this.tiposOcorrencia = res.tipos || [];
      }

      select.innerHTML = '<option value="">-- Selecione o Tipo de Ocorrência --</option>';

      const optGroupVermelho = document.createElement('optgroup');
      optGroupVermelho.label = 'Orientações e Advertências (Círculo Vermelho)';

      const optGroupVerde = document.createElement('optgroup');
      optGroupVerde.label = 'Elogios e Recomendações (Círculo Verde)';

      const podeVermelho = Auth.podeCriarVermelho();
      const podeVerde = Auth.podeCriarVerde();

      this.tiposOcorrencia.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.nome;
        opt.dataset.classificacao = t.classificacao;

        if (t.classificacao === 'VERMELHO') {
          opt.textContent = podeVermelho ? t.nome : `${t.nome} (Sem permissão no seu perfil)`;
          opt.disabled = !podeVermelho;
          optGroupVermelho.appendChild(opt);
        } else {
          opt.textContent = podeVerde ? t.nome : `${t.nome} (Sem permissão no seu perfil)`;
          opt.disabled = !podeVerde;
          optGroupVerde.appendChild(opt);
        }
      });

      if (optGroupVermelho.children.length > 0) select.appendChild(optGroupVermelho);
      if (optGroupVerde.children.length > 0) select.appendChild(optGroupVerde);

    } catch (e) {
      console.error('Erro ao carregar tipos de ocorrência:', e);
    }
  },

  async gravar() {
    const selectTipo = document.getElementById('ocorrencia-select-tipo');
    const inputDetalhamento = document.getElementById('ocorrencia-detalhamento');
    const inputData = document.getElementById('ocorrencia-input-data');
    const btnGravar = document.getElementById('btn-gravar-ocorrencia-submit');

    const tipo_nome = selectTipo ? selectTipo.value : '';
    const detalhamento = inputDetalhamento ? inputDetalhamento.value.trim() : '';
    const data = inputData ? inputData.value : '';

    if (!tipo_nome) {
      alert('Por favor, selecione o Tipo de Ocorrência.');
      if (selectTipo) selectTipo.focus();
      return;
    }

    if (!detalhamento) {
      alert('Por favor, preencha o detalhamento do ocorrido.');
      if (inputDetalhamento) inputDetalhamento.focus();
      return;
    }

    if (btnGravar) {
      btnGravar.disabled = true;
      btnGravar.textContent = 'Gravando...';
    }

    try {
      const res = await API.post('/ocorrencias', {
        aluno_id: this.alunoAtual.id,
        tipo_nome,
        detalhamento,
        data
      });

      alert('Ocorrência gravada com sucesso!');

      // Fechar modal de inclusão
      this.fechar();

      // Atualizar contadores no carômetro instantaneamente
      Carometro.atualizarContadoresAluno(
        res.aluno_id,
        res.contador_vermelho,
        res.contador_verde,
        res.total_ocorrencias
      );

      // Recarregar os detalhes na ficha do aluno
      await ModalDetalhes.abrir(this.alunoAtual.id);

    } catch (e) {
      alert('Falha ao gravar ocorrência: ' + e.message);
    } finally {
      if (btnGravar) {
        btnGravar.disabled = false;
        btnGravar.textContent = 'Gravar';
      }
    }
  }
};
