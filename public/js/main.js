/**
 * Ponto de Entrada Principal da Aplicação Frontend
 * Sistema de Acompanhamento Escolar - Escola SENAI Theobaldo De Nigris
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inicializar autenticação e perfis (exibe Tela de Login se deslogado)
  await Auth.inicializar();

  // 2. Se já autenticado, inicializar o carômetro e turmas
  if (Auth.usuarioAtual) {
    await Carometro.inicializar();
  }

  // 3. Vincular botões do cabeçalho
  const btnAdmin = document.getElementById('btn-abrir-admin');
  if (btnAdmin) {
    btnAdmin.onclick = () => AdminUsuarios.abrir();
  }

  const btnSair = document.getElementById('btn-sair-sistema');
  if (btnSair) {
    btnSair.onclick = () => Auth.logout();
  }

  // 4. Fechamento de modais ao clicar no overlay ou pressionar ESC
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('ativo');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.ativo').forEach(modal => {
        modal.classList.remove('ativo');
      });
    }
  });

  console.log('Sistema de Acompanhamento Escolar SENAI Theobaldo De Nigris inicializado com sucesso.');
});
