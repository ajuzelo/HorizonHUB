import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sticky_notes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    // categoria: 'empresa' | 'pessoal' | 'financeiro' | 'senhas' | 'textos' | 'outros'
    table.string('categoria', 30).notNullable().defaultTo('outros');
    table.string('titulo', 255).nullable();
    table.text('conteudo').notNullable();
    table.boolean('fixado').notNullable().defaultTo(false); // pinned notes
    table.boolean('arquivado').notNullable().defaultTo(false);
    table.integer('cor_index').notNullable().defaultTo(0); // note color theme
    table.jsonb('tags').nullable(); // future: tag filtering
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'categoria'], 'idx_notes_categoria');
    table.index(['user_id', 'fixado'], 'idx_notes_fixado');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sticky_notes');
}
