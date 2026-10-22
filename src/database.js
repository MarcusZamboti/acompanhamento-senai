const fs = require('fs');
const path = require('path');
const config = require('./config');

class BancoDeDados {
  constructor() {
    this.caminho = config.CAMINHO_BANCO;
    this.dados = null;
    this.carregar();
  }

  carregar() {
    try {
      if (!fs.existsSync(this.caminho)) {
        throw new Error(`Arquivo de banco não encontrado em: ${this.caminho}`);
      }
      const raw = fs.readFileSync(this.caminho, 'utf-8');
      this.dados = JSON.parse(raw);
    } catch (erro) {
      console.error('Erro ao ler banco de dados JSON:', erro);
      throw erro;
    }
  }

  salvar() {
    try {
      const conteudo = JSON.stringify(this.dados, null, 2);
      // Gravação atômica via arquivo temporário para evitar corrupção
      const tempPath = `${this.caminho}.tmp`;
      fs.writeFileSync(tempPath, conteudo, 'utf-8');
      fs.renameSync(tempPath, this.caminho);
    } catch (erro) {
      console.error('Erro ao persistir banco de dados JSON:', erro);
      throw erro;
    }
  }

  // --- MÉTODOS DE USUÁRIO ---
  obterTodosUsuarios() {
    return this.dados.usuarios.map(u => {
      const { senha_hash, ...resto } = u;
      return resto;
    });
  }

  obterUsuarioPorLogin(login) {
    return this.dados.usuarios.find(u => u.login.toLowerCase() === login.toLowerCase());
  }

  obterUsuarioPorId(id) {
    const u = this.dados.usuarios.find(u => u.id === id);
    if (!u) return null;
    const { senha_hash, ...resto } = u;
    return resto;
  }

  criarUsuario({ login, nome, cargo, perfil, senha_hash, permissoes }) {
    const jaExiste = this.obterUsuarioPorLogin(login);
    if (jaExiste) {
      throw new Error(`O login "${login}" já está em uso.`);
    }

    const novoUsuario = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      login: login.trim(),
      nome: nome.trim(),
      cargo: cargo ? cargo.trim() : 'Colaborador',
      perfil: perfil || 'professor',
      senha_hash,
      ativo: true,
      permissoes: {
        turmas_permitidas: permissoes?.turmas_permitidas || ['*'],
        pode_gerenciar_turmas: perfil === 'master' || !!permissoes?.pode_gerenciar_turmas,
        pode_gerenciar_alunos: perfil === 'master' || !!permissoes?.pode_gerenciar_alunos,
        pode_criar_vermelho: !!permissoes?.pode_criar_vermelho,
        pode_criar_verde: !!permissoes?.pode_criar_verde,
        pode_excluir_ocorrencia: !!permissoes?.pode_excluir_ocorrencia,
        pode_gerenciar_usuarios: perfil === 'master' || !!permissoes?.pode_gerenciar_usuarios
      }
    };

    this.dados.usuarios.push(novoUsuario);
    this.salvar();
    const { senha_hash: _, ...retorno } = novoUsuario;
    return retorno;
  }

  atualizarUsuario(id, dadosAtualizacao) {
    const idx = this.dados.usuarios.findIndex(u => u.id === id);
    if (idx === -1) {
      throw new Error('Usuário não encontrado.');
    }

    const atual = this.dados.usuarios[idx];

    // Impedir desativar ou remover o último master
    if (atual.login === 'master' && dadosAtualizacao.ativo === false) {
      throw new Error('O usuário master principal não pode ser desativado.');
    }

    // Se login foi alterado, verificar duplicidade
    if (dadosAtualizacao.login && dadosAtualizacao.login.toLowerCase() !== atual.login.toLowerCase()) {
      const conflito = this.obterUsuarioPorLogin(dadosAtualizacao.login);
      if (conflito) throw new Error(`O login "${dadosAtualizacao.login}" já está em uso.`);
      atual.login = dadosAtualizacao.login.trim();
    }

    if (dadosAtualizacao.nome) atual.nome = dadosAtualizacao.nome.trim();
    if (dadosAtualizacao.cargo) atual.cargo = dadosAtualizacao.cargo.trim();
    if (dadosAtualizacao.perfil) atual.perfil = dadosAtualizacao.perfil;
    if (typeof dadosAtualizacao.ativo === 'boolean') atual.ativo = dadosAtualizacao.ativo;
    if (dadosAtualizacao.senha_hash) atual.senha_hash = dadosAtualizacao.senha_hash;

    if (dadosAtualizacao.permissoes) {
      atual.permissoes = {
        ...atual.permissoes,
        ...dadosAtualizacao.permissoes
      };
    }

    this.salvar();
    const { senha_hash: _, ...retorno } = atual;
    return retorno;
  }

  alternarStatusUsuario(id) {
    const usuario = this.dados.usuarios.find(u => u.id === id);
    if (!usuario) throw new Error('Usuário não encontrado.');
    if (usuario.login === 'master') throw new Error('O usuário master não pode ser desativado.');
    usuario.ativo = !usuario.ativo;
    this.salvar();
    const { senha_hash, ...resto } = usuario;
    return resto;
  }

  // --- MÉTODOS DE TURMAS ---
  obterTurmasPermitidas(usuario) {
    if (!usuario || !usuario.permissoes) return [];

    const permitidas = usuario.permissoes.turmas_permitidas || [];
    if (permitidas.includes('*') || usuario.perfil === 'master') {
      return this.dados.turmas;
    }

    return this.dados.turmas.filter(t => permitidas.includes(t.codigo));
  }

  obterTurmaPorCodigo(codigo) {
    return this.dados.turmas.find(t => t.codigo.toUpperCase() === codigo.toUpperCase()) || null;
  }

  criarTurma({ codigo, nome, modulo, periodo, ano_semestre, sala }) {
    const codLimpo = (codigo || '').trim().toUpperCase();
    if (!codLimpo) throw new Error('Código da turma é obrigatório.');

    const jaExiste = this.dados.turmas.some(t => t.codigo.toUpperCase() === codLimpo);
    if (jaExiste) throw new Error(`A turma com código "${codLimpo}" já existe.`);

    const novaTurma = {
      id: `turma_${codLimpo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      codigo: codLimpo,
      nome: (nome || 'Técnico SENAI').trim(),
      modulo: (modulo || '1º Módulo').trim(),
      periodo: (periodo || 'Manhã').trim(),
      ano_semestre: (ano_semestre || '2026/1').trim(),
      sala: (sala || 'Sala de Aula').trim()
    };

    this.dados.turmas.push(novaTurma);
    this.salvar();
    return novaTurma;
  }

  atualizarTurma(codigo, dados) {
    const idx = this.dados.turmas.findIndex(t => t.codigo.toUpperCase() === codigo.toUpperCase());
    if (idx === -1) throw new Error('Turma não encontrada.');

    const atual = this.dados.turmas[idx];
    if (dados.nome) atual.nome = dados.nome.trim();
    if (dados.modulo) atual.modulo = dados.modulo.trim();
    if (dados.periodo) atual.periodo = dados.periodo.trim();
    if (dados.ano_semestre) atual.ano_semestre = dados.ano_semestre.trim();
    if (dados.sala) atual.sala = dados.sala.trim();

    this.salvar();
    return atual;
  }

  // --- MÉTODOS DE ALUNOS COM CONTADORES DERIVADOS ---
  calcularIdade(dataNasc) {
    if (!dataNasc) return { anos: 17, texto: '17 anos' };
    const hoje = new Date(2026, 9, 22); // Data de referência da aplicação (outubro 2026)
    const nasc = new Date(dataNasc);
    
    let anos = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth() - nasc.getMonth();
    let dias = hoje.getDate() - nasc.getDate();

    if (dias < 0) {
      meses--;
      dias += 30;
    }
    if (meses < 0) {
      anos--;
      meses += 12;
    }

    return {
      anos,
      meses,
      dias,
      textoFormatado: `${anos} anos, ${meses} meses e ${dias} dias`,
      textoCurto: `${anos} anos`
    };
  }

  obterAlunosPorTurma(codigoTurma, usuarioLogado) {
    let alunos = [];
    if (codigoTurma.toUpperCase() === 'TODAS') {
      // Filtrar todas as turmas que o usuário tem acesso
      const turmasPermitidas = this.obterTurmasPermitidas(usuarioLogado).map(t => t.codigo);
      alunos = this.dados.alunos.filter(a => turmasPermitidas.includes(a.turma_codigo));
    } else {
      alunos = this.dados.alunos.filter(a => a.turma_codigo.toUpperCase() === codigoTurma.toUpperCase());
    }

    // DERIVAÇÃO DINÂMICA DOS CONTADORES:
    // Nunca pegamos valores prontos; contamos diretamente no array de ocorrências!
    return alunos.map(aluno => {
      const ocorrenciasAluno = this.dados.ocorrencias.filter(o => o.aluno_id === aluno.id);
      
      const contador_vermelho = ocorrenciasAluno.filter(o => o.tipo_classificacao === 'VERMELHO').length;
      const contador_verde = ocorrenciasAluno.filter(o => o.tipo_classificacao === 'VERDE').length;
      const total_ocorrencias = ocorrenciasAluno.length;
      const idadeInfo = this.calcularIdade(aluno.data_nascimento);

      return {
        ...aluno,
        contador_vermelho,
        contador_verde,
        total_ocorrencias,
        idade_anos: idadeInfo.anos,
        idade_texto: idadeInfo.textoCurto,
        idade_detalhada: idadeInfo.textoFormatado
      };
    });
  }

  obterAlunoPorId(alunoId) {
    const aluno = this.dados.alunos.find(a => a.id === alunoId);
    if (!aluno) return null;

    const ocorrencias = this.dados.ocorrencias
      .filter(o => o.aluno_id === alunoId)
      .sort((a, b) => new Date(b.data + 'T' + (b.hora || '00:00')) - new Date(a.data + 'T' + (a.hora || '00:00')));

    const contador_vermelho = ocorrencias.filter(o => o.tipo_classificacao === 'VERMELHO').length;
    const contador_verde = ocorrencias.filter(o => o.tipo_classificacao === 'VERDE').length;
    const idadeInfo = this.calcularIdade(aluno.data_nascimento);

    const turma = this.dados.turmas.find(t => t.codigo === aluno.turma_codigo);

    const sobrenome = aluno.nome.split(' ').slice(1).join(' ') || 'Responsável';
    const tutores = {
      nome_responsavel: aluno.tutores?.nome_responsavel || `Alice ${sobrenome}`,
      parentesco: aluno.tutores?.parentesco || 'Mãe / Responsável Legal',
      telefone_responsavel: aluno.tutores?.telefone_responsavel || '(11) 98765-4321',
      telefone_comercial: aluno.tutores?.telefone_comercial || '(11) 3241-8890',
      email_responsavel: aluno.tutores?.email_responsavel || `responsavel.${aluno.matricula}@provedor.com.br`,
      endereco_logradouro: aluno.tutores?.endereco_logradouro || 'Rua da Mooca, 1420 - Bloco B, Apto 52',
      endereco_bairro: aluno.tutores?.endereco_bairro || 'Mooca',
      endereco_cidade: aluno.tutores?.endereco_cidade || 'São Paulo / SP',
      endereco_cep: aluno.tutores?.endereco_cep || '03104-001',
      autorizacao_saida: aluno.tutores?.autorizacao_saida || `Alice ${sobrenome} (Mãe) e Marcos ${sobrenome} (Pai)`
    };

    const emergencia = {
      contato_emergencia_1: aluno.emergencia?.contato_emergencia_1 || `Alice ${sobrenome} (Mãe) - (11) 98765-4321`,
      contato_emergencia_2: aluno.emergencia?.contato_emergencia_2 || `Marcos ${sobrenome} (Pai) - (11) 99123-4567`,
      tipo_sanguineo: aluno.emergencia?.tipo_sanguineo || 'O+',
      convenio_medico: aluno.emergencia?.convenio_medico || 'Amil Saúde (Rede Zona Leste/Centro)',
      hospital_preferencia: aluno.emergencia?.hospital_preferencia || 'Hospital CEMA / São Cristóvão (Mooca)',
      alergias: aluno.emergencia?.alergias || 'Nenhuma alergia grave relatada',
      medicamentos: aluno.emergencia?.medicamentos || 'Nenhum',
      observacoes_medicas: aluno.emergencia?.observacoes_medicas || 'Encaminhar à OE em caso de indisposição.'
    };

    const pessoal = {
      perfil_comportamental: aluno.pessoal?.perfil_comportamental || 'Aluno sociável, pontual e participativo nas aulas teóricas e oficinas práticas.',
      habilidades_destaques: aluno.pessoal?.habilidades_destaques || 'Raciocínio lógico, boa comunicação e colaboração em projetos de equipe.',
      projetos_atividades: aluno.pessoal?.projetos_atividades || 'Projeto Integrador SENAI Theobaldo De Nigris e feiras tecnológicas.',
      observacoes_coordenacao: aluno.pessoal?.observacoes_coordenacao || 'Acompanhamento pedagógico regular com evolução satisfatória.'
    };

    return {
      ...aluno,
      tutores,
      emergencia,
      pessoal,
      supervisor_empresa: aluno.supervisor_empresa || 'Eng. Roberto Camargo',
      regime_contrato: aluno.regime_contrato || 'Jovem Aprendiz (Lei 10.097/2000)',
      turma_detalhe: turma,
      contador_vermelho,
      contador_verde,
      total_ocorrencias: ocorrencias.length,
      idade_detalhada: idadeInfo.textoFormatado,
      idade_anos: idadeInfo.anos,
      ocorrencias
    };
  }

  criarAluno(dados) {
    if (!dados.nome || !dados.nome.trim()) throw new Error('Nome do aluno é obrigatório.');
    if (!dados.turma_codigo) throw new Error('Código da turma é obrigatório.');

    const turmaExiste = this.dados.turmas.some(t => t.codigo.toUpperCase() === dados.turma_codigo.toUpperCase());
    if (!turmaExiste) throw new Error(`Turma "${dados.turma_codigo}" não cadastrada.`);

    const novoAluno = {
      id: `aluno_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      turma_codigo: dados.turma_codigo.toUpperCase(),
      matricula: dados.matricula ? dados.matricula.trim() : `25${Math.floor(100000 + Math.random() * 900000)}`,
      nome: dados.nome.trim().toUpperCase(),
      foto_url: dados.foto_url || '/assets/fotos/aluno_2.svg',
      data_nascimento: dados.data_nascimento || '2008-01-01',
      data_matricula: dados.data_matricula || '02/02/2026',
      genero: dados.genero || 'Masculino',
      curso: dados.curso || 'Técnico SENAI Theobaldo De Nigris',
      nivel: dados.nivel || 'Nível Técnico',
      rg: dados.rg || '',
      cpf: dados.cpf || '',
      empresa_aprendizagem: dados.empresa_aprendizagem || '',
      contribuicoes_aapm: dados.contribuicoes_aapm || 'Sim',

      // Informações dos Tutores / Responsáveis e Endereço
      tutores: {
        nome_responsavel: dados.tutores?.nome_responsavel || dados.nome_responsavel || '',
        parentesco: dados.tutores?.parentesco || dados.parentesco_responsavel || 'Mãe / Responsável Legal',
        telefone_responsavel: dados.tutores?.telefone_responsavel || dados.telefone_responsavel || '',
        telefone_comercial: dados.tutores?.telefone_comercial || dados.telefone_comercial || '',
        email_responsavel: dados.tutores?.email_responsavel || dados.email_responsavel || '',
        endereco_logradouro: dados.tutores?.endereco_logradouro || dados.endereco_logradouro || '',
        endereco_bairro: dados.tutores?.endereco_bairro || dados.endereco_bairro || 'Mooca',
        endereco_cidade: dados.tutores?.endereco_cidade || dados.endereco_cidade || 'São Paulo / SP',
        endereco_cep: dados.tutores?.endereco_cep || dados.endereco_cep || '',
        autorizacao_saida: dados.tutores?.autorizacao_saida || dados.autorizacao_saida || ''
      },

      // Informações de Emergência e Saúde
      emergencia: {
        contato_emergencia_1: dados.emergencia?.contato_emergencia_1 || dados.contato_emergencia_1 || '',
        contato_emergencia_2: dados.emergencia?.contato_emergencia_2 || dados.contato_emergencia_2 || '',
        tipo_sanguineo: dados.emergencia?.tipo_sanguineo || dados.tipo_sanguineo || 'O+',
        convenio_medico: dados.emergencia?.convenio_medico || dados.convenio_medico || 'Amil Assistência Médica',
        hospital_preferencia: dados.emergencia?.hospital_preferencia || dados.hospital_preferencia || 'Hospital CEMA / São Cristóvão (Mooca)',
        alergias: dados.emergencia?.alergias || dados.alergias || 'Nenhuma alergia relatada',
        medicamentos: dados.emergencia?.medicamentos || dados.medicamentos || 'Nenhum',
        observacoes_medicas: dados.emergencia?.observacoes_medicas || dados.observacoes_medicas || ''
      },

      // Informações de Caráter Pessoal e Observações
      pessoal: {
        perfil_comportamental: dados.pessoal?.perfil_comportamental || dados.perfil_comportamental || 'Aluno sociável, participativo e dedicado às atividades escolares.',
        habilidades_destaques: dados.pessoal?.habilidades_destaques || dados.habilidades_destaques || 'Boa capacidade analítica, trabalho em equipe e criatividade prática.',
        projetos_atividades: dados.pessoal?.projetos_atividades || dados.projetos_atividades || 'Projeto Integrador SENAI Theobaldo De Nigris e oficinas técnicas.',
        observacoes_coordenacao: dados.pessoal?.observacoes_coordenacao || dados.observacoes_coordenacao || 'Acompanhamento pedagógico com evolução satisfatória.'
      },

      // Dados de Aprendizagem
      supervisor_empresa: dados.supervisor_empresa || 'Eng. Roberto Camargo',
      regime_contrato: dados.regime_contrato || 'Jovem Aprendiz (Lei 10.097/2000)'
    };

    this.dados.alunos.push(novoAluno);
    this.salvar();
    return novoAluno;
  }

  atualizarAluno(id, dados) {
    const idx = this.dados.alunos.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Aluno não encontrado.');

    const atual = this.dados.alunos[idx];

    if (dados.nome) atual.nome = dados.nome.trim().toUpperCase();
    if (dados.turma_codigo) {
      const turmaExiste = this.dados.turmas.some(t => t.codigo.toUpperCase() === dados.turma_codigo.toUpperCase());
      if (!turmaExiste) throw new Error(`Turma "${dados.turma_codigo}" não encontrada.`);
      atual.turma_codigo = dados.turma_codigo.toUpperCase();
    }
    if (dados.matricula) atual.matricula = dados.matricula.trim();
    if (dados.foto_url) atual.foto_url = dados.foto_url;
    if (dados.data_nascimento) atual.data_nascimento = dados.data_nascimento;
    if (dados.genero) atual.genero = dados.genero;
    if (dados.curso) atual.curso = dados.curso.trim();
    if (dados.nivel) atual.nivel = dados.nivel.trim();
    if (dados.rg !== undefined) atual.rg = dados.rg.trim();
    if (dados.cpf !== undefined) atual.cpf = dados.cpf.trim();
    if (dados.empresa_aprendizagem !== undefined) atual.empresa_aprendizagem = dados.empresa_aprendizagem.trim();
    if (dados.contribuicoes_aapm !== undefined) atual.contribuicoes_aapm = dados.contribuicoes_aapm;
    if (dados.supervisor_empresa !== undefined) atual.supervisor_empresa = dados.supervisor_empresa.trim();
    if (dados.regime_contrato !== undefined) atual.regime_contrato = dados.regime_contrato.trim();

    // Atualização de Tutores
    atual.tutores = {
      ...(atual.tutores || {}),
      ...(dados.tutores || {})
    };
    if (dados.nome_responsavel !== undefined) atual.tutores.nome_responsavel = dados.nome_responsavel.trim();
    if (dados.parentesco_responsavel !== undefined) atual.tutores.parentesco = dados.parentesco_responsavel.trim();
    if (dados.telefone_responsavel !== undefined) atual.tutores.telefone_responsavel = dados.telefone_responsavel.trim();
    if (dados.telefone_comercial !== undefined) atual.tutores.telefone_comercial = dados.telefone_comercial.trim();
    if (dados.email_responsavel !== undefined) atual.tutores.email_responsavel = dados.email_responsavel.trim();
    if (dados.endereco_logradouro !== undefined) atual.tutores.endereco_logradouro = dados.endereco_logradouro.trim();
    if (dados.endereco_bairro !== undefined) atual.tutores.endereco_bairro = dados.endereco_bairro.trim();
    if (dados.endereco_cidade !== undefined) atual.tutores.endereco_cidade = dados.endereco_cidade.trim();
    if (dados.endereco_cep !== undefined) atual.tutores.endereco_cep = dados.endereco_cep.trim();
    if (dados.autorizacao_saida !== undefined) atual.tutores.autorizacao_saida = dados.autorizacao_saida.trim();

    // Atualização de Emergência
    atual.emergencia = {
      ...(atual.emergencia || {}),
      ...(dados.emergencia || {})
    };
    if (dados.contato_emergencia_1 !== undefined) atual.emergencia.contato_emergencia_1 = dados.contato_emergencia_1.trim();
    if (dados.contato_emergencia_2 !== undefined) atual.emergencia.contato_emergencia_2 = dados.contato_emergencia_2.trim();
    if (dados.tipo_sanguineo !== undefined) atual.emergencia.tipo_sanguineo = dados.tipo_sanguineo.trim();
    if (dados.convenio_medico !== undefined) atual.emergencia.convenio_medico = dados.convenio_medico.trim();
    if (dados.hospital_preferencia !== undefined) atual.emergencia.hospital_preferencia = dados.hospital_preferencia.trim();
    if (dados.alergias !== undefined) atual.emergencia.alergias = dados.alergias.trim();
    if (dados.medicamentos !== undefined) atual.emergencia.medicamentos = dados.medicamentos.trim();
    if (dados.observacoes_medicas !== undefined) atual.emergencia.observacoes_medicas = dados.observacoes_medicas.trim();

    // Atualização de Pessoal
    atual.pessoal = {
      ...(atual.pessoal || {}),
      ...(dados.pessoal || {})
    };
    if (dados.perfil_comportamental !== undefined) atual.pessoal.perfil_comportamental = dados.perfil_comportamental.trim();
    if (dados.habilidades_destaques !== undefined) atual.pessoal.habilidades_destaques = dados.habilidades_destaques.trim();
    if (dados.projetos_atividades !== undefined) atual.pessoal.projetos_atividades = dados.projetos_atividades.trim();
    if (dados.observacoes_coordenacao !== undefined) atual.pessoal.observacoes_coordenacao = dados.observacoes_coordenacao.trim();

    this.salvar();
    return atual;
  }

  // --- MÉTODOS DE OCORRÊNCIAS ---
  obterTiposOcorrencia() {
    return this.dados.tipos_ocorrencia;
  }

  criarOcorrencia({ aluno_id, tipo_nome, data, hora, detalhamento, usuario }) {
    const aluno = this.dados.alunos.find(a => a.id === aluno_id);
    if (!aluno) throw new Error('Aluno não encontrado.');

    // Verificar classificação a partir do tipo selecionado
    const tipoCadastrado = this.dados.tipos_ocorrencia.find(
      t => t.nome.toLowerCase() === tipo_nome.toLowerCase()
    );

    const tipo_classificacao = tipoCadastrado ? tipoCadastrado.classificacao : 'VERMELHO';

    // Validação de permissão do usuário
    if (tipo_classificacao === 'VERMELHO' && !usuario.permissoes.pode_criar_vermelho) {
      throw new Error('Seu perfil não possui permissão para registrar advertências ou orientações disciplinares.');
    }
    if (tipo_classificacao === 'VERDE' && !usuario.permissoes.pode_criar_verde) {
      throw new Error('Seu perfil não possui permissão para registrar elogios ou recomendações positivas.');
    }

    const novaOcorrencia = {
      id: `ocorr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      aluno_id,
      tipo_classificacao,
      tipo_nome: tipoCadastrado ? tipoCadastrado.nome : tipo_nome,
      data: data || new Date().toISOString().split('T')[0],
      hora: hora || new Date().toTimeString().substring(0, 5),
      detalhamento: detalhamento.trim(),
      criado_por_usuario_id: usuario.id,
      criado_por_nome: usuario.login
    };

    this.dados.ocorrencias.push(novaOcorrencia);
    this.salvar();

    // Recalcular contadores derivados atualizados
    const ocorrenciasAluno = this.dados.ocorrencias.filter(o => o.aluno_id === aluno_id);
    const contador_vermelho = ocorrenciasAluno.filter(o => o.tipo_classificacao === 'VERMELHO').length;
    const contador_verde = ocorrenciasAluno.filter(o => o.tipo_classificacao === 'VERDE').length;

    return {
      ocorrencia: novaOcorrencia,
      aluno_id,
      contador_vermelho,
      contador_verde,
      total_ocorrencias: ocorrenciasAluno.length
    };
  }

  excluirOcorrencia(idOcorrencia, usuario) {
    if (!usuario.permissoes.pode_excluir_ocorrencia) {
      throw new Error('Seu perfil não tem permissão para excluir registros de ocorrências.');
    }

    const idx = this.dados.ocorrencias.findIndex(o => o.id === idOcorrencia);
    if (idx === -1) throw new Error('Ocorrência não encontrada.');

    const aluno_id = this.dados.ocorrencias[idx].aluno_id;
    this.dados.ocorrencias.splice(idx, 1);
    this.salvar();

    // Recalcular contadores derivados após exclusão
    const ocorrenciasAluno = this.dados.ocorrencias.filter(o => o.aluno_id === aluno_id);
    const contador_vermelho = ocorrenciasAluno.filter(o => o.tipo_classificacao === 'VERMELHO').length;
    const contador_verde = ocorrenciasAluno.filter(o => o.tipo_classificacao === 'VERDE').length;

    return {
      sucesso: true,
      aluno_id,
      contador_vermelho,
      contador_verde,
      total_ocorrencias: ocorrenciasAluno.length
    };
  }
}

module.exports = new BancoDeDados();
