const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Middleware para fotos: garante que vetores SVG com extensão .png sejam servidos com mime correto
app.use('/assets/fotos', (req, res, next) => {
  const fs = require('fs');
  const filePath = path.join(config.CAMINHO_PUBLIC, 'assets', 'fotos', req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      const buffer = fs.readFileSync(filePath);
      const start = buffer.subarray(0, 50).toString('utf-8');
      if (start.includes('<svg') || start.includes('<?xml')) {
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        return res.send(buffer);
      }
    } catch (err) {
      // prosseguir com estático normal
    }
  }
  next();
});

// Servir arquivos estáticos do frontend
app.use(express.static(config.CAMINHO_PUBLIC));
// Permitir acesso às imagens originais em public/assets
app.use('/assets', express.static(path.join(config.CAMINHO_PUBLIC, 'assets')));

// Rotas da API RESTful
app.use('/api/auth', require('./rotas/auth'));
app.use('/api/turmas', require('./rotas/turmas'));
app.use('/api/alunos', require('./rotas/alunos'));
app.use('/api/ocorrencias', require('./rotas/ocorrencias'));
app.use('/api/usuarios', require('./rotas/usuarios'));

// Rota de status do sistema
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    sistema: 'Acompanhamento Escolar - SENAI Theobaldo De Nigris',
    versao: '2.1',
    dataHora: new Date().toISOString()
  });
});

// Fallback para SPA (Single Page Application)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(config.CAMINHO_PUBLIC, 'index.html'));
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ erro: 'Endpoint da API não encontrado.' });
  }
  next();
});

// Tratamento de erros não capturados
app.use((err, req, res, next) => {
  console.error('Erro interno do servidor:', err);
  res.status(500).json({
    erro: 'Ocorreu um erro interno no servidor.',
    detalhes: err.message
  });
});

// Iniciar servidor apenas se executado diretamente
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`=============================================================`);
    console.log(`  SISTEMA DE ACOMPANHAMENTO ESCOLAR - SENAI THEOBALDO DE NIGRIS`);
    console.log(`  Servidor rodando em: http://localhost:${config.PORT}       `);
    console.log(`=============================================================`);
  });
}

module.exports = app;
