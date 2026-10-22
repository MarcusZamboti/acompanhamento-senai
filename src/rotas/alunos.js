const express = require('express');
const router = express.Router();
const db = require('../database');
const { autenticarToken } = require('../middleware/autenticacao');

// Ficha detalhada do aluno com contadores e histórico de ocorrências
router.get('/:id', autenticarToken, (req, res) => {
  const alunoId = req.params.id;
  const aluno = db.obterAlunoPorId(alunoId);

  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado.' });
  }

  // Verificar se o usuário tem permissão para visualizar a turma do aluno
  const permitidas = req.usuario.permissoes?.turmas_permitidas || [];
  const ehMaster = req.usuario.perfil === 'master';
  if (!ehMaster && !permitidas.includes('*') && !permitidas.includes(aluno.turma_codigo)) {
    return res.status(403).json({
      erro: `Você não tem permissão para visualizar dados de alunos da turma ${aluno.turma_codigo}.`
    });
  }

  res.json({ aluno });
});

// Cadastrar novo aluno em uma turma
router.post('/', autenticarToken, (req, res) => {
  const pode = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_alunos;
  if (!pode) {
    return res.status(403).json({ erro: 'Seu perfil não possui permissão para cadastrar alunos.' });
  }

  try {
    const novoAluno = db.criarAluno(req.body);
    res.status(201).json({
      mensagem: `Aluno ${novoAluno.nome} cadastrado com sucesso na turma ${novoAluno.turma_codigo}.`,
      aluno: novoAluno
    });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// Atualizar dados cadastrais do aluno ou trocar foto
router.put('/:id', autenticarToken, (req, res) => {
  const pode = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_alunos;
  if (!pode) {
    return res.status(403).json({ erro: 'Seu perfil não possui permissão para editar dados ou fotos de alunos.' });
  }

  try {
    const alunoAtualizado = db.atualizarAluno(req.params.id, req.body);
    res.json({
      mensagem: `Dados do aluno ${alunoAtualizado.nome} atualizados com sucesso.`,
      aluno: alunoAtualizado
    });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

module.exports = router;
