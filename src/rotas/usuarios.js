const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { autenticarToken } = require('../middleware/autenticacao');
const { exigirMaster } = require('../middleware/controle_acesso');

// Todas as rotas deste arquivo exigem autenticação e permissão de Usuário Master
router.use(autenticarToken);
router.use(exigirMaster);

// Listar todos os usuários cadastrados
router.get('/', (req, res) => {
  const usuarios = db.obterTodosUsuarios();
  res.json({ usuarios });
});

// Listar todas as turmas cadastradas para compor o formulário de permissões
router.get('/turmas-disponiveis', (req, res) => {
  const turmas = db.dados.turmas;
  res.json({ turmas });
});

// Obter detalhes de um usuário específico
router.get('/:id', (req, res) => {
  const usuario = db.obterUsuarioPorId(req.params.id);
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  res.json({ usuario });
});

// Criar novo usuário
router.post('/', (req, res) => {
  const { login, nome, cargo, perfil, senha, permissoes } = req.body;

  if (!login || !nome || !senha) {
    return res.status(400).json({
      erro: 'Preencha os campos obrigatórios: login, nome e senha.'
    });
  }

  try {
    const senha_hash = bcrypt.hashSync(senha, 10);
    const novoUsuario = db.criarUsuario({
      login,
      nome,
      cargo,
      perfil,
      senha_hash,
      permissoes
    });

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso pelo Usuário Master.',
      usuario: novoUsuario
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// Atualizar usuário e suas permissões
router.put('/:id', (req, res) => {
  const { login, nome, cargo, perfil, senha, ativo, permissoes } = req.body;

  try {
    const dadosAtualizacao = {};
    if (login) dadosAtualizacao.login = login;
    if (nome) dadosAtualizacao.nome = nome;
    if (cargo !== undefined) dadosAtualizacao.cargo = cargo;
    if (perfil) dadosAtualizacao.perfil = perfil;
    if (typeof ativo === 'boolean') dadosAtualizacao.ativo = ativo;
    if (permissoes) dadosAtualizacao.permissoes = permissoes;
    if (senha && senha.trim()) {
      dadosAtualizacao.senha_hash = bcrypt.hashSync(senha, 10);
    }

    const usuarioAtualizado = db.atualizarUsuario(req.params.id, dadosAtualizacao);
    res.json({
      mensagem: 'Usuário e permissões atualizados com sucesso.',
      usuario: usuarioAtualizado
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// Alternar status ativo/inativo
router.patch('/:id/status', (req, res) => {
  try {
    const usuario = db.alternarStatusUsuario(req.params.id);
    res.json({
      mensagem: `Status do usuário alterado para ${usuario.ativo ? 'Ativo' : 'Inativo'}.`,
      usuario
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;
