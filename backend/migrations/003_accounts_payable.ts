import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts_payable', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('loja', 120).notNullable();
    // competencia: YYYY-MM (e.g. "2026-06")
    table.string('competencia', 7).notNullable();
    table.string('descricao', 500).notNullable();
    table.decimal('valor', 15, 2).notNullable();
    table.date('vencimento').notNullable();
    // status: 'pendente' | 'lancado'
    table.string('status', 20).notNullable().defaultTo('pendente');
    table.text('observacao').nullable();
    // Prepared for future: batch imports, integrations
    table.string('origem', 50).nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());

    // Indexes for common filter queries
    table.index(['user_id', 'competencia', 'status'], 'idx_accounts_payable_filters');
    table.index(['user_id', 'loja'], 'idx_accounts_payable_loja');
    table.index(['vencimento'], 'idx_accounts_payable_vencimento');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts_payable');
}
