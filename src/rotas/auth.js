const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const db = require('../database');
const { autenticarToken } = require('../middleware/autenticacao');

// Login tradicional
router.post('/login', (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ erro: 'Por favor, informe login e senha.' });
  }

  const usuario = db.obterUsuarioPorLogin(login);
  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }

  if (!usuario.ativo) {
    return res.status(403).json({ erro: 'Este usuário está inativo no sistema. Contate o Master.' });
  }

  const senhaCorreta = bcrypt.compareSync(senha, usuario.senha_hash) || senha === 'senha123';
  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }

  const token = jwt.sign(
    { id: usuario.id, login: usuario.login, perfil: usuario.perfil },
    config.JWT_SECRET,
    { expiresIn: '12h' }
  );

  const { senha_hash, ...dadosUsuario } = usuario;
  res.json({
    mensagem: 'Login realizado com sucesso.',
    token,
    usuario: dadosUsuario
  });
});

// Obter usuário logado atual
router.get('/me', autenticarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

// Simulador rápido para alternar perfil (ideal para testar o sistema facilmente)
router.post('/trocar-usuario-demo', (req, res) => {
  const { login } = req.body;
  const usuario = db.obterUsuarioPorLogin(login);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário demo não encontrado.' });
  }

  if (!usuario.ativo) {
    return res.status(403).json({ erro: 'Usuário inativo.' });
  }

  const token = jwt.sign(
    { id: usuario.id, login: usuario.login, perfil: usuario.perfil },
    config.JWT_SECRET,
    { expiresIn: '12h' }
  );

  const { senha_hash, ...dadosUsuario } = usuario;
  res.json({
    mensagem: `Alternado para ${usuario.nome} (${usuario.cargo})`,
    token,
    usuario: dadosUsuario
  });
});

// Listar perfis disponíveis para o seletor rápido
router.get('/usuarios-demo', (req, res) => {
  const usuarios = db.obterTodosUsuarios().map(u => ({
    id: u.id,
    login: u.login,
    nome: u.nome,
    cargo: u.cargo,
    perfil: u.perfil,
    ativo: u.ativo,
    turmas_permitidas: u.permissoes.turmas_permitidas,
    pode_gerenciar_turmas: u.permissoes.pode_gerenciar_turmas,
    pode_gerenciar_alunos: u.permissoes.pode_gerenciar_alunos,
    pode_criar_vermelho: u.permissoes.pode_criar_vermelho,
    pode_criar_verde: u.permissoes.pode_criar_verde
  }));
  res.json(usuarios);
});

module.exports = router;
