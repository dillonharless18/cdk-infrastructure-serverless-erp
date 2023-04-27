// handler.mjs

// Import the Knex library for working with SQL databases
import knex from 'knex';

// Import the getKnexConfig function from knexfile.js, which is used to configure the Knex instance
import getKnexConfig from './knexfile.js';

// Declare a variable to hold the initialized Knex instance, initially set to undefined
let db;

// Export the handler function, which is the main entry point of the AWS Lambda function
export const handler = async (event, context) => {
  // Set this flag to false, so the Lambda function doesn't wait for the Node.js event loop to be empty
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Call the getKnexConfig function to get the Knex configuration object
    const knexConfig = await getKnexConfig();

    console.log(`knexConfig: ${JSON.stringify(knexConfig, null, 2)}`);

    // Initialize the Knex instance with the provided configuration if it's not already initialized
    db = db || knex(knexConfig);

    // Run the latest database migrations using Knex's migrate.latest() method
    await db.migrate.latest();

    // Log a message indicating that the migrations have completed successfully
    console.log('Migrations completed successfully');
  } catch (error) {
    // Log an error message if there's an issue running the migrations
    console.error('Error running migrations:', error);

    // Throw the error to ensure the Lambda function reports the error
    throw error;
  }
};
