import knex from 'knex';
import knexConfig from './knexfile';

const env = process.env.NODE_ENV || 'development';
const config = knexConfig[env];

if (!config) {
  throw new Error(`No Knex configuration found for environment: ${env}`);
}

const db = knex(config);

export default db;
