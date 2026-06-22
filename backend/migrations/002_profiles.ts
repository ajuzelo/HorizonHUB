import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Profiles lookup table
  await knex.schema.createTable('profiles', (table) => {
    table.increments('id').primary();
    table.string('nome', 50).notNullable().unique();
    table.string('descricao', 255).nullable();
    table.integer('ordem').notNullable().defaultTo(0);
  });

  // Many-to-many between users and profiles
  // Each user can have independent settings per profile
  await knex.schema.createTable('user_profiles', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('profile_id').unsigned().notNullable()
      .references('id').inTable('profiles').onDelete('CASCADE');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'profile_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_profiles');
  await knex.schema.dropTableIfExists('profiles');
}
