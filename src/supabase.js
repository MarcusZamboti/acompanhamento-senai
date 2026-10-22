const { Pool } = require('pg');
const config = require('./config');

class SupabaseService {
  constructor() {
    this.habilitado = Boolean(config.DATABASE_URL);
    this.pool = null;

    if (this.habilitado) {
      try {
        this.pool = new Pool({
          connectionString: config.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          },
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000
        });

        this.pool.on('error', (err) => {
          console.error('[Supabase/PostgreSQL] Erro no pool de conexão:', err.message);
        });

        console.log('[Supabase/PostgreSQL] Módulo ativado via DATABASE_URL.');
      } catch (e) {
        console.error('[Supabase/PostgreSQL] Falha ao configurar pool:', e.message);
        this.habilitado = false;
      }
    } else {
      console.log('[Supabase/PostgreSQL] DATABASE_URL não configurada. Operando em modo de armazenamento local.');
    }
  }

  async inicializarTabelas() {
    if (!this.habilitado || !this.pool) return;

    const sqlTabelas = `
      -- Tabela de persistência central do sistema
      CREATE TABLE IF NOT EXISTS senai_dados_sistema (
        chave VARCHAR(50) PRIMARY KEY,
        dados JSONB NOT NULL,
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabelas relacionais para visualização no Table Editor do Supabase
      CREATE TABLE IF NOT EXISTS turmas (
        id VARCHAR(100) PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nome VARCHAR(255),
        modulo VARCHAR(50),
        periodo VARCHAR(50),
        ano_semestre VARCHAR(50),
        sala VARCHAR(100),
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS alunos (
        id VARCHAR(100) PRIMARY KEY,
        turma_codigo VARCHAR(50),
        matricula VARCHAR(50),
        nome VARCHAR(255) NOT NULL,
        foto_url TEXT,
        data_nascimento VARCHAR(50),
        genero VARCHAR(50),
        curso VARCHAR(255),
        rg VARCHAR(50),
        cpf VARCHAR(50),
        empresa_aprendizagem VARCHAR(255),
        dados_completos JSONB,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ocorrencias (
        id VARCHAR(100) PRIMARY KEY,
        aluno_id VARCHAR(100) NOT NULL,
        tipo_classificacao VARCHAR(20) NOT NULL,
        tipo_nome VARCHAR(100) NOT NULL,
        data VARCHAR(20),
        hora VARCHAR(20),
        detalhamento TEXT,
        criado_por_nome VARCHAR(255),
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(100) PRIMARY KEY,
        login VARCHAR(100) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        perfil VARCHAR(50) NOT NULL,
        senha_hash TEXT NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        permissoes JSONB,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    try {
      await this.pool.query(sqlTabelas);
      console.log('[Supabase/PostgreSQL] Tabelas verificadas e prontas no Supabase.');
    } catch (e) {
      console.error('[Supabase/PostgreSQL] Erro ao criar tabelas no Supabase:', e.message);
    }
  }

  async carregarDadosIniciais(dadosLocaisPadrao) {
    if (!this.habilitado || !this.pool) {
      return dadosLocaisPadrao;
    }

    try {
      await this.inicializarTabelas();

      const res = await this.pool.query(
        "SELECT dados FROM senai_dados_sistema WHERE chave = 'banco_principal' LIMIT 1"
      );

      if (res.rows && res.rows.length > 0 && res.rows[0].dados) {
        console.log('[Supabase/PostgreSQL] Dados do sistema carregados com sucesso do Supabase!');
        return res.rows[0].dados;
      }

      // Se for a primeira inicialização do Supabase, salvar os dados locais padrão
      console.log('[Supabase/PostgreSQL] Primeira execução no Supabase. Enviando dados iniciais (auto-seed)...');
      await this.salvarDados(dadosLocaisPadrao);
      return dadosLocaisPadrao;

    } catch (e) {
      console.error('[Supabase/PostgreSQL] Erro ao sincronizar leitura inicial:', e.message);
      return dadosLocaisPadrao;
    }
  }

  async salvarDados(dados) {
    if (!this.habilitado || !this.pool) return;

    try {
      const jsonStr = JSON.stringify(dados);

      // 1. Gravação no repositório mestre com UPSERT
      await this.pool.query(`
        INSERT INTO senai_dados_sistema (chave, dados, atualizado_em)
        VALUES ('banco_principal', $1::jsonb, NOW())
        ON CONFLICT (chave)
        DO UPDATE SET dados = EXCLUDED.dados, atualizado_em = NOW()
      `, [jsonStr]);

      // 2. Sincronização não-bloqueante das tabelas relacionais para visualização no painel Supabase
      this.sincronizarTabelasRelacionais(dados).catch(err => {
        console.warn('[Supabase/PostgreSQL] Aviso na sincronização secundária:', err.message);
      });

    } catch (e) {
      console.error('[Supabase/PostgreSQL] Erro ao persistir dados no Supabase:', e.message);
    }
  }

  async sincronizarTabelasRelacionais(dados) {
    if (!this.habilitado || !this.pool || !dados) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Sincronizar Turmas
      if (Array.isArray(dados.turmas)) {
        for (const t of dados.turmas) {
          await client.query(`
            INSERT INTO turmas (id, codigo, nome, modulo, periodo, ano_semestre, sala)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (codigo) DO UPDATE SET
              nome = EXCLUDED.nome,
              modulo = EXCLUDED.modulo,
              periodo = EXCLUDED.periodo,
              ano_semestre = EXCLUDED.ano_semestre,
              sala = EXCLUDED.sala
          `, [t.id, t.codigo, t.nome, t.modulo, t.periodo, t.ano_semestre, t.sala]);
        }
      }

      // Sincronizar Usuários
      if (Array.isArray(dados.usuarios)) {
        for (const u of dados.usuarios) {
          await client.query(`
            INSERT INTO usuarios (id, login, nome, cargo, perfil, senha_hash, ativo, permissoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
            ON CONFLICT (login) DO UPDATE SET
              nome = EXCLUDED.nome,
              cargo = EXCLUDED.cargo,
              perfil = EXCLUDED.perfil,
              senha_hash = EXCLUDED.senha_hash,
              ativo = EXCLUDED.ativo,
              permissoes = EXCLUDED.permissoes
          `, [u.id, u.login, u.nome, u.cargo, u.perfil, u.senha_hash, u.ativo, JSON.stringify(u.permissoes || {})]);
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new SupabaseService();
