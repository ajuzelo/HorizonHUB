import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('whatsapp_templates', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome', 120).notNullable();
    table.text('mensagem').notNullable(); // supports {{variavel}} placeholders
    table.boolean('padrao').notNullable().defaultTo(false);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('whatsapp_history', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('email_history_id').unsigned().nullable()
      .references('id').inTable('email_history').onDelete('SET NULL');
    table.string('telefone', 20).notNullable();
    table.string('cliente', 255).nullable();
    table.text('mensagem').notNullable();
    // modo: 'web' | 'api'
    table.string('modo', 10).notNullable().defaultTo('web');
    // status: 'aberto' | 'enviado' | 'erro'
    table.string('status', 20).notNullable().defaultTo('aberto');
    table.jsonb('anexos').nullable();
    table.timestamp('data_envio').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'data_envio'], 'idx_whatsapp_history_data');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('whatsapp_history');
  await knex.schema.dropTableIfExists('whatsapp_templates');
}
