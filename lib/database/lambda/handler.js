// handler.js

const knex = require('knex');
const getKnexConfig = require('./knexfile');
let db;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const knexConfig = await getKnexConfig();
    db = db || knex(knexConfig);
    await db.migrate.latest();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};
