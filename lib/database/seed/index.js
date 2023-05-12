import initializeKnex from "./db.js";
import constants from "./constants.js";

let knexInstance;
const adminUserId = "111111111111111111111111111111111111";

const initializeDb = async () => {
  try {
    if (!knexInstance) {
      knexInstance = await initializeKnex();
    }
  } catch (error) {
    throw error;
  }
};

// Function needed to INSERT into each entity
async function insertEntityInstanceIntoDatabase(tableName, entityInstance) {
  return await knexInstance(tableName).insert(entityInstance);
}

// Used to create each instance of an entity.
function createInstance(uniqueInstanceData, userId) {
  const currentDate = new Date();

  const instanceData = {
    ...uniqueInstanceData,
    is_active: true,
    created_by: userId,
    last_updated_by: userId,
    created_at: currentDate,
    last_updated_at: currentDate,
  };

  return instanceData;
}

/**
 * Creates and insert seed data into the DB
 *
 * @function
 * @async
 * @param   {Object}  event - The Lambda event object
 * @param   {Object}  context - The Lambda context object
 * @param   {string}  event.body - A JSON formatted string containing the user information
 * @returns {Object}  response - The Lambda response object
 * @returns {number}  response.statusCode - "Success" or "fail"
 * @returns {string}  response.body - A JSON-formatted string containing the created user information
 * @throws  {Error}   If an error occurs while interacting with the database
 */
export async function handler(event, context) {
  try {
    await initializeDb();

    // create all objects
    // console.log(`constants: ${JSON.stringify(constants, null, 2)}`)
    // for (const entityObject of constants.entityConstants) {
    for (const entityObject of constants) {
      console.log(
        `Creating and inserting objects for ${entityObject.tableName}`
      );

      for (const entityName of entityObject.entityNames) {
        const nameKey = entityName + "_name";
        const entityInstance = createInstance(
          { [nameKey]: entityName },
          adminUserId
        );
        await insertEntityInstanceIntoDatabase(
          entityObject.tableName,
          entityInstance
        );
      }

      console.log(
        `Successfully created and inserted objects for ${entityObject.tableName}`
      );
    }

    return "Success";
  } catch (error) {
    console.error(error);
    return "Fail";
  }
}
