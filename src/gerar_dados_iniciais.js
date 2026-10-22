/**
 * Gerador de dados iniciais para o sistema de Acompanhamento Escolar
 * Dados baseados nas referências da Escola SENAI "Theobaldo De Nigris" (Mooca - São Paulo).
 */
const fs = require('fs');
const path = require('path');

const SENHA_HASH_PADRAO = '$2b$10$IvLwOE0QYtMusmgKBu2hXuVVgAEZIOcrm2tA3b//2AH53EEMumw/q'; // 'senha123'

const dadosIniciais = {
  usuarios: [
    {
      id: 'usr_master',
      login: 'master',
      nome: 'Márcio Silva',
      cargo: 'Administrador Master',
      perfil: 'master',
      senha_hash: SENHA_HASH_PADRAO,
      ativo: true,
      permissoes: {
        turmas_permitidas: ['*'], // Todas
        pode_gerenciar_turmas: true,
        pode_gerenciar_alunos: true,
        pode_criar_vermelho: true,
        pode_criar_verde: true,
        pode_excluir_ocorrencia: true,
        pode_gerenciar_usuarios: true
      }
    },
    {
      id: 'usr_coord',
      login: 'cristina',
      nome: 'Cristina Santos',
      cargo: 'Coordenadora Pedagógica',
      perfil: 'coordenador',
      senha_hash: SENHA_HASH_PADRAO,
      ativo: true,
      permissoes: {
        turmas_permitidas: ['*'], // Todas
        pode_gerenciar_turmas: true,
        pode_gerenciar_alunos: true,
        pode_criar_vermelho: true,
        pode_criar_verde: true,
        pode_excluir_ocorrencia: true,
        pode_gerenciar_usuarios: false
      }
    },
    {
      id: 'usr_prof_rodrigo',
      login: 'rodrigo',
      nome: 'Rodrigo Azevedo',
      cargo: 'Professor Técnico',
      perfil: 'professor',
      senha_hash: SENHA_HASH_PADRAO,
      ativo: true,
      permissoes: {
        turmas_permitidas: ['SEDUC2-DEVALD', 'DEV2N'],
        pode_gerenciar_turmas: false,
        pode_gerenciar_alunos: true, // Professor pode adicionar fotos e alunos em suas turmas
        pode_criar_vermelho: true,
        pode_criar_verde: true,
        pode_excluir_ocorrencia: false,
        pode_gerenciar_usuarios: false
      }
    },
    {
      id: 'usr_prof_carlos',
      login: 'carlos',
      nome: 'Carlos Mendes',
      cargo: 'Professor Específico (DEV2N)',
      perfil: 'professor',
      senha_hash: SENHA_HASH_PADRAO,
      ativo: true,
      permissoes: {
        turmas_permitidas: ['DEV2N'], // Vê somente a turma DEV2N!
        pode_gerenciar_turmas: false,
        pode_gerenciar_alunos: false,
        pode_criar_vermelho: false,    // Restrito: NÃO cria advertências
        pode_criar_verde: true,        // Apenas elogios/recomendações
        pode_excluir_ocorrencia: false,
        pode_gerenciar_usuarios: false
      }
    }
  ],

  turmas: [
    {
      id: 'turma_seduc2_devald',
      codigo: 'SEDUC2-DEVALD',
      nome: 'Técnico em Desenvolvimento de Sistemas',
      modulo: '2º Módulo',
      periodo: 'Manhã',
      ano_semestre: '2026/1',
      sala: 'Laboratório 04'
    },
    {
      id: 'turma_dev2n',
      codigo: 'DEV2N',
      nome: 'Técnico em Desenvolvimento de Sistemas',
      modulo: '2º Módulo',
      periodo: 'Noite',
      ano_semestre: '2026/1',
      sala: 'Laboratório 06'
    },
    {
      id: 'turma_bg3m',
      codigo: 'BG3M',
      nome: 'Técnico em Biotecnologia',
      modulo: '3º Módulo',
      periodo: 'Manhã',
      ano_semestre: '2026/1',
      sala: 'Laboratório Bio 01'
    },
    {
      id: 'turma_eleiva',
      codigo: 'SEDUC2-ELEIVA',
      nome: 'Técnico em Eletroeletrônica',
      modulo: '2º Módulo',
      periodo: 'Tarde',
      ano_semestre: '2026/1',
      sala: 'Oficina Elétrica'
    }
  ],

  tipos_ocorrencia: [
    { id: 'adv', nome: 'Advertência', classificacao: 'VERMELHO' },
    { id: 'afast', nome: 'Afastamento', classificacao: 'VERMELHO' },
    { id: 'aqv', nome: 'Atendimento AQV', classificacao: 'VERMELHO' },
    { id: 'coord', nome: 'Atendimento Coordenação', classificacao: 'VERMELHO' },
    { id: 'oe', nome: 'Atendimento OE', classificacao: 'VERMELHO' },
    { id: 'atraso', nome: 'Atrasos', classificacao: 'VERMELHO' },
    { id: 'canc', nome: 'Cancelamento de Matrícula', classificacao: 'VERMELHO' },
    { id: 'desemp', nome: 'Desempenho Insuficiente', classificacao: 'VERMELHO' },
    { id: 'cracha', nome: 'Falta de Crachá', classificacao: 'VERMELHO' },
    { id: 'epi', nome: 'Falta de EPIs', classificacao: 'VERMELHO' },
    { id: 'uniforme', nome: 'Falta de Uniforme', classificacao: 'VERMELHO' },
    { id: 'obs_prof', nome: 'Observações do Professor', classificacao: 'VERMELHO' },
    { id: 'queixa', nome: 'Queixa', classificacao: 'VERMELHO' },
    { id: 'relac', nome: 'Relacionamento', classificacao: 'VERMELHO' },
    { id: 'saida', nome: 'Saída Antecipada', classificacao: 'VERMELHO' },
    { id: 'elogio', nome: 'Elogio', classificacao: 'VERDE' },
    { id: 'recom', nome: 'Recomendação Positiva', classificacao: 'VERDE' },
    { id: 'destaque', nome: 'Destaque Técnico', classificacao: 'VERDE' },
    { id: 'particip', nome: 'Participação Exemplar', classificacao: 'VERDE' }
  ],

  alunos: [
    // Turma SEDUC2-DEVALD (conforme imagem real)
    {
      id: 'aluno_172',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163854',
      nome: 'BRYAN SOUSA VIEIRA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-05-28',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '59.950.260-5',
      cpf: '461.762.908-48',
      empresa_aprendizagem: 'Soluções Gráficas & TI Mooca',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_102',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163855',
      nome: 'ANA BEATRIZ LIMA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-03-12',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '58.210.443-2',
      cpf: '455.890.123-10',
      empresa_aprendizagem: 'Tech Soluções SA',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_103',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163856',
      nome: 'CARLOS EDUARDO RIBEIRO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2008-11-20',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '57.882.190-8',
      cpf: '439.123.876-02',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_104',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163857',
      nome: 'MARIANA COSTA DUARTE',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-08-14',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '60.112.449-1',
      cpf: '462.551.990-15',
      empresa_aprendizagem: 'Logística Integrada Mooca',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_105',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163858',
      nome: 'GABRIEL MONTEIRO SOUZA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-01-05',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '58.330.129-4',
      cpf: '450.998.112-70',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_106',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163859',
      nome: 'LETÍCIA FERNANDES SILVA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-09-30',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '59.771.882-9',
      cpf: '463.774.221-08',
      empresa_aprendizagem: 'Banco Digital Corp',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_107',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163860',
      nome: 'MATHEUS ALVES PEREIRA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-04-18',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '58.990.114-7',
      cpf: '456.223.998-33',
      empresa_aprendizagem: 'Indústria Metalúrgica SA',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_108',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163861',
      nome: 'LARISSA MARTINS ROCHA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-07-22',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '60.334.881-2',
      cpf: '468.112.554-90',
      empresa_aprendizagem: 'Algar Tech',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_109',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163862',
      nome: 'RAFAEL SANTOS OLIVEIRA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2008-12-03',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '57.441.990-1',
      cpf: '441.776.332-11',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_110',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163863',
      nome: 'VINÍCIUS ALMEIDA RAMOS',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-06-11',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '59.221.334-8',
      cpf: '459.882.114-60',
      empresa_aprendizagem: 'Scania Brasil',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_111',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163864',
      nome: 'BEATRIZ CARDOSO NUNES',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-10-09',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '60.887.112-3',
      cpf: '469.332.991-82',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_112',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163865',
      nome: 'LUCAS HENRIQUE DIAS',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-02-14',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '58.552.119-0',
      cpf: '452.119.884-25',
      empresa_aprendizagem: 'Cielo Pagamentos',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_113',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163866',
      nome: 'GIULIA MENDES CARVALHO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-05-04',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '59.664.228-5',
      cpf: '460.998.331-77',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_114',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163867',
      nome: 'FELIPE BARBOSA PINTO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2008-10-25',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '57.991.002-4',
      cpf: '445.662.119-40',
      empresa_aprendizagem: 'Totvs Software',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_115',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163868',
      nome: 'SOPHIA NOGUEIRA CASTRO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-12-01',
      data_matricula: '04/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '61.229.445-6',
      cpf: '472.115.882-99',
      empresa_aprendizagem: 'Itaú Unibanco',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_116',
      turma_codigo: 'SEDUC2-DEVALD',
      matricula: '25163869',
      nome: 'JOÃO PEDRO GUIMARÃES',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2009-03-29',
      data_matricula: '04/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '59.110.884-2',
      cpf: '458.772.339-01',
      empresa_aprendizagem: 'Stefanini IT',
      contribuicoes_aapm: 'Sim'
    },

    // Turma DEV2N (Técnico Noturno)
    {
      id: 'aluno_201',
      turma_codigo: 'DEV2N',
      matricula: '25178901',
      nome: 'ARTHUR RAMOS FERREIRA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2007-08-10',
      data_matricula: '05/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '54.332.110-9',
      cpf: '412.883.990-21',
      empresa_aprendizagem: 'Bradesco Seguros',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_202',
      turma_codigo: 'DEV2N',
      matricula: '25178902',
      nome: 'BRENDA CRISTINA LOPES',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2006-12-04',
      data_matricula: '05/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '52.771.002-3',
      cpf: '399.112.445-67',
      empresa_aprendizagem: 'Accenture Brasil',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_203',
      turma_codigo: 'DEV2N',
      matricula: '25178903',
      nome: 'CAIO VINICIUS CASTRO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2007-04-19',
      data_matricula: '05/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '55.112.998-4',
      cpf: '420.339.118-90',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_204',
      turma_codigo: 'DEV2N',
      matricula: '25178904',
      nome: 'DANIELA SILVEIRA MELO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2005-09-15',
      data_matricula: '05/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '49.882.331-5',
      cpf: '381.229.440-12',
      empresa_aprendizagem: 'Mercado Livre',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_205',
      turma_codigo: 'DEV2N',
      matricula: '25178905',
      nome: 'ENZO GABRIEL DUARTE',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2007-11-28',
      data_matricula: '05/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '54.990.112-8',
      cpf: '418.771.229-34',
      empresa_aprendizagem: 'IBM Brasil',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_206',
      turma_codigo: 'DEV2N',
      matricula: '25178906',
      nome: 'FERNANDA LIMA MOREIRA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2006-03-08',
      data_matricula: '05/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '51.442.889-0',
      cpf: '394.551.882-01',
      empresa_aprendizagem: 'Stefanini IT',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_207',
      turma_codigo: 'DEV2N',
      matricula: '25178907',
      nome: 'GUILHERME HENRIQUE PIRES',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2005-01-22',
      data_matricula: '05/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '48.991.220-7',
      cpf: '376.114.992-55',
      empresa_aprendizagem: '',
      contribuicoes_aapm: 'Não'
    },
    {
      id: 'aluno_208',
      turma_codigo: 'DEV2N',
      matricula: '25178908',
      nome: 'HELENA TAVARES RIBEIRO',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2007-06-14',
      data_matricula: '05/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Desenvolvimento de Sistemas',
      nivel: 'Nível Técnico',
      rg: '53.882.119-4',
      cpf: '409.338.115-88',
      empresa_aprendizagem: 'Editora & Gráfica Globo SP',
      contribuicoes_aapm: 'Sim'
    },

    // Turma BG3M
    {
      id: 'aluno_301',
      turma_codigo: 'BG3M',
      matricula: '25189010',
      nome: 'IGOR MATOS SANTANA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2008-05-19',
      data_matricula: '03/02/2025',
      genero: 'Masculino',
      curso: 'Técnico em Biotecnologia',
      nivel: 'Nível Técnico',
      rg: '56.119.224-1',
      cpf: '431.554.772-00',
      empresa_aprendizagem: 'Biolab Farmacêutica',
      contribuicoes_aapm: 'Sim'
    },
    {
      id: 'aluno_302',
      turma_codigo: 'BG3M',
      matricula: '25189011',
      nome: 'JULIANA ROCHA BATISTA',
      foto_url: '/assets/fotos/.svg',
      data_nascimento: '2007-10-12',
      data_matricula: '03/02/2025',
      genero: 'Feminino',
      curso: 'Técnico em Biotecnologia',
      nivel: 'Nível Técnico',
      rg: '53.998.112-9',
      cpf: '410.228.441-39',
      empresa_aprendizagem: 'Eurofarma SP',
      contribuicoes_aapm: 'Sim'
    }
  ],

  // Ocorrências reais e detalhadas (os círculos vermelho e verde são derivados destas ocorrências)
  ocorrencias: [
    // Aluno Bryan Sousa Vieira (id: aluno_172) - exatamente como nas imagens de referência!
    {
      id: 'ocorr_bryan_01',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2026-08-18',
      hora: '14:15',
      detalhamento: 'solicitou saída, motivo particular, responsável compareceu na escola para buscar, liberado às 14:15.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_02',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2026-03-02',
      hora: '14:30',
      detalhamento: 'solicitou saída, motivo particular, responsável (Alice), autorizou saída, liberado às 14:30',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_03',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-02-27',
      hora: '10:00',
      detalhamento: 'Aluno sempre preocupado com a melhor maneira de realizar um bom trabalho. Muito dedicado.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    {
      id: 'ocorr_bryan_04',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Atendimento AQV',
      data: '2025-09-30',
      hora: '11:15',
      detalhamento: 'assinou acompanhamento de faltas no componente PBE1 17 faltas (48%).',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_05',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Atendimento AQV',
      data: '2025-09-30',
      hora: '08:15',
      detalhamento: 'apresentou declaração de comparecimento de 23/09 das 08:15 às 10:10 horas para consulta médica.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_06',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2025-09-22',
      hora: '13:00',
      detalhamento: 'solicitou saída, motivo particular, responsável enviou mensagem no whatsapp e autorizou saída, liberado as 13:00 horas.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_07',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2025-09-08',
      hora: '11:25',
      detalhamento: 'solicitou saída, motivo não se senti bem, responsável (Alice), compareceu na escola para buscar, liberado às 11:25 horas.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_08',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2025-05-06',
      hora: '09:50',
      detalhamento: 'solicitou saída, motivo não se senti bem, responsável (Alice), compareceu na escola para buscar, liberado as 09:50 horas.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_bryan_09',
      aluno_id: 'aluno_172',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2025-03-17',
      hora: '15:20',
      detalhamento: 'solicitou saída, motivo consulta médica, responsável compareceu na escola para buscar, liberado às 15:20 horas.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },

    // Ocorrências de Ana Beatriz Lima (1 VERDE, 14 VERMELHO)
    {
      id: 'ocorr_ana_elogio',
      aluno_id: 'aluno_102',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-03-15',
      hora: '11:00',
      detalhamento: 'Excelente contribuição no projeto integrador e ajuda mútua com os colegas da bancada.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    ...Array.from({ length: 14 }).map((_, i) => ({
      id: `ocorr_ana_adv_${i + 1}`,
      aluno_id: 'aluno_102',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: i % 2 === 0 ? 'Atrasos' : 'Falta de Crachá',
      data: `2026-0${Math.floor(i / 3) + 1}-1${(i % 9) + 1}`,
      hora: '07:35',
      detalhamento: i % 2 === 0 ? 'Chegou após o fechamento dos portões às 07:35.' : 'Esqueceu crachá de identificação de uso obrigatório.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    })),

    // Ocorrências de Carlos Eduardo Ribeiro (28 VERMELHO)
    ...Array.from({ length: 28 }).map((_, i) => ({
      id: `ocorr_carlos_adv_${i + 1}`,
      aluno_id: 'aluno_103',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: i % 3 === 0 ? 'Atrasos' : (i % 3 === 1 ? 'Falta de Uniforme' : 'Observações do Professor'),
      data: `2026-0${Math.floor(i / 6) + 1}-1${(i % 8) + 1}`,
      hora: '08:00',
      detalhamento: 'Anotação de conduta ou atraso em componente curricular.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    })),

    // Ocorrências de Mariana Costa Duarte (22 VERMELHO)
    ...Array.from({ length: 22 }).map((_, i) => ({
      id: `ocorr_mariana_adv_${i + 1}`,
      aluno_id: 'aluno_104',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: i % 2 === 0 ? 'Saída Antecipada' : 'Atrasos',
      data: `2026-0${Math.floor(i / 5) + 1}-1${(i % 9) + 1}`,
      hora: '14:00',
      detalhamento: 'Registro de saída antecipada autorizada por responsável.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    })),

    // Larissa Martins Rocha (1 VERDE, 11 VERMELHO)
    {
      id: 'ocorr_larissa_elogio',
      aluno_id: 'aluno_108',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-04-10',
      hora: '09:30',
      detalhamento: 'Destaque acadêmico na avaliação prática de banco de dados.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    ...Array.from({ length: 11 }).map((_, i) => ({
      id: `ocorr_larissa_adv_${i + 1}`,
      aluno_id: 'aluno_108',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Atrasos',
      data: `2026-0${Math.floor(i / 3) + 1}-2${(i % 8) + 1}`,
      hora: '07:40',
      detalhamento: 'Atraso na primeira aula.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    })),

    // Aluno Sophia Nogueira Castro (3 VERDE, 2 VERMELHO)
    {
      id: 'ocorr_sophia_el_1',
      aluno_id: 'aluno_115',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-02-12',
      hora: '10:15',
      detalhamento: 'Apresentação de seminário excelente, com domínio do tema e clareza técnica.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    {
      id: 'ocorr_sophia_el_2',
      aluno_id: 'aluno_115',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Recomendação Positiva',
      data: '2026-03-20',
      hora: '14:00',
      detalhamento: 'Indicação para projeto de mentoria entre alunos da escola.',
      criado_por_usuario_id: 'usr_master',
      criado_por_nome: 'marcio'
    },
    {
      id: 'ocorr_sophia_el_3',
      aluno_id: 'aluno_115',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Destaque Técnico',
      data: '2026-04-14',
      hora: '15:30',
      detalhamento: 'Desenvolveu protótipo funcional antes do prazo previsto.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    {
      id: 'ocorr_sophia_adv_1',
      aluno_id: 'aluno_115',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Falta de Crachá',
      data: '2026-01-28',
      hora: '07:30',
      detalhamento: 'Entrada autorizada com crachá provisório.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_sophia_adv_2',
      aluno_id: 'aluno_115',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2026-03-10',
      hora: '16:00',
      detalhamento: 'Saída para consulta médica comprovada.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },

    // Aluno João Pedro Guimarães (4 VERDE, 0 VERMELHO)
    {
      id: 'ocorr_jp_1',
      aluno_id: 'aluno_116',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-02-05',
      hora: '09:00',
      detalhamento: 'Comportamento exemplar e assiduidade 100%.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    {
      id: 'ocorr_jp_2',
      aluno_id: 'aluno_116',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Destaque Técnico',
      data: '2026-03-01',
      hora: '10:00',
      detalhamento: 'Excelente domínio de lógica de programação.',
      criado_por_usuario_id: 'usr_prof_rodrigo',
      criado_por_nome: 'rodrigoazevedo'
    },
    {
      id: 'ocorr_jp_3',
      aluno_id: 'aluno_116',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Participação Exemplar',
      data: '2026-03-25',
      hora: '14:20',
      detalhamento: 'Participou ativamente do hackathon escolar com premiação de destaque.',
      criado_por_usuario_id: 'usr_master',
      criado_por_nome: 'marcio'
    },
    {
      id: 'ocorr_jp_4',
      aluno_id: 'aluno_116',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Recomendação Positiva',
      data: '2026-04-08',
      hora: '11:15',
      detalhamento: 'Recomendado para vaga de estágio avançado.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },

    // Ocorrências da Turma DEV2N (para testar a visualização do Professor Carlos)
    {
      id: 'ocorr_arthur_1',
      aluno_id: 'aluno_201',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-02-18',
      hora: '20:10',
      detalhamento: 'Excelente colaboração em equipe no projeto de front-end.',
      criado_por_usuario_id: 'usr_prof_carlos',
      criado_por_nome: 'carlos'
    },
    {
      id: 'ocorr_arthur_2',
      aluno_id: 'aluno_201',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Destaque Técnico',
      data: '2026-03-12',
      hora: '21:00',
      detalhamento: 'Entregou desafio de código com arquitetura limpa.',
      criado_por_usuario_id: 'usr_prof_carlos',
      criado_por_nome: 'carlos'
    },
    {
      id: 'ocorr_arthur_3',
      aluno_id: 'aluno_201',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Atrasos',
      data: '2026-01-20',
      hora: '19:35',
      detalhamento: 'Atraso devido ao trânsito na chegada do trabalho.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_arthur_4',
      aluno_id: 'aluno_201',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Atrasos',
      data: '2026-02-04',
      hora: '19:40',
      detalhamento: 'Atraso de 25 minutos na primeira aula.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },
    {
      id: 'ocorr_arthur_5',
      aluno_id: 'aluno_201',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Falta de Crachá',
      data: '2026-03-05',
      hora: '19:15',
      detalhamento: 'Esqueceu o crachá de identificação.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    },

    // Brenda Cristina Lopes (5 VERDE, 1 VERMELHO)
    {
      id: 'ocorr_brenda_el_1',
      aluno_id: 'aluno_202',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-02-10',
      hora: '20:30',
      detalhamento: 'Liderança impecável no grupo de desenvolvimento.',
      criado_por_usuario_id: 'usr_prof_carlos',
      criado_por_nome: 'carlos'
    },
    {
      id: 'ocorr_brenda_el_2',
      aluno_id: 'aluno_202',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Participação Exemplar',
      data: '2026-02-24',
      hora: '21:15',
      detalhamento: 'Proatividade na resolução de dúvidas da turma.',
      criado_por_usuario_id: 'usr_prof_carlos',
      criado_por_nome: 'carlos'
    },
    {
      id: 'ocorr_brenda_el_3',
      aluno_id: 'aluno_202',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Destaque Técnico',
      data: '2026-03-09',
      hora: '19:45',
      detalhamento: 'Apresentou arquitetura de microsserviços inovadora.',
      criado_por_usuario_id: 'usr_prof_carlos',
      criado_por_nome: 'carlos'
    },
    {
      id: 'ocorr_brenda_el_4',
      aluno_id: 'aluno_202',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Recomendação Positiva',
      data: '2026-03-22',
      hora: '20:00',
      detalhamento: 'Indicada para liderar a equipe de extensão do SENAI.',
      criado_por_usuario_id: 'usr_master',
      criado_por_nome: 'marcio'
    },
    {
      id: 'ocorr_brenda_el_5',
      aluno_id: 'aluno_202',
      tipo_classificacao: 'VERDE',
      tipo_nome: 'Elogio',
      data: '2026-04-05',
      hora: '21:30',
      detalhamento: 'Conclusão brilhante do módulo com 100% de aproveitamento.',
      criado_por_usuario_id: 'usr_prof_carlos',
      criado_por_nome: 'carlos'
    },
    {
      id: 'ocorr_brenda_adv_1',
      aluno_id: 'aluno_202',
      tipo_classificacao: 'VERMELHO',
      tipo_nome: 'Saída Antecipada',
      data: '2026-03-14',
      hora: '21:30',
      detalhamento: 'Liberada 30 minutos antes com comunicação da empresa contratante.',
      criado_por_usuario_id: 'usr_coord',
      criado_por_nome: 'cristina'
    }
  ]
};

const destino = path.join(__dirname, '..', 'data', 'banco_de_dados.json');
fs.writeFileSync(destino, JSON.stringify(dadosIniciais, null, 2), 'utf-8');
console.log(`Banco de dados semeado com sucesso em: ${destino}`);
console.log(`Total Usuários: ${dadosIniciais.usuarios.length}`);
console.log(`Total Turmas: ${dadosIniciais.turmas.length}`);
console.log(`Total Alunos: ${dadosIniciais.alunos.length}`);
console.log(`Total Ocorrências: ${dadosIniciais.ocorrencias.length}`);
