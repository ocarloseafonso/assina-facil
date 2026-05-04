# AssinaFácil 📄

Sistema de assinatura eletrônica de contratos com validade jurídica (MP 2.200-2/2001 · Lei 14.063/2020).

## Funcionalidades

- Upload de contratos PDF ou criação por texto
- Envio por e-mail com link único de assinatura
- Link para compartilhar via WhatsApp
- Assinatura por digitação do nome + confirmação
- Registro de IP, data e hora (log de auditoria)
- Confirmação por e-mail para signatário e remetente
- Armazenamento seguro no Supabase

---

## Setup

### 1. Supabase

Acesse https://supabase.com e abra seu projeto. No **SQL Editor**, execute o conteúdo de:

```
supabase/migrations/001_init.sql
```

Isso cria as tabelas `contracts` e `signatories` e o bucket `contracts` para PDFs.

### 2. Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ayozwbqojeqajsklzyjb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui

SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=seuemail@suaempresa.com.br
SMTP_PASS=sua_senha_de_app_zoho
SMTP_FROM=seuemail@suaempresa.com.br

NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

#### Senha de App no Zoho Mail:
1. Acesse mail.zoho.com → Configurações → Segurança
2. Clique em "Senhas de aplicativo"
3. Crie uma senha para "AssinaFácil"
4. Use essa senha no `SMTP_PASS`

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000

---

## Deploy na Vercel

1. Suba o projeto no GitHub
2. Acesse https://vercel.com → "New Project" → importe o repositório
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local`
4. Clique em Deploy
5. Após o deploy, atualize `NEXT_PUBLIC_APP_URL` com a URL gerada pela Vercel

---

## Como usar

1. Acesse a página principal
2. Escolha se vai fazer upload de PDF ou digitar o contrato
3. Preencha o título, seu nome e e-mail
4. Adicione os signatários (nome + e-mail)
5. Clique em **Enviar para assinatura**
6. O sistema envia o e-mail e gera links do WhatsApp
7. O cliente abre o link, lê o contrato, digita o nome e clica em assinar
8. Ambos recebem confirmação por e-mail com registro de data, hora e IP

---

## Validade jurídica

Este sistema implementa **assinatura eletrônica simples** conforme:
- **MP 2.200-2/2001** — validade de documentos eletrônicos no Brasil
- **Lei 14.063/2020** — assinaturas eletrônicas em atos com entidades públicas e privadas

O conjunto de evidências (nome digitado + e-mail verificado + IP + timestamp + hash do documento) forma um log de auditoria com força probatória reconhecida pelos tribunais brasileiros.

Para contratos de alto valor, considere adicionar autenticação por SMS ou certificado ICP-Brasil.
