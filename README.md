# Horizon HUB — Administrativo Pessoal

Sistema web administrativo pessoal centralizado com perfis Profissional e Pessoal.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + TailwindCSS + shadcn/ui |
| Backend | Node.js + Express + TypeScript + Knex.js |
| Banco | PostgreSQL via Docker |
| Auth | JWT |
| Estado | Zustand |

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Node.js](https://nodejs.org/) (instalado automaticamente)

---

## Inicialização

### 1. Clone / abra o projeto

```bash
cd "SISTEMA PESSOAL"
```

### 2. Configure as variáveis de ambiente

```bash
copy backend\.env.example backend\.env
```

Edite `backend/.env` se necessário (as configurações padrão funcionam com Docker).

### 3. Suba o banco de dados

```bash
docker compose up -d
```

Aguarde o PostgreSQL iniciar (~10 segundos).

### 4. Execute as migrations e seeds

```bash
cd backend
npm run migrate
npm run seed
```

### 5. Inicie o backend

```bash
# Na pasta backend
npm run dev
```

O servidor estará em: http://localhost:3001

### 6. Inicie o frontend

Abra um novo terminal:

```bash
cd frontend
npm run dev
```

O sistema estará em: http://localhost:5173

---

## Primeiro Acesso

1. Acesse http://localhost:5173
2. O sistema detecta que não há usuários e redireciona para **Configuração Inicial**
3. Preencha: nome, email e senha
4. Faça login com as credenciais criadas

---

## Estrutura

```
SISTEMA PESSOAL/
├── backend/
│   ├── migrations/     # 12 migrations do banco
│   ├── seeds/          # Dados iniciais
│   └── src/
│       ├── config/     # Knex, env
│       ├── controllers/
│       ├── middleware/
│       └── routes/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── lib/
└── docker-compose.yml
```

---

## Comandos Úteis

```bash
# Banco
docker compose up -d          # Iniciar PostgreSQL
docker compose down           # Parar
docker compose logs postgres  # Ver logs

# Backend
npm run migrate               # Rodar migrations
npm run migrate:rollback      # Desfazer última migration
npm run seed                  # Rodar seeds
npm run db:reset              # Resetar banco (rollback + migrate + seed)
npm run dev                   # Iniciar em desenvolvimento

# Frontend
npm run dev                   # Iniciar em desenvolvimento
npm run build                 # Build de produção
```

---

## Fases de Desenvolvimento

| Fase | Status | Descrição |
|------|--------|-----------|
| 0 | ✅ Concluída | Banco, migrations, seeds, backend base, frontend base |
| 1 | 🔜 Próxima | Login, autenticação, seletor de perfis |
| 2 | ⬜ Pendente | Dashboard, layout principal |
| 3 | ⬜ Pendente | Tarefas, Notas Rápidas, Calculadora |
| 4 | ⬜ Pendente | Contas a Pagar |
| 5 | ⬜ Pendente | Importador XML |
| 6 | ⬜ Pendente | Central de NF + Email |
| 7 | ⬜ Pendente | WhatsApp |
| 8 | ⬜ Pendente | Financeiro Pessoal |
| 9 | ⬜ Pendente | Configurações, Backup, Logs |
