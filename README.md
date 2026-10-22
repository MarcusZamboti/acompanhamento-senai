# Sistema de Acompanhamento Escolar e Gestão Educacional - SENAI Theobaldo De Nigris

Sistema web completo de acompanhamento pedagógico e gestão escolar desenvolvido com base nas diretrizes visuais e mecânicas da Escola SENAI "Theobaldo De Nigris" (CFP 1.18 - Mooca / São Paulo - SP).

---

## 🚀 Como Executar o Sistema

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Navegador web moderno (Chrome, Edge, Firefox, Safari)

### Passos de Inicialização
1. Abra o terminal na pasta do projeto:
   ```bash
   cd "C:\Users\sn1089046\Desktop\Projeto Senai"
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
3. Acesse no navegador:
   **[http://localhost:3000](http://localhost:3000)**

---

## 👥 Matriz de Perfis e Permissões de Acesso (RBAC)

O usuário **Master** possui controle total e pode definir granularmente as permissões de cada colaborador:

| Usuário | Login | Senha Padrão | Perfil | Turmas Autorizadas | Gerenciar Turmas | Cadastrar Alunos & Fotos | Criar Vermelho (Adv/Orient) | Criar Verde (Elogios) | Excluir Ocorrências | Painel Master |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Márcio Silva** | `master` | `senha123` | **Master** | Todas (`*`) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ **Sim** |
| **Cristina Santos** | `cristina` | `senha123` | **Coordenador** | Todas (`*`) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Não |
| **Rodrigo Azevedo**| `rodrigo` | `senha123` | **Professor** | `SEDUC2-DEVALD`, `DEV2N` | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Não | ❌ Não |
| **Carlos Mendes** | `carlos` | `senha123` | **Professor** | Apenas `DEV2N` | ❌ Não | ❌ Não | ❌ Não (Bloqueado) | ✅ Sim (Elogios) | ❌ Não | ❌ Não |

> [!TIP]
> **Simulador Rápido de Perfis**: No topo da tela existe um seletor rápido para alternar instantaneamente entre perfis e testar as restrições em tempo real sem precisar deslogar.

---

## 📋 Melhorias e Novas Funcionalidades Implementadas

### 1. Correção de Estabilidade Visual (Nomes sem Piscar)
- **Causa identificada**: O efeito CSS `translateY(-4px)` no `:hover` causava um ciclo infinito de eventos `mouseenter`/`mouseleave` na borda do card, fazendo fotos e nomes oscilarem.
- **Solução implementada**:
  - Eliminação de transformações que alteram a caixa de colisão do mouse.
  - O nome do aluno agora ocupa uma barra inferior estável e de alto contraste (`.card-aluno-nome-box`), separada da foto.
  - Aplicação de `pointer-events: none` nos filhos do card e no tooltip flutuante, garantindo transição suave e zero piscamento.

### 2. Gestão de Turmas (Criação de Novas Turmas)
- Botão **[➕ Nova Turma]** acessível no topo e no painel administrativo para usuários com permissão.
- Permite definir: Código da Turma (ex: `GRAF1M`, `DEV3N`), Nome do Curso, Módulo, Período, Ano/Semestre e Sala/Laboratório.
- A nova turma criada passa a compor imediatamente a barra de abas e os filtros do sistema.

### 3. Gestão de Alunos e Upload de Fotos
- Botão **[👤+ Novo Aluno]** para cadastrar novos alunos diretamente na turma ativa.
- **Upload Real de Fotos**: Permite selecionar fotos do computador (JPG, PNG, WebP) com **pré-visualização instantânea** antes de salvar.
- **Troca de Foto na Ficha do Aluno**: Ao abrir a ficha detalhada de qualquer aluno, o botão **[📸 Alterar Foto]** permite atualizar o retrato do aluno com recarregamento imediato no carômetro.

### 4. Identidade Oficial: SENAI Theobaldo De Nigris
- Adequação completa da marca para **Escola SENAI "Theobaldo De Nigris" (CFP 1.18 - Mooca - São Paulo)**.
- Cabeçalhos oficiais, logotipo, rodapé e relatórios de impressão (*Relatório das Ocorrências Disciplinares* e *Acompanhamento de Faltas*) devidamente atualizados.
