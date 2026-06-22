import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique()
      .references('id').inTable('users').onDelete('CASCADE');

    // UI
    // tema: 'dark' | 'light'
    table.string('tema', 10).notNullable().defaultTo('dark');
    table.boolean('sidebar_collapsed').notNullable().defaultTo(false);

    // SMTP
    table.string('smtp_host', 255).nullable();
    table.integer('smtp_port').nullable();
    table.string('smtp_email', 255).nullable();
    table.string('smtp_senha_encrypted', 500).nullable(); // AES encrypted
    table.string('smtp_nome_remetente', 120).nullable();
    table.boolean('smtp_ssl').notNullable().defaultTo(false);

    // WhatsApp
    // whatsapp_modo: 'web' | 'api'
    table.string('whatsapp_modo', 10).notNullable().defaultTo('web');
    table.text('whatsapp_api_token_encrypted').nullable();

    // Backup
    table.boolean('backup_automatico').notNullable().defaultTo(false);
    table.string('backup_frequencia', 20).nullable(); // 'diario' | 'semanal'

    // Future integrations
    table.text('google_drive_token_encrypted').nullable();
    table.text('onedrive_token_encrypted').nullable();
    table.text('ai_api_key_encrypted').nullable();

    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settings');
}
