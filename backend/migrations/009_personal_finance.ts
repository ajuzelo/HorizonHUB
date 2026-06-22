import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Transaction categories (Receita / Despesa)
  await knex.schema.createTable('personal_categories', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome', 120).notNullable();
    // tipo: 'receita' | 'despesa' | 'ambos'
    table.string('tipo', 10).notNullable();
    table.string('icone', 50).nullable(); // icon name for UI
    table.string('cor', 7).nullable(); // hex color
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
  });

  // Bank/wallet accounts
  await knex.schema.createTable('personal_wallets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome', 120).notNullable();
    // tipo: 'conta_corrente' | 'poupanca' | 'carteira' | 'cartao_credito' | 'investimento'
    table.string('tipo', 30).notNullable().defaultTo('conta_corrente');
    table.decimal('saldo_inicial', 15, 2).notNullable().defaultTo(0);
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
  });

  // Credit cards
  await knex.schema.createTable('personal_cards', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('nome', 120).notNullable();
    table.decimal('limite', 15, 2).nullable();
    table.integer('dia_vencimento').notNullable().defaultTo(1);
    table.integer('dia_fechamento').notNullable().defaultTo(25);
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
  });

  // Financial transactions (income/expense)
  await knex.schema.createTable('personal_accounts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('category_id').unsigned().nullable()
      .references('id').inTable('personal_categories').onDelete('SET NULL');
    table.integer('wallet_id').unsigned().nullable()
      .references('id').inTable('personal_wallets').onDelete('SET NULL');
    table.integer('card_id').unsigned().nullable()
      .references('id').inTable('personal_cards').onDelete('SET NULL');
    table.string('descricao', 500).notNullable();
    table.decimal('valor', 15, 2).notNullable();
    table.date('data_movimento').notNullable();
    table.date('data_vencimento').nullable(); // for payables/receivables
    // tipo: 'receita' | 'despesa'
    table.string('tipo', 10).notNullable();
    // status: 'pendente' | 'pago' | 'recebido' | 'cancelado'
    table.string('status', 20).notNullable().defaultTo('pendente');
    table.boolean('recorrente').notNullable().defaultTo(false);
    table.string('recorrencia', 20).nullable(); // 'mensal' | 'semanal' etc.
    table.integer('parcela_atual').nullable();
    table.integer('total_parcelas').nullable();
    table.text('observacao').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'data_movimento', 'tipo'], 'idx_personal_accounts_date');
    table.index(['user_id', 'status'], 'idx_personal_accounts_status');
    table.index(['user_id', 'data_vencimento'], 'idx_personal_accounts_vencimento');
  });

  // Financial goals
  await knex.schema.createTable('personal_goals', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('titulo', 255).notNullable();
    table.text('descricao').nullable();
    table.decimal('valor_meta', 15, 2).notNullable();
    table.decimal('valor_atual', 15, 2).notNullable().defaultTo(0);
    table.date('prazo').nullable();
    // status: 'ativo' | 'concluido' | 'cancelado'
    table.string('status', 20).notNullable().defaultTo('ativo');
    table.string('icone', 50).nullable();
    table.string('cor', 7).nullable();
    table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('personal_goals');
  await knex.schema.dropTableIfExists('personal_accounts');
  await knex.schema.dropTableIfExists('personal_cards');
  await knex.schema.dropTableIfExists('personal_wallets');
  await knex.schema.dropTableIfExists('personal_categories');
}
