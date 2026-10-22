/**
 * Módulo de Impressão de Relatórios Oficiais SENAI
 * Fiel às imagens image (4).png e image (5).png
 */
const Impressao = {
  abrirRelatorioOcorrencias(aluno) {
    const overlay = document.getElementById('modal-relatorio-impressao');
    const corpo = document.getElementById('conteudo-impressao-relatorio');
    if (!overlay || !corpo) return;

    const ocorrencias = aluno.ocorrencias || [];

    let linhasTabela = '';
    ocorrencias.forEach(o => {
      linhasTabela += `
        <tr>
          <td style="width: 100px; text-align: center;">${ModalDetalhes.formatarData(o.data)}</td>
          <td style="width: 180px; font-weight: bold;">${o.tipo_nome}</td>
          <td>${o.detalhamento}</td>
        </tr>
      `;
    });

    if (ocorrencias.length === 0) {
      linhasTabela = `<tr><td colspan="3" style="text-align: center; padding: 15px;">Nenhum registro encontrado.</td></tr>`;
    }

    corpo.innerHTML = `
      <div class="relatorio-container">
        <!-- Cabeçalho Oficial SENAI -->
        <div class="relatorio-cabecalho-senai">
          <div class="relatorio-logo-senai">SENAI</div>
          <div class="relatorio-texto-escola">
            <div class="escola-nome">Escola SENAI "Theobaldo De Nigris"</div>
            <div class="escola-cfp">CFP 1.18 - Mooca - São Paulo</div>
            <div class="escola-doc-titulo">Relatório das Ocorrências Disciplinares</div>
          </div>
        </div>

        <!-- Tabela com Foto e Dados do Aluno -->
        <table class="relatorio-dados-aluno-tabela">
          <tr>
            <td rowspan="3" style="width: 120px; text-align: center; vertical-align: middle;">
              <img src="${aluno.foto_url || '/assets/fotos/aluno_2.svg'}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #ccc;">
            </td>
            <td>
              <span class="rotulo">Nome</span>
              <strong>${aluno.nome}</strong>
            </td>
            <td style="width: 150px;">
              <span class="rotulo">Idade</span>
              <strong>${aluno.idade_texto || '17 anos'}</strong>
            </td>
          </tr>
          <tr>
            <td>
              <span class="rotulo">Área / Curso</span>
              ${aluno.curso || 'Técnico em Desenvolvimento de Sistemas'}
            </td>
            <td>
              <span class="rotulo">Nº de Matrícula</span>
              <strong>${aluno.matricula}</strong>
            </td>
          </tr>
          <tr>
            <td>
              <span class="rotulo">Turma</span>
              <strong>${aluno.turma_codigo}</strong>
            </td>
            <td>
              <span class="rotulo">Nível</span>
              ${aluno.nivel || 'Técnico'}
            </td>
          </tr>
        </table>

        <div style="font-size: 12px; font-weight: bold; margin: 10px 0; text-align: center;">
          Foram encontrados ${ocorrencias.length} registros no histórico conforme segue:
        </div>

        <!-- Tabela das Ocorrências -->
        <table class="relatorio-tabela-itens">
          <thead>
            <tr>
              <th style="width: 100px; text-align: center;">Data</th>
              <th style="width: 180px;">Tipo de Ocorrência</th>
              <th>Detalhamento</th>
            </tr>
          </thead>
          <tbody>
            ${linhasTabela}
          </tbody>
        </table>
      </div>
    `;

    overlay.classList.add('ativo');
  },

  abrirAcompanhamentoFaltas(aluno) {
    const overlay = document.getElementById('modal-relatorio-impressao');
    const corpo = document.getElementById('conteudo-impressao-relatorio');
    if (!overlay || !corpo) return;

    corpo.innerHTML = `
      <div class="relatorio-container">
        <!-- Cabeçalho Oficial SENAI Faltas -->
        <div class="relatorio-cabecalho-senai">
          <div class="relatorio-logo-senai">SENAI</div>
          <div class="relatorio-texto-escola">
            <div class="escola-nome">Escola SENAI "Theobaldo De Nigris"</div>
            <div class="escola-cfp">CFP 1.18 - Mooca - São Paulo</div>
            <div class="escola-doc-titulo">Acompanhamento de Faltas</div>
          </div>
        </div>

        <!-- Tabela do Aluno -->
        <table class="relatorio-dados-aluno-tabela">
          <tr>
            <td><span class="rotulo">Aluno</span><strong>${aluno.nome}</strong></td>
            <td><span class="rotulo">Número / Matrícula</span><strong>${aluno.matricula}</strong></td>
            <td><span class="rotulo">Turma</span><strong>${aluno.turma_codigo}</strong></td>
          </tr>
          <tr>
            <td><span class="rotulo">Professor</span>${Auth.usuarioAtual?.nome || 'Docente Responsável'}</td>
            <td><span class="rotulo">Comp. Curricular</span>Desenvolvimento de Sistemas</td>
            <td><span class="rotulo">Limite de Faltas</span>25%</td>
          </tr>
        </table>

        <!-- Situação Problema -->
        <div style="border: 1px solid #000; padding: 6px; font-size: 11px; margin-bottom: 8px; background: #f8fafc;">
          <strong>SITUAÇÃO PROBLEMA DETECTADA (DOCENTE):</strong><br>
          1) Infração do Título V Capítulo III Seção I Artigo 56 parágrafo III do regimento Comum das Unidades Escolares SENAI de SP.
        </div>

        <!-- Bloco de Ações e Assinaturas (Fiel à imagem 5) -->
        <table class="relatorio-tabela-itens" style="margin-bottom: 12px;">
          <thead>
            <tr>
              <th style="width: 140px; text-align: center;">DATA</th>
              <th>AÇÃO DA ESCOLA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; vertical-align: middle;">____ / ____ / ________</td>
              <td>
                <p style="margin-bottom: 6px;">Foi informado ao: ( ) Responsável &nbsp;&nbsp; ( ) Aluno(a)</p>
                <p>Acúmulo de faltas (40%) neste componente curricular. Houve reorientação para que reveja a questão da assiduidade.</p>
                <br>
                <div style="display: flex; justify-content: space-between; font-size: 10px;">
                  <div>Ass. Aluno(a): _______________________</div>
                  <div>Docente: _______________________</div>
                  <div>Orientadora Educacional: _______________________</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; vertical-align: middle;">____ / ____ / ________</td>
              <td>
                <p style="margin-bottom: 6px;">Foi informado ao: ( ) Responsável &nbsp;&nbsp; ( ) Aluno/Aluna</p>
                <p>Acúmulo de faltas (60%) neste componente curricular. Houve reorientação quanto à compensação de ausências.</p>
                <br>
                <div style="display: flex; justify-content: space-between; font-size: 10px;">
                  <div>Ass. Aluno(a): _______________________</div>
                  <div>Docente: _______________________</div>
                  <div>Responsável: _______________________</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="border: 1px solid #000; padding: 8px; min-height: 50px; font-size: 11px;">
          <strong>Observações:</strong>
        </div>

        <div style="text-align: right; font-size: 10px; margin-top: 8px; color: #555;">
          1.36-PED-02-V.03
        </div>
      </div>
    `;

    overlay.classList.add('ativo');
  },

  fechar() {
    const overlay = document.getElementById('modal-relatorio-impressao');
    if (overlay) overlay.classList.remove('ativo');
  },

  dispararImpressao() {
    window.print();
  }
};
