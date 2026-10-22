const express = require('express');
const router = express.Router();
const db = require('../database');
const { autenticarToken } = require('../middleware/autenticacao');
const { verificarAcessoTurma } = require('../middleware/controle_acesso');

// Listar turmas que o usuário logado tem permissão para visualizar
router.get('/', autenticarToken, (req, res) => {
  const turmasPermitidas = db.obterTurmasPermitidas(req.usuario);
  res.json({
    turmas: turmasPermitidas,
    total: turmasPermitidas.length
  });
});

// Carômetro: Alunos da turma com fotos, nomes e contadores derivados dinamicamente
router.get('/:codigo/alunos', autenticarToken, verificarAcessoTurma, (req, res) => {
  const codigo = req.params.codigo;
  const busca = (req.query.q || '').toLowerCase().trim();

  let alunos = db.obterAlunosPorTurma(codigo, req.usuario);

  if (busca) {
    alunos = alunos.filter(a => 
      a.nome.toLowerCase().includes(busca) || 
      a.matricula.includes(busca) ||
      a.turma_codigo.toLowerCase().includes(busca)
    );
  }

  // Ordenação opcional: por nome (padrão) ou por ocorrências
  const ordenacao = req.query.ordenar || 'nome';
  if (ordenacao === 'ocorrencias_desc') {
    alunos.sort((a, b) => b.total_ocorrencias - a.total_ocorrencias);
  } else if (ordenacao === 'vermelho_desc') {
    alunos.sort((a, b) => b.contador_vermelho - a.contador_vermelho);
  } else if (ordenacao === 'verde_desc') {
    alunos.sort((a, b) => b.contador_verde - a.contador_verde);
  } else {
    alunos.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  const turmaInfo = codigo.toUpperCase() === 'TODAS'
    ? { codigo: 'TODAS', nome: 'Todas as Turmas Autorizadas' }
    : db.obterTurmaPorCodigo(codigo);

  res.json({
    turma: turmaInfo,
    total_alunos: alunos.length,
    alunos
  });
});

// Criar nova turma
router.post('/', autenticarToken, (req, res) => {
  const pode = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_turmas;
  if (!pode) {
    return res.status(403).json({ erro: 'Seu perfil não possui permissão para criar novas turmas.' });
  }

  try {
    const novaTurma = db.criarTurma(req.body);
    res.status(201).json({
      mensagem: `Turma ${novaTurma.codigo} criada com sucesso.`,
      turma: novaTurma
    });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// Atualizar turma
router.put('/:codigo', autenticarToken, (req, res) => {
  const pode = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_turmas;
  if (!pode) {
    return res.status(403).json({ erro: 'Seu perfil não possui permissão para editar turmas.' });
  }

  try {
    const atualizada = db.atualizarTurma(req.params.codigo, req.body);
    res.json({
      mensagem: `Turma ${atualizada.codigo} atualizada com sucesso.`,
      turma: atualizada
    });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// Excluir turma
router.delete('/:codigo', autenticarToken, (req, res) => {
  const pode = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_turmas;
  if (!pode) {
    return res.status(403).json({ erro: 'Seu perfil não possui permissão para excluir turmas.' });
  }

  try {
    const excluirAlunos = req.query.excluirAlunos === 'true' || req.body?.excluirAlunos === true;
    const resultado = db.excluirTurma(req.params.codigo, excluirAlunos);
    res.json(resultado);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// Evoluir turma (Progressão de módulo/semestre com migração de alunos e histórico mantido)
router.post('/:codigo/evoluir', autenticarToken, (req, res) => {
  const pode = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_turmas;
  if (!pode) {
    return res.status(403).json({ erro: 'Seu perfil não possui permissão para evoluir turmas.' });
  }

  try {
    const resultado = db.evoluirTurma(req.params.codigo, req.body);
    res.json(resultado);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

module.exports = router;
