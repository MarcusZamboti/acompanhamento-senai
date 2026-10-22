/**
 * Gerador de retratos vetoriais SVG de alta fidelidade para os alunos.
 * Gera avatares estáticos em public/assets/fotos/ para que o carômetro
 * tenha fotos individuais nítidas, atraentes e fiéis ao estilo escolar.
 */
const fs = require('fs');
const path = require('path');

const dirFotos = path.join(__dirname, '..', 'public', 'assets', 'fotos');
if (!fs.existsSync(dirFotos)) {
  fs.mkdirSync(dirFotos, { recursive: true });
}

// Definição de paletas e características
const configs = {
  bryan: {
    pele: '#c9966b',
    cabelo: '#1b1b1b',
    estiloCabelo: 'cacheado_volumoso',
    oculos: true,
    roupa: '#292d34',
    camisaGola: '#f3f4f6',
    nome: 'Bryan'
  },
  aluna_1: {
    pele: '#bb8864',
    cabelo: '#1e1a18',
    estiloCabelo: 'longo_liso',
    oculos: false,
    roupa: '#254e70',
    camisaGola: '#ffffff',
    nome: 'Ana'
  },
  aluno_2: {
    pele: '#caa078',
    cabelo: '#221915',
    estiloCabelo: 'ondulado_curto',
    oculos: false,
    roupa: '#4a5568',
    camisaGola: '#ffffff',
    nome: 'Carlos'
  },
  aluna_3: {
    pele: '#d8b08f',
    cabelo: '#2a1a15',
    estiloCabelo: 'longo_ondulado',
    oculos: false,
    roupa: '#1f2937',
    camisaGola: '#ffffff',
    nome: 'Mariana'
  },
  aluno_4: {
    pele: '#8d5538',
    cabelo: '#181210',
    estiloCabelo: 'curto_degrade',
    oculos: false,
    roupa: '#374151',
    camisaGola: '#ffffff',
    nome: 'Gabriel'
  },
  aluna_5: {
    pele: '#caa27e',
    cabelo: '#9b2c2c',
    estiloCabelo: 'ruivo_franja',
    oculos: false,
    roupa: '#cbd5e1',
    camisaGola: '#ffffff',
    nome: 'Leticia'
  },
  aluno_6: {
    pele: '#d4a373',
    cabelo: '#231f20',
    estiloCabelo: 'curto_topete',
    oculos: false,
    roupa: '#334155',
    camisaGola: '#ffffff',
    nome: 'Matheus'
  },
  aluna_7: {
    pele: '#9c6644',
    cabelo: '#1a181b',
    estiloCabelo: 'cacheado_longo',
    oculos: false,
    roupa: '#1e293b',
    camisaGola: '#dc2626',
    nome: 'Larissa'
  },
  aluno_8: {
    pele: '#e0b593',
    cabelo: '#1a1a1a',
    estiloCabelo: 'curto_liso',
    oculos: false,
    roupa: '#111827',
    camisaGola: '#ffffff',
    nome: 'Rafael'
  },
  aluno_9: {
    pele: '#d4a373',
    cabelo: '#221f1f',
    estiloCabelo: 'raspado',
    oculos: false,
    roupa: '#1e3a8a',
    camisaGola: '#ffffff',
    nome: 'Vinicius'
  },
  aluna_10: {
    pele: '#e7c6a5',
    cabelo: '#3d2314',
    estiloCabelo: 'rabo_cavalo',
    oculos: true,
    roupa: '#1f2937',
    camisaGola: '#ffffff',
    nome: 'Beatriz'
  },
  aluno_11: {
    pele: '#c89d7c',
    cabelo: '#1c1917',
    estiloCabelo: 'cacheado_medio',
    oculos: false,
    roupa: '#0f172a',
    camisaGola: '#ffffff',
    nome: 'Lucas'
  },
  aluna_12: {
    pele: '#e8c5a0',
    cabelo: '#291b15',
    estiloCabelo: 'longo_franja',
    oculos: true,
    roupa: '#334155',
    camisaGola: '#ffffff',
    nome: 'Giulia'
  },
  aluno_13: {
    pele: '#9a6b4a',
    cabelo: '#181514',
    estiloCabelo: 'black_power',
    oculos: false,
    roupa: '#1e293b',
    camisaGola: '#ffffff',
    nome: 'Felipe'
  },
  aluna_14: {
    pele: '#e5bfa1',
    cabelo: '#332219',
    estiloCabelo: 'ondulado_medio',
    oculos: false,
    roupa: '#be123c',
    camisaGola: '#ffffff',
    nome: 'Sophia'
  },
  aluno_15: {
    pele: '#cca27c',
    cabelo: '#1f1b19',
    estiloCabelo: 'curto_social',
    oculos: false,
    roupa: '#0369a1',
    camisaGola: '#ffffff',
    nome: 'Joao'
  },
  // Alunos DEV2N
  aluno_dev1: {
    pele: '#c59b7b',
    cabelo: '#1e1a17',
    estiloCabelo: 'curto_topete',
    oculos: false,
    roupa: '#1e293b',
    camisaGola: '#ffffff',
    nome: 'Arthur'
  },
  aluna_dev2: {
    pele: '#8f5c38',
    cabelo: '#1a1819',
    estiloCabelo: 'trancas_longas',
    oculos: true,
    roupa: '#0f766e',
    camisaGola: '#ffffff',
    nome: 'Brenda'
  },
  aluno_dev3: {
    pele: '#e2ba99',
    cabelo: '#2d1f19',
    estiloCabelo: 'ondulado_curto',
    oculos: true,
    roupa: '#334155',
    camisaGola: '#ffffff',
    nome: 'Caio'
  },
  aluna_dev4: {
    pele: '#dcae8a',
    cabelo: '#1c1917',
    estiloCabelo: 'longo_liso',
    oculos: false,
    roupa: '#4338ca',
    camisaGola: '#ffffff',
    nome: 'Daniela'
  },
  aluno_dev5: {
    pele: '#8c5836',
    cabelo: '#151415',
    estiloCabelo: 'curto_degrade',
    oculos: false,
    roupa: '#1e293b',
    camisaGola: '#ffffff',
    nome: 'Enzo'
  },
  aluna_dev6: {
    pele: '#e8c4a2',
    cabelo: '#6b3018',
    estiloCabelo: 'longo_ondulado',
    oculos: false,
    roupa: '#047857',
    camisaGola: '#ffffff',
    nome: 'Fernanda'
  },
  aluno_dev7: {
    pele: '#cca07b',
    cabelo: '#1f1a18',
    estiloCabelo: 'raspado',
    oculos: false,
    roupa: '#374151',
    camisaGola: '#ffffff',
    nome: 'Guilherme'
  },
  aluna_dev8: {
    pele: '#d8aa84',
    cabelo: '#191717',
    estiloCabelo: 'cacheado_volumoso',
    oculos: true,
    roupa: '#b91c1c',
    camisaGola: '#ffffff',
    nome: 'Helena'
  },
  // Alunos BG3M
  aluno_bg1: {
    pele: '#caa27e',
    cabelo: '#1d1917',
    estiloCabelo: 'curto_social',
    oculos: true,
    roupa: '#0284c7',
    camisaGola: '#ffffff',
    nome: 'Igor'
  },
  aluna_bg2: {
    pele: '#e2bc9b',
    cabelo: '#3b2219',
    estiloCabelo: 'rabo_cavalo',
    oculos: false,
    roupa: '#059669',
    camisaGola: '#ffffff',
    nome: 'Juliana'
  }
};

function gerarSvg(c) {
  const oculosSvg = c.oculos ? `
    <!-- Óculos -->
    <g stroke="#1e293b" stroke-width="4" fill="none">
      <rect x="75" y="112" width="42" height="30" rx="7" fill="rgba(255,255,255,0.2)"/>
      <rect x="133" y="112" width="42" height="30" rx="7" fill="rgba(255,255,255,0.2)"/>
      <line x1="117" y1="124" x2="133" y2="124"/>
      <line x1="58" y1="120" x2="75" y2="122"/>
      <line x1="175" y1="122" x2="192" y2="120"/>
    </g>
  ` : '';

  let cabeloSvg = '';
  if (c.estiloCabelo === 'cacheado_volumoso') {
    cabeloSvg = `
      <g fill="${c.cabelo}">
        <circle cx="125" cy="85" r="62"/>
        <circle cx="85" cy="80" r="32"/>
        <circle cx="165" cy="80" r="32"/>
        <circle cx="68" cy="115" r="28"/>
        <circle cx="182" cy="115" r="28"/>
        <circle cx="65" cy="145" r="25"/>
        <circle cx="185" cy="145" r="25"/>
        <circle cx="125" cy="55" r="32"/>
        <circle cx="100" cy="62" r="30"/>
        <circle cx="150" cy="62" r="30"/>
      </g>
    `;
  } else if (c.estiloCabelo === 'longo_liso') {
    cabeloSvg = `
      <g fill="${c.cabelo}">
        <path d="M 60,110 C 60,60 190,60 190,110 L 195,240 C 185,240 170,200 170,170 C 170,120 80,120 80,170 C 80,200 65,240 55,240 Z"/>
      </g>
    `;
  } else if (c.estiloCabelo === 'trancas_longas') {
    cabeloSvg = `
      <g fill="${c.cabelo}">
        <path d="M 65,100 C 65,60 185,60 185,100 L 195,250 C 175,250 170,190 170,160 C 170,105 80,105 80,160 C 80,190 75,250 55,250 Z"/>
        <line x1="75" y1="100" x2="70" y2="245" stroke="#333" stroke-width="2"/>
        <line x1="85" y1="110" x2="80" y2="245" stroke="#333" stroke-width="2"/>
        <line x1="165" y1="110" x2="170" y2="245" stroke="#333" stroke-width="2"/>
        <line x1="175" y1="100" x2="180" y2="245" stroke="#333" stroke-width="2"/>
      </g>
    `;
  } else if (c.estiloCabelo === 'ruivo_franja') {
    cabeloSvg = `
      <g fill="${c.cabelo}">
        <path d="M 60,110 C 60,55 190,55 190,110 L 195,230 C 180,230 170,180 170,150 C 170,110 80,110 80,150 C 80,180 70,230 55,230 Z"/>
        <path d="M 72,110 Q 125,125 178,110 Q 125,95 72,110 Z" fill="${c.cabelo}"/>
      </g>
    `;
  } else if (c.estiloCabelo === 'curto_topete' || c.estiloCabelo === 'curto_social') {
    cabeloSvg = `
      <path d="M 70,115 C 68,60 182,60 180,115 C 180,85 160,65 125,62 C 90,65 70,85 70,115 Z" fill="${c.cabelo}"/>
      <path d="M 70,110 Q 125,75 180,110 C 170,95 155,80 125,80 C 95,80 80,95 70,110 Z" fill="${c.cabelo}"/>
    `;
  } else if (c.estiloCabelo === 'raspado') {
    cabeloSvg = `
      <path d="M 75,115 C 75,70 175,70 175,115 Z" fill="${c.cabelo}" opacity="0.4"/>
    `;
  } else {
    // padrão ondulado/curto
    cabeloSvg = `
      <path d="M 68,115 C 68,62 182,62 182,115 C 175,85 155,70 125,70 C 95,70 75,85 68,115 Z" fill="${c.cabelo}"/>
      <circle cx="75" cy="95" r="14" fill="${c.cabelo}"/>
      <circle cx="175" cy="95" r="14" fill="${c.cabelo}"/>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 300" width="250" height="300">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="corpoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c.roupa}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Fundo estúdio suave -->
  <rect width="250" height="300" fill="url(#bgGrad)"/>
  
  <!-- Sombra do Aluno -->
  <ellipse cx="125" cy="285" rx="90" ry="12" fill="rgba(0,0,0,0.08)"/>

  <!-- Vestimenta / Camisa / Casaco SENAI -->
  <g filter="url(#softShadow)">
    <path d="M 35,300 C 40,230 75,200 125,200 C 175,200 210,230 215,300 Z" fill="url(#corpoGrad)"/>
    <!-- Gola interna / camiseta branca -->
    <path d="M 105,200 L 125,230 L 145,200 Z" fill="${c.camisaGola}"/>
    <!-- Detalhe da jaqueta -->
    <path d="M 125,230 L 125,300" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <!-- Logo discreto SENAI no peito esquerdo -->
    <rect x="155" y="240" width="24" height="7" rx="1.5" fill="#e11d48"/>
    <rect x="158" y="242" width="18" height="3" fill="#ffffff"/>
  </g>

  <!-- Pescoço -->
  <rect x="108" y="160" width="34" height="48" rx="6" fill="${c.pele}"/>
  <path d="M 108,185 C 118,195 132,195 142,185 L 142,200 L 108,200 Z" fill="rgba(0,0,0,0.1)"/>

  <!-- Orelhas -->
  <circle cx="75" cy="135" r="14" fill="${c.pele}"/>
  <circle cx="175" cy="135" r="14" fill="${c.pele}"/>

  <!-- Cabeça / Rosto -->
  <ellipse cx="125" cy="135" rx="50" ry="58" fill="${c.pele}" filter="url(#softShadow)"/>

  <!-- Olhos -->
  <ellipse cx="102" cy="126" rx="6.5" ry="5.5" fill="#ffffff"/>
  <ellipse cx="148" cy="126" rx="6.5" ry="5.5" fill="#ffffff"/>
  <circle cx="103" cy="126" r="3.2" fill="#1f2937"/>
  <circle cx="147" cy="126" r="3.2" fill="#1f2937"/>
  <circle cx="104.5" cy="124.5" r="1.2" fill="#ffffff"/>
  <circle cx="148.5" cy="124.5" r="1.2" fill="#ffffff"/>

  <!-- Sobrancelhas -->
  <path d="M 92,115 Q 103,110 114,115" stroke="${c.cabelo}" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M 136,115 Q 147,110 158,115" stroke="${c.cabelo}" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Nariz -->
  <path d="M 125,126 L 122,143 Q 125,146 128,143" stroke="rgba(0,0,0,0.25)" stroke-width="2.5" stroke-linecap="round" fill="none"/>

  <!-- Boca com sorriso amigável -->
  <path d="M 112,158 Q 125,168 138,158" stroke="#991b1b" stroke-width="2.8" stroke-linecap="round" fill="none"/>

  <!-- Óculos (se configurado) -->
  ${oculosSvg}

  <!-- Cabelo Frontal / Estilizado -->
  ${cabeloSvg}

</svg>`;
}

for (const [key, conf] of Object.entries(configs)) {
  const filePath = path.join(dirFotos, `${key}.png`);
  // Salvar como SVG (compatível nativamente com <img> e background-image)
  const svgPath = path.join(dirFotos, `${key}.svg`);
  const svgContent = gerarSvg(conf);
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  // Criar também com extensão .png que o navegador aceita como imagem vetorial se servido com mime correto ou espelhar
  fs.writeFileSync(filePath, svgContent, 'utf-8');
}

console.log('Retratos gerados com sucesso em:', dirFotos);
