const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ erro: 'Acesso não autorizado. Faça login para continuar.' });
  }

  try {
    const decodificado = jwt.verify(token, config.JWT_SECRET);
    const usuario = db.obterUsuarioPorId(decodificado.id);

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário associado ao token não existe.' });
    }

    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Este usuário foi desativado pelo administrador master.' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Sessão inválida ou expirada. Efetue login novamente.' });
  }
}

module.exports = {
  autenticarToken
};
