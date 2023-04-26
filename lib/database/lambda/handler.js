// handler.js
import knex from 'knex';
import getKnexConfig from './knexfile.js';
let db;

export async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const knexConfig = await getKnexConfig.default();
    db = db || knex(knexConfig);
    await db.migrate.latest();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
