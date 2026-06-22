-- Este arquivo é executado automaticamente pelo Docker na primeira inicialização.
-- Garante que o banco de dados e as extensões necessárias estão prontos.

-- Extensão para UUID (futura expansão)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Extensão para busca textual em português
CREATE EXTENSION IF NOT EXISTS unaccent;
