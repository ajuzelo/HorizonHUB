import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Reusable email templates
  await knex.schema.createTable('email_templates', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome', 120).notNullable();
    table.string('assunto', 500).notNullable();
    table.text('corpo').notNullable(); // supports HTML / handlebars variables
    table.boolean('padrao').notNullable().defaultTo(false); // default template
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());
  });

  // Central de NF clients
  await knex.schema.createTable('nf_clients', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome', 255).notNullable();
    table.string('email', 255).nullable();
    table.string('telefone', 20).nullable();
    table.string('cnpj_cpf', 20).nullable();
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
  });

  // Email send history
  await knex.schema.createTable('email_history', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('client_id').unsigned().nullable()
      .references('id').inTable('nf_clients').onDelete('SET NULL');
    table.string('cliente', 255).notNullable(); // denormalized snapshot
    table.string('email_destino', 255).notNullable();
    table.string('assunto', 500).notNullable();
    table.text('corpo').nullable();
    table.jsonb('anexos').nullable(); // file names list
    // status: 'enviado' | 'erro' | 'pendente'
    table.string('status', 20).notNullable().defaultTo('enviado');
    table.text('erro_detalhe').nullable();
    table.string('numero_nf_produto', 30).nullable();
    table.string('numero_nf_servico', 30).nullable();
    table.timestamp('data_envio').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'data_envio'], 'idx_email_history_data');
    table.index(['user_id', 'email_destino'], 'idx_email_history_email');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_history');
  await knex.schema.dropTableIfExists('nf_clients');
  await knex.schema.dropTableIfExists('email_templates');
}
