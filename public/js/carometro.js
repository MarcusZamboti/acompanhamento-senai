/**
 * Módulo do Carômetro e Gerenciamento de Abas de Turmas
 */
const Carometro = {
  turmas: [],
  turmaAtiva: null,
  alunosAtuais: [],
  paginaAtual: 1,
  itensPorPagina: 16,

  async inicializar() {
    this.configurarTooltip();
    this.configurarBusca();
    await this.carregarTurmas();

    // Ouvir mudanças de perfil para re-renderizar abas e carômetro conforme novas permissões
    window.addEventListener('usuario-autenticado', async () => {
      await this.carregarTurmas();
    });
  },

  async carregarTurmas() {
    const containerAbas = document.getElementById('container-abas-turmas');
    const selectFiltroTurma = document.getElementById('filtro-select-turma');
    if (!containerAbas) return;

    try {
      const dados = await API.get('/turmas');
      this.turmas = dados.turmas || [];

      containerAbas.innerHTML = '';
      if (selectFiltroTurma) {
        selectFiltroTurma.innerHTML = '';
      }

      if (this.turmas.length === 0) {
        containerAbas.innerHTML = `
          <div class="aviso-sem-turmas">
            <strong>Nenhuma turma atribuída ao seu perfil.</strong><br>
            Solicite ao Usuário Master a liberação de turmas para visualização.
          </div>
        `;
        document.getElementById('grade-carometro').innerHTML = '';
        document.getElementById('total-alunos-encontrados').textContent = '0';
        return;
      }

      // Adicionar botões das turmas permitidas
      this.turmas.forEach((turma, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-aba-turma';
        btn.textContent = turma.codigo;
        btn.dataset.codigo = turma.codigo;
        btn.title = `${turma.nome} (${turma.periodo})`;

        btn.onclick = () => {
          this.selecionarTurma(turma.codigo);
        };

        containerAbas.appendChild(btn);

        if (selectFiltroTurma) {
          const opt = document.createElement('option');
          opt.value = turma.codigo;
          opt.textContent = turma.codigo;
          selectFiltroTurma.appendChild(opt);
        }
      });

      // Se tiver mais de 1 turma, adicionar aba "TODAS"
      if (this.turmas.length > 1) {
        const btnTodas = document.createElement('button');
        btnTodas.type = 'button';
        btnTodas.className = 'btn-aba-turma aba-todas';
        btnTodas.textContent = 'TODAS';
        btnTodas.dataset.codigo = 'TODAS';
        btnTodas.title = 'Visualizar todas as turmas autorizadas';
        btnTodas.onclick = () => this.selecionarTurma('TODAS');
        containerAbas.appendChild(btnTodas);

        if (selectFiltroTurma) {
          const optTodas = document.createElement('option');
          optTodas.value = 'TODAS';
          optTodas.textContent = 'Todas as turmas';
          selectFiltroTurma.appendChild(optTodas);
        }
      }

      // Se a turma ativa atual ainda for válida, mantê-la; senão, selecionar a primeira
      const aindaValida = this.turmas.some(t => t.codigo === this.turmaAtiva) || this.turmaAtiva === 'TODAS';
      if (!aindaValida || !this.turmaAtiva) {
        this.selecionarTurma(this.turmas[0].codigo);
      } else {
        this.selecionarTurma(this.turmaAtiva);
      }
    } catch (e) {
      console.error('Erro ao carregar turmas:', e);
    }
  },

  async selecionarTurma(codigoTurma) {
    this.turmaAtiva = codigoTurma;
    this.paginaAtual = 1;

    // Atualizar visual das abas
    document.querySelectorAll('.btn-aba-turma').forEach(btn => {
      if (btn.dataset.codigo === codigoTurma) {
        btn.classList.add('ativa');
      } else {
        btn.classList.remove('ativa');
      }
    });

    const selectFiltroTurma = document.getElementById('filtro-select-turma');
    if (selectFiltroTurma && selectFiltroTurma.value !== codigoTurma) {
      selectFiltroTurma.value = codigoTurma;
    }

    // Atualizar visibilidade de botões de gestão da turma ativa
    const podeTurmas = typeof Auth !== 'undefined' && Auth.podeGerenciarTurmas();
    const ehTurmaEspecifica = codigoTurma && codigoTurma.toUpperCase() !== 'TODAS';

    const btnEvoluir = document.getElementById('btn-carometro-evoluir-turma');
    if (btnEvoluir) {
      btnEvoluir.style.display = (podeTurmas && ehTurmaEspecifica) ? 'inline-block' : 'none';
      btnEvoluir.title = `Evoluir módulo da turma ${codigoTurma} (mantendo alunos e avaliações)`;
    }

    const btnExcluir = document.getElementById('btn-carometro-excluir-turma');
    if (btnExcluir) {
      btnExcluir.style.display = (podeTurmas && ehTurmaEspecifica) ? 'inline-block' : 'none';
      btnExcluir.title = `Excluir a turma ${codigoTurma}`;
    }

    await this.carregarAlunos();
  },

  async carregarAlunos() {
    if (!this.turmaAtiva) return;

    const grade = document.getElementById('grade-carometro');
    const elContador = document.getElementById('total-alunos-encontrados');
    const inputBusca = document.getElementById('input-pesquisa-palavra');
    const selectOrdenacao = document.getElementById('select-ordenacao');

    const termo = inputBusca ? inputBusca.value.trim() : '';
    const ordenacao = selectOrdenacao ? selectOrdenacao.value : 'nome';

    grade.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">Carregando carômetro...</div>';

    try {
      let endpoint = `/turmas/${encodeURIComponent(this.turmaAtiva)}/alunos?ordenar=${ordenacao}`;
      if (termo) {
        endpoint += `&q=${encodeURIComponent(termo)}`;
      }

      const res = await API.get(endpoint);
      this.alunosAtuais = res.alunos || [];

      if (elContador) {
        elContador.textContent = this.alunosAtuais.length;
      }

      this.renderizarGrade();
      this.atualizarBarraPaginacao();
    } catch (e) {
      grade.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Erro ao carregar alunos: ${e.message}</div>`;
    }
  },

  renderizarGrade() {
    const grade = document.getElementById('grade-carometro');
    grade.innerHTML = '';

    if (this.alunosAtuais.length === 0) {
      grade.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
          Nenhum aluno encontrado para os critérios selecionados.
        </div>
      `;
      return;
    }

    // Paginação simples
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    const alunosPagina = this.alunosAtuais.slice(inicio, fim);

    alunosPagina.forEach(aluno => {
      const card = this.criarCardAluno(aluno);
      grade.appendChild(card);
    });
  },

  criarCardAluno(aluno) {
    const card = document.createElement('div');
    card.className = 'card-aluno';
    card.dataset.id = aluno.id;

    // Badges circulares vermelho e verde derivados das ocorrências reais
    // - Círculo Verde: elogios ou recomendações positivas
    // - Círculo Vermelho: advertências ou orientações disciplinares
    let htmlIndicadores = '<div class="container-indicadores-circulares">';

    if (aluno.contador_verde > 0) {
      htmlIndicadores += `
        <div class="circulo-indicador circulo-verde" title="${aluno.contador_verde} elogio(s) / recomendação(ões)">
          ${aluno.contador_verde}
        </div>
      `;
    }

    if (aluno.contador_vermelho > 0) {
      htmlIndicadores += `
        <div class="circulo-indicador circulo-vermelho" title="${aluno.contador_vermelho} advertência(s) / orientação(ões)">
          ${aluno.contador_vermelho}
        </div>
      `;
    }

    htmlIndicadores += '</div>';

    // Imagem do aluno com fallback seguro
    const fotoSrc = aluno.foto_url || '/assets/fotos/aluno_2.svg';

    card.innerHTML = `
      <div class="card-aluno-foto-container">
        <img class="card-aluno-foto" src="${fotoSrc}" alt="${aluno.nome}" onerror="this.src='/assets/fotos/aluno_2.svg'" loading="lazy">
        ${htmlIndicadores}
      </div>
      <div class="card-aluno-nome-box" title="${aluno.nome}">
        <span class="card-aluno-nome-texto">${aluno.nome}</span>
      </div>
    `;

    // Eventos de Tooltip ao passar o mouse
    card.addEventListener('mouseenter', (e) => this.mostrarTooltip(e, aluno));
    card.addEventListener('mousemove', (e) => this.moverTooltip(e));
    card.addEventListener('mouseleave', () => this.esconderTooltip());

    // Evento de clique para abrir a ficha detalhada do aluno (conforme imagem 2)
    card.addEventListener('click', () => {
      this.esconderTooltip();
      ModalDetalhes.abrir(aluno.id);
    });

    return card;
  },

  // Tooltip flutuante com dados resumidos do aluno
  configurarTooltip() {
    this.tooltipEl = document.getElementById('tooltip-aluno');
    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.id = 'tooltip-aluno';
      this.tooltipEl.className = 'tooltip-aluno-flutuante';
      document.body.appendChild(this.tooltipEl);
    }
  },

  mostrarTooltip(e, aluno) {
    if (!this.tooltipEl) return;
    this.tooltipEl.innerHTML = `
      <div class="tt-nome">${aluno.nome}</div>
      <div class="tt-linha">Turma: ${aluno.turma_codigo}</div>
      <div class="tt-linha">Idade: ${aluno.idade_texto || '17 anos'}</div>
      <div class="tt-linha">${aluno.total_ocorrencias} ocorrência(s)</div>
    `;
    this.tooltipEl.style.display = 'block';
    this.moverTooltip(e);
  },

  moverTooltip(e) {
    if (!this.tooltipEl) return;
    const offset = 14;
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Evitar que saia da tela
    const rect = this.tooltipEl.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      x = e.clientX - rect.width - offset;
    }
    if (y + rect.height > window.innerHeight) {
      y = e.clientY - rect.height - offset;
    }

    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
  },

  esconderTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  },

  atualizarBarraPaginacao() {
    const total = this.alunosAtuais.length;
    const totalPaginas = Math.ceil(total / this.itensPorPagina) || 1;
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina + 1;
    const fim = Math.min(this.paginaAtual * this.itensPorPagina, total);

    const elTextoFaixa = document.getElementById('paginacao-faixa-texto');
    const elLinks = document.getElementById('paginacao-links');

    if (elTextoFaixa) {
      elTextoFaixa.textContent = total > 0 ? `Lista de alunos ${inicio} a ${fim} de ${total}` : 'Nenhum aluno';
    }

    if (elLinks) {
      elLinks.innerHTML = '';
      for (let i = 1; i <= totalPaginas; i++) {
        const link = document.createElement('a');
        link.textContent = i;
        if (i === this.paginaAtual) link.className = 'ativa';
        link.onclick = () => {
          this.paginaAtual = i;
          this.renderizarGrade();
          this.atualizarBarraPaginacao();
        };
        elLinks.appendChild(link);
      }
    }
  },

  configurarBusca() {
    const btnPesquisar = document.getElementById('btn-executar-pesquisa');
    const inputBusca = document.getElementById('input-pesquisa-palavra');
    const selectOrdenacao = document.getElementById('select-ordenacao');
    const selectTurma = document.getElementById('filtro-select-turma');

    if (btnPesquisar) {
      btnPesquisar.onclick = () => this.carregarAlunos();
    }

    if (inputBusca) {
      inputBusca.onkeyup = (e) => {
        if (e.key === 'Enter') this.carregarAlunos();
      };
    }

    if (selectOrdenacao) {
      selectOrdenacao.onchange = () => this.carregarAlunos();
    }

    if (selectTurma) {
      selectTurma.onchange = (e) => {
        this.selecionarTurma(e.target.value);
      };
    }
  },

  // Atualização em tempo real de um aluno específico no carômetro após gravação
  atualizarContadoresAluno(alunoId, contadorVermelho, contadorVerde, totalOcorrencias) {
    const aluno = this.alunosAtuais.find(a => a.id === alunoId);
    if (aluno) {
      aluno.contador_vermelho = contadorVermelho;
      aluno.contador_verde = contadorVerde;
      aluno.total_ocorrencias = totalOcorrencias;
    }

    // Re-renderizar o card correspondente na grade
    const cardEl = document.querySelector(`.card-aluno[data-id="${alunoId}"]`);
    if (cardEl && aluno) {
      const novoCard = this.criarCardAluno(aluno);
      cardEl.replaceWith(novoCard);
    }
  }
};
