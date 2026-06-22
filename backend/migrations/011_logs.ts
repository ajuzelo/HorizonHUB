import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activity_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    // modulo: 'auth' | 'contas_pagar' | 'xml' | 'tarefas' | 'notas' | 'email' | 'whatsapp' | 'financeiro' | 'configuracoes'
    table.string('modulo', 50).notNullable();
    table.string('acao', 100).notNullable();
    table.string('descricao', 500).nullable();
    table.jsonb('detalhes').nullable(); // diff or context data
    table.string('ip', 45).nullable(); // IPv4 or IPv6
    table.string('user_agent', 500).nullable();
    // nivel: 'info' | 'warning' | 'error'
    table.string('nivel', 10).notNullable().defaultTo('info');
    table.timestamp('data_hora').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'data_hora'], 'idx_logs_user_date');
    table.index(['modulo', 'data_hora'], 'idx_logs_modulo');
    table.index(['data_hora'], 'idx_logs_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('activity_logs');
}
