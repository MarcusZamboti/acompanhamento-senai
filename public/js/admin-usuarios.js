/**
 * Módulo de Administração de Usuários, Permissões, Turmas e Alunos
 * Escola SENAI "Theobaldo De Nigris"
 */
const AdminUsuarios = {
  usuarios: [],
  turmasDisponiveis: [],
  usuarioEmEdicao: null,
  alunoEmEdicaoFoto: null,
  fotoBase64Temp: '',

  async abrir() {
    if (!Auth.ehMaster()) {
      alert('Acesso restrito. Apenas o Usuário Master pode acessar o painel de administração geral.');
      return;
    }

    const overlay = document.getElementById('modal-admin-usuarios');
    if (!overlay) return;

    await this.carregarTurmasDisponiveis();
    await this.carregarUsuarios();
    overlay.classList.add('ativo');
  },

  fechar() {
    const overlay = document.getElementById('modal-admin-usuarios');
    if (overlay) overlay.classList.remove('ativo');
    this.fecharFormulario();
  },

  async carregarTurmasDisponiveis() {
    try {
      const res = await API.get('/usuarios/turmas-disponiveis');
      this.turmasDisponiveis = res.turmas || [];
    } catch (e) {
      console.error('Erro ao carregar turmas:', e);
    }
  },

  async carregarUsuarios() {
    const tbody = document.getElementById('tabela-admin-usuarios-corpo');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Carregando usuários...</td></tr>';

    try {
      const res = await API.get('/usuarios');
      this.usuarios = res.usuarios || [];

      tbody.innerHTML = '';
      if (this.usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhum usuário cadastrado.</td></tr>';
        return;
      }

      this.usuarios.forEach(u => {
        const tr = document.createElement('tr');

        // Formatação das turmas
        let turmasTexto = '';
        if (u.permissoes?.turmas_permitidas?.includes('*')) {
          turmasTexto = '<span class="tag-permissao turma-tag">Todas (*)</span>';
        } else if (u.permissoes?.turmas_permitidas?.length > 0) {
          turmasTexto = u.permissoes.turmas_permitidas
            .map(cod => `<span class="tag-permissao turma-tag">${cod}</span>`)
            .join(' ');
        } else {
          turmasTexto = '<span style="color: #94a3b8; font-size: 11px;">Nenhuma</span>';
        }

        // Permissões de escrita e gestão
        const tagsAcoes = [];
        if (u.permissoes?.pode_gerenciar_turmas) {
          tagsAcoes.push('<span class="tag-permissao" style="background:#fef3c7; color:#92400e;" title="Criar e editar turmas">🏫 Turmas</span>');
        }
        if (u.permissoes?.pode_gerenciar_alunos) {
          tagsAcoes.push('<span class="tag-permissao" style="background:#e0e7ff; color:#3730a3;" title="Adicionar alunos e fotos">👤 Alunos/Fotos</span>');
        }
        if (u.permissoes?.pode_criar_verde) {
          tagsAcoes.push('<span class="tag-permissao acao-verde" title="Pode registrar elogios">🟢 Elogios</span>');
        }
        if (u.permissoes?.pode_criar_vermelho) {
          tagsAcoes.push('<span class="tag-permissao acao-vermelho" title="Pode registrar advertências">🔴 Advertências</span>');
        }
        if (u.permissoes?.pode_excluir_ocorrencia) {
          tagsAcoes.push('<span class="tag-permissao" title="Pode excluir registros">🗑️ Exclusão</span>');
        }

        const badgeStatus = u.ativo
          ? '<span class="badge-status-ativo">Ativo</span>'
          : '<span class="badge-status-inativo">Inativo</span>';

        const ehMasterPrincipal = u.login === 'master';

        tr.innerHTML = `
          <td><strong>${u.login}</strong></td>
          <td>${u.nome}</td>
          <td><span class="badge-perfil-atual perfil-${u.perfil}">${u.perfil.toUpperCase()}</span></td>
          <td>${badgeStatus}</td>
          <td><div class="box-permissoes-tags">${turmasTexto}</div></td>
          <td><div class="box-permissoes-tags">${tagsAcoes.join(' ') || '-'}</div></td>
          <td style="white-space: nowrap;">
            <button class="btn-senai-topo btn-editar-usr" data-id="${u.id}" title="Editar usuário e permissões">
              ✏️ Editar
            </button>
            ${!ehMasterPrincipal ? `
              <button class="btn-senai-topo btn-status-usr" data-id="${u.id}" title="${u.ativo ? 'Desativar usuário' : 'Ativar usuário'}">
                ${u.ativo ? '⏸️ Desativar' : '▶️ Ativar'}
              </button>
            ` : '<span style="color: #64748b; font-size: 11px; margin-left: 6px;">(Principal)</span>'}
          </td>
        `;

        // Eventos
        const btnEditar = tr.querySelector('.btn-editar-usr');
        if (btnEditar) btnEditar.onclick = () => this.iniciarEdicao(u);

        const btnStatus = tr.querySelector('.btn-status-usr');
        if (btnStatus) btnStatus.onclick = () => this.alternarStatus(u.id);

        tbody.appendChild(tr);
      });

    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Erro: ${e.message}</td></tr>`;
    }
  },

  iniciarCriacao() {
    this.usuarioEmEdicao = null;
    document.getElementById('form-usuario-titulo').textContent = 'Novo Usuário';
    document.getElementById('usr-form-id').value = '';
    document.getElementById('usr-form-login').value = '';
    document.getElementById('usr-form-login').disabled = false;
    document.getElementById('usr-form-nome').value = '';
    document.getElementById('usr-form-cargo').value = 'Professor';
    document.getElementById('usr-form-perfil').value = 'professor';
    document.getElementById('usr-form-senha').value = 'senha123';
    document.getElementById('usr-form-senha-aviso').textContent = '(Senha inicial padrão: senha123)';

    // Resetar checkboxes de permissões
    document.getElementById('perm-todas-turmas').checked = false;
    document.getElementById('perm-pode-gerenciar-turmas').checked = false;
    document.getElementById('perm-pode-gerenciar-alunos').checked = true;
    document.getElementById('perm-pode-vermelho').checked = true;
    document.getElementById('perm-pode-verde').checked = true;
    document.getElementById('perm-pode-excluir').checked = false;

    this.renderizarCheckboxesTurmas([]);

    document.getElementById('painel-form-usuario').style.display = 'block';
    document.getElementById('painel-form-usuario').scrollIntoView({ behavior: 'smooth' });
  },

  iniciarEdicao(u) {
    this.usuarioEmEdicao = u;
    document.getElementById('form-usuario-titulo').textContent = `Editar Usuário: ${u.nome}`;
    document.getElementById('usr-form-id').value = u.id;
    document.getElementById('usr-form-login').value = u.login;
    document.getElementById('usr-form-login').disabled = (u.login === 'master');
    document.getElementById('usr-form-nome').value = u.nome;
    document.getElementById('usr-form-cargo').value = u.cargo || '';
    document.getElementById('usr-form-perfil').value = u.perfil;
    document.getElementById('usr-form-senha').value = '';
    document.getElementById('usr-form-senha-aviso').textContent = '(Deixe em branco para manter a senha atual)';

    const temTodas = u.permissoes?.turmas_permitidas?.includes('*');
    document.getElementById('perm-todas-turmas').checked = temTodas;
    document.getElementById('perm-pode-gerenciar-turmas').checked = u.permissoes?.pode_gerenciar_turmas === true;
    document.getElementById('perm-pode-gerenciar-alunos').checked = u.permissoes?.pode_gerenciar_alunos === true;
    document.getElementById('perm-pode-vermelho').checked = u.permissoes?.pode_criar_vermelho === true;
    document.getElementById('perm-pode-verde').checked = u.permissoes?.pode_criar_verde === true;
    document.getElementById('perm-pode-excluir').checked = u.permissoes?.pode_excluir_ocorrencia === true;

    this.renderizarCheckboxesTurmas(u.permissoes?.turmas_permitidas || []);

    document.getElementById('painel-form-usuario').style.display = 'block';
    document.getElementById('painel-form-usuario').scrollIntoView({ behavior: 'smooth' });
  },

  renderizarCheckboxesTurmas(turmasSelecionadas) {
    const container = document.getElementById('grade-checkboxes-turmas');
    if (!container) return;

    container.innerHTML = '';
    const temTodas = turmasSelecionadas.includes('*');

    this.turmasDisponiveis.forEach(t => {
      const label = document.createElement('label');
      label.className = 'item-checkbox';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'chk-turma-item';
      chk.value = t.codigo;
      chk.checked = temTodas || turmasSelecionadas.includes(t.codigo);
      chk.disabled = temTodas;

      label.appendChild(chk);
      label.appendChild(document.createTextNode(` ${t.codigo} - ${t.periodo}`));
      container.appendChild(label);
    });

    const chkTodas = document.getElementById('perm-todas-turmas');
    if (chkTodas) {
      chkTodas.onchange = (e) => {
        const todas = e.target.checked;
        document.querySelectorAll('.chk-turma-item').forEach(c => {
          c.checked = todas;
          c.disabled = todas;
        });
      };
    }
  },

  fecharFormulario() {
    const painel = document.getElementById('painel-form-usuario');
    if (painel) painel.style.display = 'none';
    this.usuarioEmEdicao = null;
  },

  async salvarFormulario() {
    const id = document.getElementById('usr-form-id').value;
    const login = document.getElementById('usr-form-login').value.trim();
    const nome = document.getElementById('usr-form-nome').value.trim();
    const cargo = document.getElementById('usr-form-cargo').value.trim();
    const perfil = document.getElementById('usr-form-perfil').value;
    const senha = document.getElementById('usr-form-senha').value;

    if (!login || !nome) {
      alert('Por favor, preencha o login e o nome completo.');
      return;
    }

    if (!id && !senha) {
      alert('Para novos usuários, a senha é obrigatória.');
      return;
    }

    // Coletar turmas selecionadas
    let turmas_permitidas = [];
    const chkTodas = document.getElementById('perm-todas-turmas').checked;
    if (chkTodas || perfil === 'master') {
      turmas_permitidas = ['*'];
    } else {
      document.querySelectorAll('.chk-turma-item:checked').forEach(c => {
        turmas_permitidas.push(c.value);
      });
    }

    const permissoes = {
      turmas_permitidas,
      pode_gerenciar_turmas: perfil === 'master' || document.getElementById('perm-pode-gerenciar-turmas').checked,
      pode_gerenciar_alunos: perfil === 'master' || document.getElementById('perm-pode-gerenciar-alunos').checked,
      pode_criar_vermelho: document.getElementById('perm-pode-vermelho').checked,
      pode_criar_verde: document.getElementById('perm-pode-verde').checked,
      pode_excluir_ocorrencia: document.getElementById('perm-pode-excluir').checked,
      pode_gerenciar_usuarios: perfil === 'master'
    };

    const dados = {
      login,
      nome,
      cargo,
      perfil,
      permissoes
    };

    if (senha) {
      dados.senha = senha;
    }

    try {
      if (id) {
        // Atualização
        await API.put(`/usuarios/${id}`, dados);
        alert('Usuário e permissões atualizados com sucesso!');
      } else {
        // Criação
        await API.post('/usuarios', dados);
        alert('Novo usuário criado com sucesso!');
      }

      this.fecharFormulario();
      await this.carregarUsuarios();
      await Auth.carregarOpcoesDemo();

      if (Auth.usuarioAtual && Auth.usuarioAtual.login === login) {
        await Auth.trocarPerfilDemo(login);
      }

    } catch (e) {
      alert('Erro ao salvar usuário: ' + e.message);
    }
  },

  async alternarStatus(id) {
    if (!confirm('Deseja realmente alterar o status (ativo/inativo) deste usuário?')) return;

    try {
      const res = await API.patch(`/usuarios/${id}/status`);
      alert(res.mensagem);
      await this.carregarUsuarios();
      await Auth.carregarOpcoesDemo();
    } catch (e) {
      alert('Erro ao alternar status: ' + e.message);
    }
  },

  // ========================================================================
  // GESTÃO DE TURMAS (Criação de novas turmas)
  // ========================================================================
  abrirModalNovaTurma() {
    if (!Auth.podeGerenciarTurmas()) {
      alert('Seu perfil não possui permissão para criar turmas.');
      return;
    }

    const overlay = document.getElementById('modal-criar-turma');
    if (!overlay) return;

    document.getElementById('turma-form-codigo').value = '';
    document.getElementById('turma-form-nome').value = 'Técnico em Processos Gráficos';
    document.getElementById('turma-form-modulo').value = '1º Módulo';
    document.getElementById('turma-form-periodo').value = 'Manhã';
    document.getElementById('turma-form-ano').value = '2026/1';
    document.getElementById('turma-form-sala').value = 'Laboratório de Impressão';

    overlay.classList.add('ativo');
  },

  fecharModalNovaTurma() {
    const overlay = document.getElementById('modal-criar-turma');
    if (overlay) overlay.classList.remove('ativo');
  },

  async salvarNovaTurma() {
    const codigo = document.getElementById('turma-form-codigo').value.trim().toUpperCase();
    const nome = document.getElementById('turma-form-nome').value.trim();
    const modulo = document.getElementById('turma-form-modulo').value.trim();
    const periodo = document.getElementById('turma-form-periodo').value;
    const ano_semestre = document.getElementById('turma-form-ano').value.trim();
    const sala = document.getElementById('turma-form-sala').value.trim();

    if (!codigo) {
      alert('Por favor, informe o código da turma (ex: GRAF1M, DEV3N).');
      return;
    }

    try {
      const res = await API.post('/turmas', {
        codigo,
        nome,
        modulo,
        periodo,
        ano_semestre,
        sala
      });

      alert(res.mensagem);
      this.fecharModalNovaTurma();

      // Recarregar turmas no carômetro e no painel admin
      await Carometro.carregarTurmas();
      Carometro.selecionarTurma(codigo);
      await this.carregarTurmasDisponiveis();

    } catch (e) {
      alert('Erro ao cadastrar turma: ' + e.message);
    }
  },

  // ========================================================================
  // GESTÃO DE ALUNOS (Cadastro Completo, Edição e Upload de Fotos)
  // ========================================================================
  abasFormAluno: ['escolar', 'pais', 'emergencia', 'pessoal'],
  abaFormAlunoAtiva: 'escolar',

  trocarAbaFormAluno(nomeAba) {
    if (!this.abasFormAluno.includes(nomeAba)) return;
    this.abaFormAlunoAtiva = nomeAba;

    // Atualizar botões de abas
    document.querySelectorAll('#form-aluno-abas .btn-form-aba').forEach(btn => {
      if (btn.dataset.formaba === nomeAba) {
        btn.classList.add('ativa');
      } else {
        btn.classList.remove('ativa');
      }
    });

    // Alternar painéis
    document.querySelectorAll('.painel-form-secao').forEach(painel => {
      painel.classList.remove('ativa');
    });

    const painelDestino = document.getElementById(`painel-form-aluno-${nomeAba}`);
    if (painelDestino) {
      painelDestino.classList.add('ativa');
    }
  },

  trocarAbaFormAlunoProxima() {
    const idx = this.abasFormAluno.indexOf(this.abaFormAlunoAtiva);
    if (idx < this.abasFormAluno.length - 1) {
      this.trocarAbaFormAluno(this.abasFormAluno[idx + 1]);
    }
  },

  trocarAbaFormAlunoAnterior() {
    const idx = this.abasFormAluno.indexOf(this.abaFormAlunoAtiva);
    if (idx > 0) {
      this.trocarAbaFormAluno(this.abasFormAluno[idx - 1]);
    }
  },

  formatarDataParaInput(dataStr) {
    if (!dataStr) return '2008-05-15';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      const [d, m, y] = dataStr.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return dataStr;
  },

  async abrirModalNovoAluno(turmaCodigoPref) {
    if (!Auth.podeGerenciarAlunos()) {
      alert('Seu perfil não possui permissão para cadastrar alunos.');
      return;
    }

    const overlay = document.getElementById('modal-criar-aluno');
    if (!overlay) return;

    // Título e botão em modo Criação
    const titulo = document.getElementById('modal-aluno-titulo');
    if (titulo) titulo.textContent = '👤 Cadastrar Novo Aluno';

    const btnSubmit = document.getElementById('btn-salvar-aluno-submit');
    if (btnSubmit) btnSubmit.textContent = '💾 Cadastrar Aluno';

    document.getElementById('aluno-form-id-edicao').value = '';

    // Preencher select de turmas
    const selectTurma = document.getElementById('aluno-form-turma');
    if (selectTurma) {
      selectTurma.innerHTML = '';
      const turmas = Carometro.turmas || [];
      turmas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.codigo;
        opt.textContent = `${t.codigo} - ${t.nome} (${t.periodo})`;
        if (turmaCodigoPref && turmaCodigoPref === t.codigo) {
          opt.selected = true;
        } else if (Carometro.turmaAtiva === t.codigo) {
          opt.selected = true;
        }
        selectTurma.appendChild(opt);
      });
    }

    // Resetar campos - Aba 1: Escolar
    document.getElementById('aluno-form-nome').value = '';
    document.getElementById('aluno-form-matricula').value = `25${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('aluno-form-data-nasc').value = '2008-05-15';
    document.getElementById('aluno-form-genero').value = 'Masculino';
    document.getElementById('aluno-form-rg').value = '';
    document.getElementById('aluno-form-cpf').value = '';
    document.getElementById('aluno-form-curso').value = 'Técnico em Processos Gráficos';
    document.getElementById('aluno-form-nivel').value = 'Nível Técnico';
    document.getElementById('aluno-form-empresa').value = '';
    document.getElementById('aluno-form-supervisor').value = 'Eng. Roberto Camargo';
    document.getElementById('aluno-form-regime').value = 'Jovem Aprendiz (Lei 10.097/2000)';
    document.getElementById('aluno-form-aapm').value = 'Sim';

    // Resetar campos - Aba 2: Pais & Endereço
    document.getElementById('aluno-form-resp-nome').value = '';
    document.getElementById('aluno-form-resp-parentesco').value = 'Mãe / Tutora Legal';
    document.getElementById('aluno-form-resp-tel').value = '';
    document.getElementById('aluno-form-resp-tel-com').value = '';
    document.getElementById('aluno-form-resp-email').value = '';
    document.getElementById('aluno-form-end-rua').value = 'Rua da Mooca, ';
    document.getElementById('aluno-form-end-bairro').value = 'Mooca';
    document.getElementById('aluno-form-end-cidade').value = 'São Paulo / SP';
    document.getElementById('aluno-form-end-cep').value = '03104-001';
    document.getElementById('aluno-form-autorizacao-saida').value = '';

    // Resetar campos - Aba 3: Emergência & Saúde
    document.getElementById('aluno-form-emergencia-1').value = '';
    document.getElementById('aluno-form-emergencia-2').value = '';
    document.getElementById('aluno-form-emergencia-3').value = '';
    document.getElementById('aluno-form-sangue').value = 'O+';
    document.getElementById('aluno-form-convenio').value = 'Amil Assistência Médica';
    document.getElementById('aluno-form-hospital').value = 'Hospital CEMA / São Cristóvão (Mooca)';
    document.getElementById('aluno-form-alergias').value = 'Nenhuma alergia grave relatada';
    document.getElementById('aluno-form-medicamentos').value = 'Nenhum';
    document.getElementById('aluno-form-obs-medicas').value = '';

    // Resetar campos - Aba 4: Perfil & Observações
    document.getElementById('aluno-form-perfil-comp').value = 'Aluno sociável, participativo e dedicado às atividades escolares.';
    document.getElementById('aluno-form-habilidades').value = 'Boa capacidade analítica, trabalho em equipe e agilidade prática.';
    document.getElementById('aluno-form-projetos').value = 'Projeto Integrador SENAI Theobaldo De Nigris.';
    document.getElementById('aluno-form-obs-coord').value = 'Acompanhamento pedagógico regular com bom rendimento.';

    this.fotoBase64Temp = '';
    const previewImg = document.getElementById('preview-foto-novo-aluno');
    if (previewImg) {
      previewImg.src = '/assets/fotos/aluno_2.svg';
    }

    const inputArquivo = document.getElementById('input-arquivo-foto-aluno');
    if (inputArquivo) inputArquivo.value = '';

    this.trocarAbaFormAluno('escolar');
    overlay.classList.add('ativo');
  },

  async abrirModalEditarAluno(aluno) {
    if (!Auth.podeGerenciarAlunos()) {
      alert('Seu perfil não possui permissão para editar dados de alunos.');
      return;
    }

    if (!aluno) return;

    const overlay = document.getElementById('modal-criar-aluno');
    if (!overlay) return;

    // Título e botão em modo Edição
    const titulo = document.getElementById('modal-aluno-titulo');
    if (titulo) titulo.textContent = `✏️ Editar Cadastro: ${aluno.nome}`;

    const btnSubmit = document.getElementById('btn-salvar-aluno-submit');
    if (btnSubmit) btnSubmit.textContent = '💾 Salvar Alterações';

    document.getElementById('aluno-form-id-edicao').value = aluno.id;

    // Preencher select de turmas
    const selectTurma = document.getElementById('aluno-form-turma');
    if (selectTurma) {
      selectTurma.innerHTML = '';
      const turmas = Carometro.turmas || [];
      turmas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.codigo;
        opt.textContent = `${t.codigo} - ${t.nome} (${t.periodo})`;
        if (aluno.turma_codigo === t.codigo) {
          opt.selected = true;
        }
        selectTurma.appendChild(opt);
      });
    }

    // Preencher campos - Aba 1: Escolar
    document.getElementById('aluno-form-nome').value = aluno.nome || '';
    document.getElementById('aluno-form-matricula').value = aluno.matricula || '';
    document.getElementById('aluno-form-data-nasc').value = this.formatarDataParaInput(aluno.data_nascimento);
    document.getElementById('aluno-form-genero').value = aluno.genero || 'Masculino';
    document.getElementById('aluno-form-rg').value = aluno.rg || '';
    document.getElementById('aluno-form-cpf').value = aluno.cpf || '';
    document.getElementById('aluno-form-curso').value = aluno.curso || 'Técnico em Processos Gráficos';
    document.getElementById('aluno-form-nivel').value = aluno.nivel || 'Nível Técnico';
    document.getElementById('aluno-form-empresa').value = aluno.empresa_aprendizagem || '';
    document.getElementById('aluno-form-supervisor').value = aluno.supervisor_empresa || 'Eng. Roberto Camargo';
    document.getElementById('aluno-form-regime').value = aluno.regime_contrato || 'Jovem Aprendiz (Lei 10.097/2000)';
    document.getElementById('aluno-form-aapm').value = aluno.contribuicoes_aapm || 'Sim';

    // Preencher campos - Aba 2: Pais & Endereço
    const tutores = aluno.tutores || {};
    const sobrenomes = aluno.nome.split(' ').slice(1).join(' ') || 'Responsável';

    document.getElementById('aluno-form-resp-nome').value = tutores.nome_responsavel || `Alice ${sobrenomes}`;
    document.getElementById('aluno-form-resp-parentesco').value = tutores.parentesco || 'Mãe / Tutora Legal';
    document.getElementById('aluno-form-resp-tel').value = tutores.telefone_responsavel || '(11) 98765-4321';
    document.getElementById('aluno-form-resp-tel-com').value = tutores.telefone_comercial || '(11) 3241-8890';
    document.getElementById('aluno-form-resp-email').value = tutores.email_responsavel || `responsavel.${aluno.matricula || 'aluno'}@provedor.com.br`;
    document.getElementById('aluno-form-end-rua').value = tutores.endereco_logradouro || 'Rua da Mooca, 1420 - Bloco B, Apto 52';
    document.getElementById('aluno-form-end-bairro').value = tutores.endereco_bairro || 'Mooca';
    document.getElementById('aluno-form-end-cidade').value = tutores.endereco_cidade || 'São Paulo / SP';
    document.getElementById('aluno-form-end-cep').value = tutores.endereco_cep || '03104-001';
    document.getElementById('aluno-form-autorizacao-saida').value = tutores.autorizacao_saida || `1) ${tutores.nome_responsavel || 'Alice ' + sobrenomes} (Mãe) - Autorização presencial e via mensagem celular cadastrado.`;

    // Preencher campos - Aba 3: Emergência & Saúde
    const emergencia = aluno.emergencia || {};
    document.getElementById('aluno-form-emergencia-1').value = emergencia.contato_emergencia_1 || tutores.telefone_responsavel || '(11) 98765-4321 (Mãe)';
    document.getElementById('aluno-form-emergencia-2').value = emergencia.contato_emergencia_2 || '(11) 99123-4567 (Pai / Alternativo)';
    document.getElementById('aluno-form-emergencia-3').value = emergencia.contato_emergencia_3 || (aluno.empresa_aprendizagem ? `RH / Tutor da Empresa: ${aluno.empresa_aprendizagem}` : '(11) 3320-1000 (RH da Empresa Parceira)');
    document.getElementById('aluno-form-sangue').value = emergencia.tipo_sanguineo || 'O+';
    document.getElementById('aluno-form-convenio').value = emergencia.convenio_medico || 'Amil Assistência Médica';
    document.getElementById('aluno-form-hospital').value = emergencia.hospital_preferencia || 'Hospital CEMA / São Cristóvão (Mooca)';
    document.getElementById('aluno-form-alergias').value = emergencia.alergias || 'Nenhuma alergia grave relatada';
    document.getElementById('aluno-form-medicamentos').value = emergencia.medicamentos || 'Nenhum';
    document.getElementById('aluno-form-obs-medicas').value = emergencia.observacoes_medicas || 'Óculos de grau para leitura nas aulas teóricas e práticas.';

    // Preencher campos - Aba 4: Perfil & Observações
    const pessoal = aluno.pessoal || {};
    document.getElementById('aluno-form-perfil-comp').value = pessoal.perfil_comportamental || 'Aluno sociável, participativo e dedicado às atividades escolares.';
    document.getElementById('aluno-form-habilidades').value = pessoal.habilidades_destaques || 'Boa capacidade analítica, trabalho em equipe e agilidade prática.';
    document.getElementById('aluno-form-projetos').value = pessoal.projetos_atividades || 'Projeto Integrador SENAI Theobaldo De Nigris e oficinas técnicas.';
    document.getElementById('aluno-form-obs-coord').value = pessoal.observacoes_coordenacao || 'Acompanhamento pedagógico com evolução satisfatória.';

    this.fotoBase64Temp = aluno.foto_url || '';
    const previewImg = document.getElementById('preview-foto-novo-aluno');
    if (previewImg) {
      previewImg.src = aluno.foto_url || '/assets/fotos/aluno_2.svg';
    }

    const inputArquivo = document.getElementById('input-arquivo-foto-aluno');
    if (inputArquivo) inputArquivo.value = '';

    this.trocarAbaFormAluno('escolar');
    overlay.classList.add('ativo');
  },

  fecharModalNovoAluno() {
    const overlay = document.getElementById('modal-criar-aluno');
    if (overlay) overlay.classList.remove('ativo');
    this.fotoBase64Temp = '';
    document.getElementById('aluno-form-id-edicao').value = '';
  },

  carregarPreviewFoto(inputElement, previewImgId) {
    const file = inputElement.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoBase64Temp = e.target.result;
      const previewImg = document.getElementById(previewImgId);
      if (previewImg) {
        previewImg.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  },

  async salvarNovoAluno() {
    const idEdicao = document.getElementById('aluno-form-id-edicao').value;

    const turma_codigo = document.getElementById('aluno-form-turma').value;
    const nome = document.getElementById('aluno-form-nome').value.trim();
    const matricula = document.getElementById('aluno-form-matricula').value.trim();
    const data_nascimento = document.getElementById('aluno-form-data-nasc').value;
    const genero = document.getElementById('aluno-form-genero').value;
    const rg = document.getElementById('aluno-form-rg').value.trim();
    const cpf = document.getElementById('aluno-form-cpf').value.trim();
    const curso = document.getElementById('aluno-form-curso').value.trim();
    const nivel = document.getElementById('aluno-form-nivel').value;
    const empresa_aprendizagem = document.getElementById('aluno-form-empresa').value.trim();
    const supervisor_empresa = document.getElementById('aluno-form-supervisor').value.trim();
    const regime_contrato = document.getElementById('aluno-form-regime').value.trim();
    const contribuicoes_aapm = document.getElementById('aluno-form-aapm').value;

    if (!nome) {
      alert('Por favor, informe o nome completo do aluno.');
      this.trocarAbaFormAluno('escolar');
      return;
    }

    if (!turma_codigo) {
      alert('Por favor, selecione a turma do aluno.');
      this.trocarAbaFormAluno('escolar');
      return;
    }

    // Coletar Dados dos Pais / Tutores e Endereço
    const tutores = {
      nome_responsavel: document.getElementById('aluno-form-resp-nome').value.trim(),
      parentesco: document.getElementById('aluno-form-resp-parentesco').value.trim(),
      telefone_responsavel: document.getElementById('aluno-form-resp-tel').value.trim(),
      telefone_comercial: document.getElementById('aluno-form-resp-tel-com').value.trim(),
      email_responsavel: document.getElementById('aluno-form-resp-email').value.trim(),
      endereco_logradouro: document.getElementById('aluno-form-end-rua').value.trim(),
      endereco_bairro: document.getElementById('aluno-form-end-bairro').value.trim(),
      endereco_cidade: document.getElementById('aluno-form-end-cidade').value.trim(),
      endereco_cep: document.getElementById('aluno-form-end-cep').value.trim(),
      autorizacao_saida: document.getElementById('aluno-form-autorizacao-saida').value.trim()
    };

    // Coletar Dados de Emergência e Saúde
    const emergencia = {
      contato_emergencia_1: document.getElementById('aluno-form-emergencia-1').value.trim(),
      contato_emergencia_2: document.getElementById('aluno-form-emergencia-2').value.trim(),
      contato_emergencia_3: document.getElementById('aluno-form-emergencia-3').value.trim(),
      tipo_sanguineo: document.getElementById('aluno-form-sangue').value,
      convenio_medico: document.getElementById('aluno-form-convenio').value.trim(),
      hospital_preferencia: document.getElementById('aluno-form-hospital').value.trim(),
      alergias: document.getElementById('aluno-form-alergias').value.trim(),
      medicamentos: document.getElementById('aluno-form-medicamentos').value.trim(),
      observacoes_medicas: document.getElementById('aluno-form-obs-medicas').value.trim()
    };

    // Coletar Perfil e Observações
    const pessoal = {
      perfil_comportamental: document.getElementById('aluno-form-perfil-comp').value.trim(),
      habilidades_destaques: document.getElementById('aluno-form-habilidades').value.trim(),
      projetos_atividades: document.getElementById('aluno-form-projetos').value.trim(),
      observacoes_coordenacao: document.getElementById('aluno-form-obs-coord').value.trim()
    };

    const payload = {
      turma_codigo,
      nome,
      matricula,
      data_nascimento,
      genero,
      rg,
      cpf,
      curso,
      nivel,
      empresa_aprendizagem,
      supervisor_empresa,
      regime_contrato,
      contribuicoes_aapm,
      tutores,
      emergencia,
      pessoal
    };

    if (this.fotoBase64Temp) {
      payload.foto_url = this.fotoBase64Temp;
    }

    try {
      if (idEdicao) {
        // Modo Edição
        const res = await API.put(`/alunos/${idEdicao}`, payload);
        alert(res.mensagem || 'Dados do aluno atualizados com sucesso!');

        // Atualizar ficha se estiver aberta com este aluno
        if (ModalDetalhes.alunoAtual && ModalDetalhes.alunoAtual.id === idEdicao) {
          const resDetalhe = await API.get(`/alunos/${idEdicao}`);
          ModalDetalhes.alunoAtual = resDetalhe.aluno;
          ModalDetalhes.renderizar();
        }
      } else {
        // Modo Novo Aluno
        const res = await API.post('/alunos', payload);
        alert(res.mensagem || 'Aluno cadastrado com sucesso!');
      }

      this.fecharModalNovoAluno();

      // Recarregar carômetro na turma onde o aluno está
      if (Carometro.turmaAtiva !== turma_codigo) {
        Carometro.selecionarTurma(turma_codigo);
      } else {
        await Carometro.carregarAlunos();
      }

    } catch (e) {
      alert('Erro ao salvar aluno: ' + e.message);
    }
  },

  // ========================================================================
  // TROCA / ATUALIZAÇÃO DE FOTO DO ALUNO
  // ========================================================================
  abrirModalAlterarFoto(aluno) {
    if (!Auth.podeGerenciarAlunos()) {
      alert('Seu perfil não possui permissão para alterar fotos de alunos.');
      return;
    }

    this.alunoEmEdicaoFoto = aluno;
    this.fotoBase64Temp = '';

    const overlay = document.getElementById('modal-alterar-foto');
    if (!overlay) return;

    document.getElementById('alterar-foto-nome-aluno').textContent = aluno.nome;
    const preview = document.getElementById('preview-alterar-foto');
    if (preview) {
      preview.src = aluno.foto_url || '/assets/fotos/aluno_2.svg';
    }

    const inputFile = document.getElementById('input-arquivo-troca-foto');
    if (inputFile) inputFile.value = '';

    overlay.classList.add('ativo');
  },

  fecharModalAlterarFoto() {
    const overlay = document.getElementById('modal-alterar-foto');
    if (overlay) overlay.classList.remove('ativo');
    this.alunoEmEdicaoFoto = null;
    this.fotoBase64Temp = '';
  },

  async salvarAlterarFoto() {
    if (!this.alunoEmEdicaoFoto) return;

    if (!this.fotoBase64Temp) {
      alert('Por favor, selecione um arquivo de foto para carregar.');
      return;
    }

    try {
      const res = await API.put(`/alunos/${this.alunoEmEdicaoFoto.id}`, {
        foto_url: this.fotoBase64Temp
      });

      alert('Foto do aluno atualizada com sucesso!');

      // Atualizar no modal de detalhes
      if (ModalDetalhes.alunoAtual && ModalDetalhes.alunoAtual.id === this.alunoEmEdicaoFoto.id) {
        ModalDetalhes.alunoAtual.foto_url = this.fotoBase64Temp;
        const elFoto = document.getElementById('ficha-aluno-foto');
        if (elFoto) elFoto.src = this.fotoBase64Temp;
      }

      this.fecharModalAlterarFoto();

      // Recarregar carômetro para exibir foto nova imediatamente
      await Carometro.carregarAlunos();

    } catch (e) {
      alert('Erro ao atualizar foto: ' + e.message);
    }
  }
};
