import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('nome', 120).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('senha_hash', 255).notNullable();
    table.boolean('ativo').notNullable().defaultTo(true);
    // Prepared for future: multi-company, roles
    table.string('role', 50).notNullable().defaultTo('admin');
    table.jsonb('metadata').nullable(); // extensible for future AI / integrations
    table.timestamp('data_criacao').notNullable().defaultTo(knex.fn.now());
    table.timestamp('ultimo_acesso').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
