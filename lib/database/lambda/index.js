import initializeKnex from "/opt/nodejs/db/index.js";

let knexInstance;

const initializeDb = async () => {
  try {
    if (!knexInstance) {
      knexInstance = await initializeKnex();
    }
  } catch (error) {
    throw error;
  }
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await initializeDb();
    await knexInstance.migrate.latest();

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};


// import knex from 'knex';
// import getKnexConfig from './knexfile.js';

// let db;

// export const handler = async (event, context) => {
//   context.callbackWaitsForEmptyEventLoop = false;

//   try {
//     const knexConfig = await getKnexConfig();
//     console.log(`knexConfig: ${JSON.stringify(knexConfig, null, 2)}`);
//     db = db || knex(knexConfig);
//     await db.migrate.latest();

//     console.log('Migrations completed successfully');
//   } catch (error) {
//     console.error('Error running migrations:', error);
//     throw error;
//   }
// };
