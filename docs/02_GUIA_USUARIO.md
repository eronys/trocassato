# Guia do Usuário

## 1. Entrar

1. Acesse `http://127.0.0.1:5173/login`
2. Informe **e-mail** e **senha**
3. Clique em **Entrar**

Se você ainda não tem conta, você precisa de um **link de convite**.

## 2. Cadastro por convite

1. Abra o link de convite recebido
2. Preencha:
   - Nome completo
   - E-mail
   - CPF (11 dígitos)
   - Foto (URL) **opcional**
   - Senha (mínimo 8 caracteres)
3. Clique em **Finalizar cadastro**

Após o cadastro, você entra como usuário com status `PENDING_APPROVAL`.

## 3. Catálogo

- Acesse `Catálogo` para ver os negócios disponíveis.
- Se você estiver em `STAR_1` (⭐), você poderá navegar, mas algumas ações ficam limitadas.
- Ao clicar em um negócio, você verá o valor dinamicamente em Satoshis e Reais.
- Você **não pode** realizar o checkout do seu próprio negócio.

## 4. Perfil

No `Perfil` você visualiza:

- Status (`PENDING_APPROVAL`, `APPROVED`, `SUSPENDED`)
- Nível (`STAR_1`, `STAR_2`)
- Histórico de transações

## 5. Meus negócios (produtos e serviços)

Para cadastrar negócios:

1. Clique em **Meus negócios**
2. Preencha Título, Descrição e Valor (BRL). A conversão para Satoshis aparecerá na listagem.
3. Clique em **Publicar negócio**

Regras:

- Você precisa estar `APPROVED`
- Você precisa ser `STAR_2` (⭐⭐) ou superior

## 6. Convites (anfitriões)

Usuários com papel de anfitrião podem acessar o menu **Convidar** para gerar convites preenchendo apenas **Nome** e **E-mail**. O CPF será exigido diretamente ao convidado quando o mesmo acessar o link para finalizar seu cadastro.
Em `Notificações`, o anfitrião pode aprovar ou recusar solicitações pendentes.
Enquanto um convidado não for aprovado pelo anfitrião, ele terá acesso restrito no sistema, sem menus de "Convidar" e "Meus negócios".

