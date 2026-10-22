/**
 * Middleware para controle de acesso granular baseado em RBAC e permissões
 */

function exigirMaster(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }

  const ehMaster = req.usuario.perfil === 'master' || req.usuario.permissoes?.pode_gerenciar_usuarios;
  if (!ehMaster) {
    return res.status(403).json({
      erro: 'Acesso negado. Apenas o Usuário Master possui permissão para gerenciar usuários e perfis.'
    });
  }

  next();
}

function verificarAcessoTurma(req, res, next) {
  const codigoTurma = req.params.codigo;
  if (!codigoTurma) return next();

  if (codigoTurma.toUpperCase() === 'TODAS') {
    return next();
  }

  const permissoes = req.usuario.permissoes;
  const ehMaster = req.usuario.perfil === 'master';

  if (ehMaster || (permissoes && permissoes.turmas_permitidas && permissoes.turmas_permitidas.includes('*'))) {
    return next();
  }

  if (permissoes && permissoes.turmas_permitidas && permissoes.turmas_permitidas.includes(codigoTurma.toUpperCase())) {
    return next();
  }

  return res.status(403).json({
    erro: `Você não tem permissão para acessar a turma ${codigoTurma}. Solicite liberação ao Usuário Master.`
  });
}

module.exports = {
  exigirMaster,
  verificarAcessoTurma
};
