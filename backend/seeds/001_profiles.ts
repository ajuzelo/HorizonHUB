import type { Knex } from 'knex';

/**
 * Seed 001 — Perfis e Categorias Padrão
 * Insere os dados essenciais que o sistema precisa para funcionar.
 * NÃO cria usuário — isso é feito na tela de setup inicial.
 */
export async function seed(knex: Knex): Promise<void> {
  // ===== Profiles =====
  await knex('profiles').del();
  await knex('profiles').insert([
    { id: 1, nome: 'Profissional', descricao: 'Módulos para gestão das empresas', ordem: 1 },
    { id: 2, nome: 'Pessoal', descricao: 'Módulos para organização pessoal e financeira', ordem: 2 },
  ]);

  // ===== Personal Finance Default Categories =====
  // These are seeded as user_id = 0 (system defaults), cloned for each new user on setup
  // In production, categories are created per user on first access
  console.log('✅ Seed 001: Perfis inseridos com sucesso.');
  console.log('ℹ️  Categorias pessoais são criadas por usuário no primeiro acesso.');
}
