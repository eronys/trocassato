# Especificação de Design de Páginas (Desktop-first) — MVP TROCASSATO

## Estilos Globais (Design System)
- **Tema**: Dark Mode institucional.
- **Tokens**
  - Primary/Action: `#F7931A`
  - Background: `#000000`
  - Surface: `#1A1A1A`
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#A9A9A9`
  - Success: `#22C55E` | Danger: `#EF4444`
- **Tipografia**
  - UI/Títulos: Inter 700/400
  - Dados/valores: Roboto Mono (Sats, endereços, txid)
- **Componentes base**
  - Botão primário: fundo Primary, texto preto, hover com leve aumento de brilho; desabilitado com opacidade 40%.
  - Inputs: fundo Surface, borda 1px #2A2A2A, focus ring em Primary.
  - Cards: Surface, raio 12px, sombra sutil, espaçamento interno 16px.
- **Layout/Responsividade**
  - Desktop-first com grid central **max-width 1200px**; colunas 12 (CSS Grid) + Flexbox interno.
  - Breakpoints: 1200+ (desktop), 768–1199 (tablet), <768 (mobile) com empilhamento.

---

## Página: Login (Usuário)
### Meta Information
- Title: "TROCASSATO — Entrar"
- Description: "Acesse com e-mail e senha."

### Estrutura
- **Header**: logo minimalista.
- **Conteúdo (coluna única, 420–520px)**
  - Campo: E-mail
  - Campo: Senha
  - Botão primário: "Entrar"
  - Link secundário: "Tenho um convite" (leva para onboarding por convite)

### Estados/Interações
- Erro de autenticação: mensagem curta (ex.: "E-mail ou senha inválidos").
- Após login: redirecionar para Catálogo.

---

## Página: Onboarding por Convite
### Meta Information
- Title: "TROCASSATO — Cadastro"
- Description: "Cadastre-se via convite e aguarde aprovação do anfitrião."
- OG: title/description iguais + imagem da marca.

### Estrutura
- **Header (fixo, simples)**: logo minimalista centralizado.
- **Conteúdo (coluna única, 520–640px)**
  - Campos: Nome completo, E-mail, CPF, Foto de perfil (upload câmera/galeria).
  - Ajuda: textos curtos em Text Secondary (ex.: "CPF com 11 dígitos").
- **Footer (fixo)**: botão primário largo "Finalizar Cadastro".

### Estados/Interações
- Validação inline (mensagens curtas, sem jargão).
- Ao enviar: modal/overlay "Aguardando aprovação de [Nome do Anfitrião]".
- Enquanto pendente: ocultar/desabilitar navegação inferior.

---

## Página: Tela Principal (Catálogo)
### Meta Information
- Title: "TROCASSATO — Catálogo"
- Description: "Explore negócios na sua rede."

### Estrutura
- **Topbar**: título "Catálogo" + acesso a Busca, Notificações (se anfitrião), Perfil.
- **Banner de status (⭐)**: faixa fixa no topo do conteúdo: "Seu acesso está sendo validado...".
- **Grid de cards** (3 colunas no desktop, 2 no tablet, 1 no mobile)
  - Card: imagem, título, valor (BRL e/ou Sats se aplicável), vendedor.

### Estados/Interações
- Clique abre detalhe.
- Se ⭐: ação de compra bloqueada no detalhe e sinalizada com cadeado.

---

## Página: Detalhe + Checkout
### Meta Information
- Title: "TROCASSATO — Detalhes"
- Description: "Confira o item e confirme o pagamento com segurança."

### Estrutura
- **Layout 2 colunas (desktop)**
  - Esquerda: imagem grande + descrição.
  - Direita (card sticky): resumo de pagamento.
- **Resumo**
  - Bloco "Você está pagando a [Nome]" com foto do vendedor.
  - Linha social: "Este vendedor foi convidado por seu amigo [Anfitrião]".
  - Valor em **Roboto Mono** e cor Primary.
  - Aviso legal no rodapé (Text Secondary).
- **Confirmação segura**
  - Controle do tipo "segurar para confirmar" (ou slider) como ação primária.

### Processamento
- Overlay escuro + animação (Lottie) central + texto "Confirmando transação na rede...".
- Ao sucesso: toast + redirecionar para Perfil/Historico.

---

## Página: Busca na Rede
### Meta Information
- Title: "TROCASSATO — Buscar"
- Description: "Encontre vendedores e veja conexões de convite."

### Estrutura
- **Barra de busca fixa** com ícone de lupa.
- **Lista vertical de resultados**
  - Item: foto, nome, estrelas, badge social "Convidado por [X]" (destaque em Primary ou borda Primary).

---

## Página: Perfil / Reputação / Meus Negócios
### Meta Information
- Title: "TROCASSATO — Perfil"
- Description: "Acompanhe reputação, histórico e seus negócios."

### Estrutura (dashboard)
- **Header**: foto + nome + badge de nível (estrelas).
- **Card progresso**: progress bar para próximo nível + texto de critérios (curto).
- **Histórico**: tabela/lista (data, valor, status, avaliação).
- **Seção vendedor (⭐⭐)**: CTA "Cadastrar Negócio" e lista de itens.

### Modal/Form: Cadastro de Negócio
- Coluna única: Título (<=50), Descrição (<=200), Valor BRL (máscara R$).
- Box de preview: "≈ [Sats]" em Roboto Mono e Primary.
- Botão: "Publicar Negócio".

---

## Página: Notificações (Sininho) do Anfitrião
### Meta Information
- Title: "TROCASSATO — Notificações"

### Estrutura
- Lista de cards horizontais:
  - Esquerda: foto circular.
  - Centro: nome + "Quer entrar na rede".
  - Direita: botão **Success** (check) e **Danger** (X).

### Interações
- Ao aprovar/recusar: animação curta e remoção do card.

---

## Página: Portal Admin
### Meta Information
- Title: "TROCASSATO — Admin"
- Description: "Monitoramento da árvore de convites e mitigação de fraude."

### Pré-condição
- Exigir autenticação do admin; se não autenticado, redirecionar para `/admin/login`.

---

## Página: Login (Admin)
### Meta Information
- Title: "TROCASSATO — Admin Login"
- Description: "Acesso restrito ao portal administrativo."

### Estrutura
- **Layout central (coluna única, 420–520px)**
  - Campo: Usuário
  - Campo: Senha
  - Botão primário: "Entrar"

### Estados/Interações
- Erro: "Usuário ou senha inválidos".
- Após login: redirecionar para Portal Admin.

### Estrutura (desktop-first)
- **Layout com sidebar**
  - Sidebar: filtros (status), busca por UID, ações de suspensão.
  - Conteúdo: grafo/árvore de convites (área principal) + tabela de alertas.

### Interações
- Clique em nó/usuário do grafo abre painel lateral com detalhes e ações (suspender preventivamente).

---

## Página: Admin — Pessoas & Convites (CRUD)
### Objetivo
- Permitir que o administrador cadastre pessoas aptas a receber convite, gere/revogue convites e visualize a cadeia (quem convidou quem).

### Estrutura
- **Tabela principal (grid)**
  - Colunas: Nome, E-mail, CPF (opcional), Status do convite (Não enviado/Enviado/Usado/Revogado), Convidado por, Data.
  - Ações por linha: Gerar link, Copiar link, Revogar, Reenviar.
- **Ações no topo**
  - Botão primário: "Cadastrar pessoa".
  - Busca: por nome/email/cpf.

- **Modal: Cadastrar pessoa**
  - Campos: Nome completo (obrig.), E-mail (obrig.), CPF (opcional), Observações (opcional).
  - Botões: Salvar / Cancelar.

### Área: Simulador Regtest (Transações + Mineração)
#### Objetivo
- Permitir que o admin simule transações de Bitcoin na rede **regtest**, gerando transações aleatórias usando **usuários** e **negócios** cadastrados e, em seguida, **mine blocos** para confirmar.

#### Estrutura
- **Card: Configuração**
  - Quantidade de transações: input numérico (ex.: 1–500)
  - Faixa de valor: slider/inputs (mínimo/máximo) em sats e/ou BRL
  - Produtos: multiselect (todos / selecionar itens específicos)
  - Usuários: multiselect (todos / selecionar compradores e vendedores)
  - Regras de seleção: "respeitar bloqueio ⭐" (toggle) e "permitir repetição" (toggle)
- **Card: Execução**
  - Botões: "Gerar transações" (primário), "Parar" (danger), "Limpar" (secundário)
  - Progresso: barra + contadores (geradas, broadcast, confirmadas, falhas)
  - Log resumido: lista com timestamp, txid, usuário, item, valor, status
- **Card: Mineração (regtest)**
  - Input: quantidade de blocos para minerar (ex.: 1–20)
  - Botão: "Minerar blocos"
  - Saída: altura atual, último bloco, transações confirmadas

#### Regras de UX
- Links de convite devem ser copiados com 1 clique e confirmados via toast.
- Revogação deve pedir confirmação (modal curto) e registrar motivo (opcional).
- Ações críticas do simulador devem pedir confirmação (ex.: gerar >200 transações, limpar logs).
- Exibir erros em linguagem simples (ex.: "Falha ao enviar transação: carteira indisponível").
- Permitir copiar `txid` com 1 clique.

---

## Página: Usuário — Convidar (para anfitriões)
### Objetivo
- Permitir que um usuário anfitrião cadastre uma pessoa e gere um convite para ela ingressar na rede.

### Estrutura
- **Form simples**
  - Campos: Nome completo, E-mail, CPF (opcional).
  - Botão primário: "Gerar convite".
- **Lista de convites gerados**
  - Cada item: Nome, status (pendente/usado/revogado), botões "Copiar link" e "Revogar".

### Regras de UX
- Exibir texto social: "Convites ajudam a construir sua rede. Você é responsável pelos convidados".
- Se o usuário não tiver permissão para convidar, mostrar motivo e como habilitar (ex.: nível mínimo / aprovação pendente).
