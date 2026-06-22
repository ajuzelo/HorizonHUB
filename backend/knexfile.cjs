/**
 * knexfile.cjs — Configuração do Knex em CommonJS puro
 * Usando .cjs para evitar conflito com ES Modules e problema de __dirname
 */
require('dotenv').config();
const path = require('path');

/** @type {import('knex').Knex.Config} */
const base = {
  client: 'pg',
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    // As migrations são arquivos .ts, o loader tsx/cjs vai compilá-los
    loadExtensions: ['.ts', '.js'],
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
    loadExtensions: ['.ts', '.js'],
  },
};

module.exports = {
  development: {
    ...base,
    connection: process.env.DATABASE_URL 
      ? { connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME || 'horizonhub',
          user: process.env.DB_USER || 'horizonhub',
          password: process.env.DB_PASSWORD || 'horizonhub_secret',
        },
    pool: { min: 2, max: 10 },
  },

  production: {
    ...base,
    connection: process.env.DATABASE_URL 
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        },
    pool: { min: 2, max: 20 },
  },
};
