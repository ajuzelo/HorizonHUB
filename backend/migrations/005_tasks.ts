import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    // profile_id allows tasks to be scoped per profile (Profissional / Pessoal)
    table.integer('profile_id').unsigned().nullable()
      .references('id').inTable('profiles').onDelete('SET NULL');
    table.string('titulo', 500).notNullable();
    table.text('descricao').nullable();
    // prioridade: 'baixa' | 'media' | 'alta'
    table.string('prioridade', 10).notNullable().defaultTo('media');
    // status: 'pendente' | 'concluido'
    table.string('status', 20).notNullable().defaultTo('pendente');
    // data_referencia: date this task belongs to (for daily history)
    table.date('data_referencia').notNullable();
    table.integer('ordem').notNullable().defaultTo(0); // drag-to-reorder
    table.boolean('importado_dia_anterior').notNullable().defaultTo(false);
    table.timestamp('concluido_em').nullable();
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'data_referencia', 'status'], 'idx_tasks_date_status');
    table.index(['user_id', 'status'], 'idx_tasks_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');
}
