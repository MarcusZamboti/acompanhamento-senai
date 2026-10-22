const express = require('express');
const router = express.Router();
const db = require('../database');
const { autenticarToken } = require('../middleware/autenticacao');

// Listar tipos disponíveis de ocorrências
router.get('/tipos', autenticarToken, (req, res) => {
  const tipos = db.obterTiposOcorrencia();
  res.json({ tipos });
});

// Registrar nova ocorrência
router.post('/', autenticarToken, (req, res) => {
  const { aluno_id, tipo_nome, data, hora, detalhamento } = req.body;

  if (!aluno_id || !tipo_nome || !detalhamento) {
    return res.status(400).json({
      erro: 'Dados incompletos. Informe o aluno, o tipo de ocorrência e o detalhamento.'
    });
  }

  try {
    const resultado = db.criarOcorrencia({
      aluno_id,
      tipo_nome,
      data,
      hora,
      detalhamento,
      usuario: req.usuario
    });

    res.status(201).json({
      mensagem: 'Ocorrência registrada com sucesso.',
      ...resultado
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// Excluir ocorrência (se permitido)
router.delete('/:id', autenticarToken, (req, res) => {
  const idOcorrencia = req.params.id;

  try {
    const resultado = db.excluirOcorrencia(idOcorrencia, req.usuario);
    res.json({
      mensagem: 'Ocorrência excluída com sucesso.',
      ...resultado
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

module.exports = router;
