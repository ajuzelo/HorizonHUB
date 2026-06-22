import type { Knex } from 'knex';

/**
 * Migration 012 - Future Expansion Fields
 *
 * This migration adds fields to existing tables that will be needed
 * for future features without requiring structural changes later:
 *
 * - AI integration columns
 * - Multi-company support (empresa_id)
 * - External integration IDs (Google Drive, OneDrive)
 * - Mobile app support columns
 * - Permission/role expansions
 */
export async function up(knex: Knex): Promise<void> {
  // === users: prepare for multi-company and mobile ===
  await knex.schema.alterTable('users', (table) => {
    table.string('avatar_url', 500).nullable();
    table.string('locale', 10).nullable().defaultTo('pt-BR');
    table.string('timezone', 50).nullable().defaultTo('America/Sao_Paulo');
    table.boolean('setup_concluido').notNullable().defaultTo(false);
    table.timestamp('data_expiracao').nullable(); // for future subscription model
  });

  // === Future: companies table for multi-company support ===
  await knex.schema.createTable('companies', (table) => {
    table.increments('id').primary();
    table.integer('owner_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('razao_social', 255).notNullable();
    table.string('nome_fantasia', 255).nullable();
    table.string('cnpj', 18).nullable();
    table.boolean('ativa').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
  });

  // === Future: user_companies relation for multi-company ===
  await knex.schema.createTable('user_companies', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('company_id').unsigned().notNullable()
      .references('id').inTable('companies').onDelete('CASCADE');
    table.string('role', 50).notNullable().defaultTo('user');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'company_id']);
  });

  // === Future: AI summaries and suggestions ===
  await knex.schema.createTable('ai_interactions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    // tipo: 'resumo_diario' | 'sugestao' | 'alerta' | 'leitura_xml' | 'chat'
    table.string('tipo', 30).notNullable();
    table.string('modulo', 50).nullable();
    table.text('prompt').nullable();
    table.text('resposta').nullable();
    table.integer('tokens_usados').nullable();
    table.string('modelo', 50).nullable(); // e.g. 'gemini-pro', 'gpt-4'
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'tipo', 'criado_em'], 'idx_ai_user_type');
  });

  // === Future: external storage file references ===
  await knex.schema.createTable('external_files', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    // provider: 'google_drive' | 'onedrive' | 'local'
    table.string('provider', 20).notNullable().defaultTo('local');
    table.string('file_id', 255).nullable(); // external provider ID
    table.string('nome', 255).notNullable();
    table.string('mime_type', 100).nullable();
    table.bigInteger('tamanho_bytes').nullable();
    table.string('url', 1000).nullable();
    // reference to originating entity
    table.string('ref_tabela', 50).nullable(); // 'email_history', 'xml_files', etc.
    table.integer('ref_id').nullable();
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'ref_tabela', 'ref_id'], 'idx_ext_files_ref');
  });

  // === Future: mobile push notification tokens ===
  await knex.schema.createTable('push_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable();
    table.string('platform', 10).notNullable(); // 'ios' | 'android' | 'web'
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('push_tokens');
  await knex.schema.dropTableIfExists('external_files');
  await knex.schema.dropTableIfExists('ai_interactions');
  await knex.schema.dropTableIfExists('user_companies');
  await knex.schema.dropTableIfExists('companies');

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('avatar_url');
    table.dropColumn('locale');
    table.dropColumn('timezone');
    table.dropColumn('setup_concluido');
    table.dropColumn('data_expiracao');
  });
}
