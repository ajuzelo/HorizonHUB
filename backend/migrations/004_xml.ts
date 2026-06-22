import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // NF-e XML file header
  await knex.schema.createTable('xml_files', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome_arquivo', 255).notNullable();
    table.string('numero_nf', 20).nullable();
    table.string('chave_acesso', 44).nullable(); // NF-e access key
    table.string('fornecedor', 255).nullable();
    table.string('cnpj_emitente', 18).nullable();
    table.date('data_emissao').nullable();
    table.decimal('valor_total', 15, 2).nullable();
    table.text('xml_original').nullable(); // store compressed XML for history
    // Prepared for future AI automatic reading
    table.boolean('processado_ia').notNullable().defaultTo(false);
    table.jsonb('metadata').nullable();
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'fornecedor'], 'idx_xml_files_fornecedor');
    table.index(['user_id', 'numero_nf'], 'idx_xml_files_numero');
    table.index(['user_id', 'criado_em'], 'idx_xml_files_data');
  });

  // Individual items within an NF-e XML
  await knex.schema.createTable('xml_items', (table) => {
    table.increments('id').primary();
    table.integer('xml_id').unsigned().notNullable()
      .references('id').inTable('xml_files').onDelete('CASCADE');
    table.integer('numero_item').notNullable(); // item sequence
    table.string('descricao', 500).notNullable();
    table.string('codigo_produto', 60).nullable();
    table.string('codigo_barras', 14).nullable(); // EAN-13 or GTIN-14
    table.string('cfop', 4).nullable();
    table.string('ncm', 8).nullable();
    table.decimal('quantidade', 15, 4).nullable();
    table.string('unidade', 6).nullable();
    table.decimal('valor_unitario', 15, 10).nullable();
    table.decimal('valor_total', 15, 2).nullable();
    // Fiscal taxes
    table.string('origem', 2).nullable();         // CST Origem (0–8)
    table.string('cst_icms', 3).nullable();
    table.string('cst_pis', 3).nullable();
    table.string('cst_cofins', 3).nullable();
    table.string('cst_ipi', 3).nullable();
    // Tax values for possible future reporting
    table.decimal('valor_icms', 15, 2).nullable();
    table.decimal('valor_pis', 15, 2).nullable();
    table.decimal('valor_cofins', 15, 2).nullable();
    table.decimal('valor_ipi', 15, 2).nullable();
    table.jsonb('impostos_raw').nullable(); // full raw tax object from XML

    table.index(['xml_id'], 'idx_xml_items_xml_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('xml_items');
  await knex.schema.dropTableIfExists('xml_files');
}
