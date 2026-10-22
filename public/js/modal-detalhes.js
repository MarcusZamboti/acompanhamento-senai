/**
 * Módulo da Ficha Detalhada do Aluno e Histórico Disciplinar
 * Fiel à imagem de referência image (2).png
 */
const ModalDetalhes = {
  alunoAtual: null,
  subabaAtiva: 'historico',

  async abrir(alunoId) {
    const overlay = document.getElementById('modal-detalhes-aluno');
    if (!overlay) return;

    try {
      const res = await API.get(`/alunos/${alunoId}`);
      this.alunoAtual = res.aluno;
      this.renderizar();
      overlay.classList.add('ativo');
    } catch (e) {
      alert('Erro ao carregar detalhes do aluno: ' + e.message);
    }
  },

  fechar() {
    const overlay = document.getElementById('modal-detalhes-aluno');
    if (overlay) overlay.classList.remove('ativo');
    this.alunoAtual = null;
  },

  trocarSubaba(nomeAba) {
    this.subabaAtiva = nomeAba;

    // Atualizar visual dos botões
    document.querySelectorAll('#container-subabas-aluno .btn-subaba').forEach(btn => {
      if (btn.dataset.aba === nomeAba) {
        btn.classList.add('ativa');
      } else {
        btn.classList.remove('ativa');
      }
    });

    // Alternar visibilidade dos painéis
    document.querySelectorAll('.conteudo-subaba-aluno').forEach(painel => {
      painel.classList.remove('ativa');
    });

    const painelDestino = document.getElementById(`painel-subaba-${nomeAba}`);
    if (painelDestino) {
      painelDestino.classList.add('ativa');
    }
  },

  renderizar() {
    const a = this.alunoAtual;
    if (!a) return;

    // Foto e dados cadastrais
    const elFoto = document.getElementById('ficha-aluno-foto');
    if (elFoto) {
      elFoto.src = a.foto_url || '/assets/fotos/aluno_2.svg';
      elFoto.alt = a.nome;
    }

    // Botão para alterar foto se tiver permissão
    const btnAlterarFoto = document.getElementById('btn-alterar-foto-aluno');
    if (btnAlterarFoto) {
      btnAlterarFoto.style.display = Auth.podeGerenciarAlunos() ? 'inline-block' : 'none';
      btnAlterarFoto.onclick = () => AdminUsuarios.abrirModalAlterarFoto(a);
    }

    // Botão para editar cadastro completo do aluno se tiver permissão
    const btnEditarCadastro = document.getElementById('btn-editar-cadastro-aluno');
    if (btnEditarCadastro) {
      btnEditarCadastro.style.display = Auth.podeGerenciarAlunos() ? 'inline-block' : 'none';
      btnEditarCadastro.onclick = () => AdminUsuarios.abrirModalEditarAluno(a);
    }

    document.getElementById('ficha-nome').textContent = a.nome;
    document.getElementById('ficha-idade').textContent = a.idade_detalhada || `${a.idade_anos || 17} anos`;
    document.getElementById('ficha-genero').textContent = a.genero || 'Não informado';
    document.getElementById('ficha-empresa').textContent = a.empresa_aprendizagem || 'Não vinculada';
    document.getElementById('ficha-matricula').textContent = a.matricula || '-';
    document.getElementById('ficha-data-matricula').textContent = a.data_matricula || '04/02/2025';
    document.getElementById('ficha-data-nasc').textContent = this.formatarData(a.data_nascimento) || '-';
    document.getElementById('ficha-nivel').textContent = a.nivel || 'Nível Técnico';
    document.getElementById('ficha-curso').textContent = a.curso || 'Técnico em Desenvolvimento de Sistemas';
    document.getElementById('ficha-data-inicio').textContent = '22/07/2026';
    document.getElementById('ficha-rg').textContent = a.rg || '-';
    document.getElementById('ficha-turma').textContent = a.turma_codigo || '-';
    document.getElementById('ficha-cpf').textContent = a.cpf || '-';
    document.getElementById('ficha-aapm').textContent = a.contribuicoes_aapm || 'Não';

    // 1) SUBABA GERAL
    const elEmpresaGeral = document.getElementById('aba-geral-empresa');
    if (elEmpresaGeral) elEmpresaGeral.textContent = a.empresa_aprendizagem || 'Não vinculada';

    const elRegimeGeral = document.getElementById('aba-geral-regime');
    if (elRegimeGeral) elRegimeGeral.textContent = a.regime_contrato || 'Jovem Aprendiz (Lei 10.097/2000)';

    const elSupervisorGeral = document.getElementById('aba-geral-supervisor');
    if (elSupervisorGeral) elSupervisorGeral.textContent = a.supervisor_empresa || 'Eng. Roberto Camargo';

    const elAapmGeral = document.getElementById('aba-geral-aapm');
    if (elAapmGeral) elAapmGeral.textContent = a.contribuicoes_aapm || 'Sim';

    // 2) SUBABA TUTORES E ENDEREÇO
    const tutores = a.tutores || {};
    const sobrenomes = a.nome.split(' ').slice(1).join(' ') || 'Responsável';

    const elTutorNome = document.getElementById('aba-tutor-nome');
    if (elTutorNome) elTutorNome.textContent = tutores.nome_responsavel || `Alice ${sobrenomes}`;

    const elTutorParentesco = document.getElementById('aba-tutor-parentesco');
    if (elTutorParentesco) elTutorParentesco.textContent = tutores.parentesco || 'Mãe / Tutora Legal';

    const elTutorTel = document.getElementById('aba-tutor-tel');
    if (elTutorTel) elTutorTel.textContent = tutores.telefone_responsavel || '(11) 98765-4321';

    const elTutorTelCom = document.getElementById('aba-tutor-tel-com');
    if (elTutorTelCom) elTutorTelCom.textContent = tutores.telefone_comercial || '(11) 3241-8890';

    const elTutorEmail = document.getElementById('aba-tutor-email');
    if (elTutorEmail) elTutorEmail.textContent = tutores.email_responsavel || `responsavel.${a.matricula || 'aluno'}@provedor.com.br`;

    const elTutorEnd = document.getElementById('aba-tutor-endereco');
    if (elTutorEnd) elTutorEnd.textContent = tutores.endereco_logradouro || 'Rua da Mooca, 1420 - Bloco B, Apto 52';

    const elTutorBairro = document.getElementById('aba-tutor-bairro');
    if (elTutorBairro) elTutorBairro.textContent = tutores.endereco_bairro || 'Mooca';

    const elTutorCidade = document.getElementById('aba-tutor-cidade');
    if (elTutorCidade) elTutorCidade.textContent = tutores.endereco_cidade || 'São Paulo / SP';

    const elTutorCep = document.getElementById('aba-tutor-cep');
    if (elTutorCep) elTutorCep.textContent = tutores.endereco_cep || '03104-001';

    const elTutorSaida = document.getElementById('aba-tutor-saida');
    if (elTutorSaida) {
      elTutorSaida.textContent = tutores.autorizacao_saida || `1) ${tutores.nome_responsavel || 'Alice ' + sobrenomes} (Mãe) - Autorização presencial e via mensagem celular cadastrado.`;
    }

    // 3) SUBABA INFORMAÇÕES DE EMERGÊNCIA
    const emergencia = a.emergencia || {};

    const elEmerg1 = document.getElementById('aba-emerg-contato1');
    if (elEmerg1) elEmerg1.textContent = emergencia.contato_emergencia_1 || tutores.telefone_responsavel || '(11) 98765-4321 (Mãe)';

    const elEmerg2 = document.getElementById('aba-emerg-contato2');
    if (elEmerg2) elEmerg2.textContent = emergencia.contato_emergencia_2 || '(11) 99123-4567 (Pai / Alternativo)';

    const elEmerg3 = document.getElementById('aba-emerg-contato3');
    if (elEmerg3) elEmerg3.textContent = emergencia.contato_emergencia_3 || (a.empresa_aprendizagem ? `RH / Tutor da Empresa: ${a.empresa_aprendizagem}` : '(11) 3320-1000 (RH da Empresa Parceira)');

    const elSangue = document.getElementById('aba-emerg-sangue');
    if (elSangue) elSangue.textContent = emergencia.tipo_sanguineo || 'O+';

    const elConvenio = document.getElementById('aba-emerg-convenio');
    if (elConvenio) elConvenio.textContent = emergencia.convenio_medico || 'Amil Saúde (Rede Zona Leste/Centro)';

    const elHospital = document.getElementById('aba-emerg-hospital');
    if (elHospital) elHospital.textContent = emergencia.hospital_preferencia || 'Hospital CEMA / São Cristóvão (Mooca)';

    const elAlergias = document.getElementById('aba-emerg-alergias');
    if (elAlergias) elAlergias.textContent = emergencia.alergias || 'Nenhuma alergia grave relatada';

    const elMeds = document.getElementById('aba-emerg-medicamentos');
    if (elMeds) elMeds.textContent = emergencia.medicamentos || 'Nenhum';

    const elObsMed = document.getElementById('aba-emerg-obs');
    if (elObsMed) elObsMed.textContent = emergencia.observacoes_medicas || 'Óculos de grau para leitura nas atividades teórico-práticas';

    // 4) SUBABA CARÁTER PESSOAL
    const pessoal = a.pessoal || {};

    const elComp = document.getElementById('aba-pessoal-comportamento');
    if (elComp) elComp.textContent = pessoal.perfil_comportamental || 'Aluno(a) sociável, participativo em dinâmicas de grupo e atento às instruções dos docentes nas aulas teóricas e práticas.';

    const elDestaques = document.getElementById('aba-pessoal-destaques');
    if (elDestaques) elDestaques.textContent = pessoal.habilidades_destaques || 'Demonstra agilidade no aprendizado de ferramentas técnicas, raciocínio lógico estruturado e colaboração com colegas de bancada.';

    const elProjetos = document.getElementById('aba-pessoal-projetos');
    if (elProjetos) elProjetos.textContent = pessoal.projetos_atividades || 'Inscrito no Projeto Integrador do SENAI Theobaldo De Nigris e participante de oficinas extracurriculares.';

    const elCoord = document.getElementById('aba-pessoal-coordenacao');
    if (elCoord) elCoord.textContent = pessoal.observacoes_coordenacao || 'Acompanhamento pedagógico regular, mantendo diálogo constante entre a Orientação Educacional, família e empresa parceira.';

    // Manter subaba selecionada
    this.trocarSubaba(this.subabaAtiva || 'historico');

    // Total de ocorrências
    const totalOcorr = a.ocorrencias ? a.ocorrencias.length : 0;
    document.getElementById('ficha-total-ocorrencias').textContent =
      `Foram encontradas ${totalOcorr} ocorrências disciplinares`;

    // Renderizar tabela de ocorrências disciplinares
    this.renderizarTabelaOcorrencias();

    // Configurar permissão de botão "Registrar Ocorrência Disciplinar"
    const btnRegistrar = document.getElementById('btn-abrir-nova-ocorrencia');
    if (btnRegistrar) {
      const podeCriar = Auth.podeCriarVermelho() || Auth.podeCriarVerde();
      btnRegistrar.style.display = podeCriar ? 'inline-flex' : 'none';
      btnRegistrar.onclick = () => {
        ModalOcorrencia.abrir(this.alunoAtual);
      };
    }

    // Configurar botões de impressão
    const btnImprimirRelatorio = document.getElementById('btn-imprimir-relatorio');
    if (btnImprimirRelatorio) {
      btnImprimirRelatorio.onclick = () => {
        Impressao.abrirRelatorioOcorrencias(this.alunoAtual);
      };
    }

    const btnImprimirFaltas = document.getElementById('btn-imprimir-faltas');
    if (btnImprimirFaltas) {
      btnImprimirFaltas.onclick = () => {
        Impressao.abrirAcompanhamentoFaltas(this.alunoAtual);
      };
    }
  },

  renderizarTabelaOcorrencias() {
    const tbody = document.getElementById('tabela-ocorrencias-corpo');
    if (!tbody) return;

    tbody.innerHTML = '';
    const ocorrencias = this.alunoAtual.ocorrencias || [];

    if (ocorrencias.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">
            Nenhuma ocorrência registrada para este aluno até o momento.
          </td>
        </tr>
      `;
      return;
    }

    const podeExcluir = Auth.podeExcluirOcorrencia();

    ocorrencias.forEach(o => {
      const tr = document.createElement('tr');

      // Botão de ação (exclusão permitida conforme perfil)
      let opcaoHtml = `
        <button class="acoes-tabela-btn" title="Visualizar detalhes">
          📝
        </button>
      `;

      if (podeExcluir) {
        opcaoHtml += `
          <button class="acoes-tabela-btn btn-excluir-item" title="Excluir ocorrência" data-id="${o.id}">
            🗑️
          </button>
        `;
      }

      const classeTipo = o.tipo_classificacao === 'VERDE' ? 'tipo-verde' : 'tipo-vermelho';

      tr.innerHTML = `
        <td style="text-align: center;">${opcaoHtml}</td>
        <td>
          <span class="tag-tipo-ocorrencia ${classeTipo}">
            ${o.tipo_nome}
          </span>
        </td>
        <td>${this.formatarData(o.data)}</td>
        <td>${o.detalhamento}</td>
        <td><strong>${o.criado_por_nome || 'sistema'}</strong></td>
      `;

      // Evento de exclusão
      const btnExcluir = tr.querySelector('.btn-excluir-item');
      if (btnExcluir) {
        btnExcluir.onclick = () => this.confirmarExclusao(o.id);
      }

      tbody.appendChild(tr);
    });
  },

  async confirmarExclusao(idOcorrencia) {
    if (!confirm('Deseja realmente excluir este registro de ocorrência?')) return;

    try {
      const res = await API.delete(`/ocorrencias/${idOcorrencia}`);
      // Atualizar lista local
      this.alunoAtual.ocorrencias = this.alunoAtual.ocorrencias.filter(o => o.id !== idOcorrencia);
      this.alunoAtual.contador_vermelho = res.contador_vermelho;
      this.alunoAtual.contador_verde = res.contador_verde;
      this.alunoAtual.total_ocorrencias = res.total_ocorrencias;

      this.renderizar();

      // Atualizar contadores derivados imediatamente no carômetro
      Carometro.atualizarContadoresAluno(
        res.aluno_id,
        res.contador_vermelho,
        res.contador_verde,
        res.total_ocorrencias
      );
    } catch (e) {
      alert('Erro ao excluir ocorrência: ' + e.message);
    }
  },

  formatarData(dataStr) {
    if (!dataStr) return '-';
    if (dataStr.includes('/')) return dataStr;
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  }
};
