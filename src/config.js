const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'chave-secreta-senai-theobaldo-de-nigris-2026',
  CAMINHO_BANCO: path.join(__dirname, '..', 'data', 'banco_de_dados.json'),
  CAMINHO_PUBLIC: path.join(__dirname, '..', 'public')
};
