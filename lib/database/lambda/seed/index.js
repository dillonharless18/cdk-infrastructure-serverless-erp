const initializeKnex = require("./db");
const uuid = require("uuid");

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

// Functions needed to INSERT into each entity
async function insertVehicleType(data) {
  return await knex("vehicle_type").insert(data);
}

async function insertUrgentOrderStatus(data) {
  return await knex("urgent_order_status").insert(data);
}

async function insertTransportationTripStatus(data) {
  return await knex("transportation_trip_status").insert(data);
}

async function insertTransportationRequestType(data) {
  return await knex("transportation_request_type").insert(data);
}

async function insertTransportationRequestStatus(data) {
  return await knex("transportation_request_status").insert(data);
}

async function insertPurchaseOrderStatus(data) {
  return await knex("purchase_order_status").insert(data);
}

async function insertPurchaseOrderRequestItemStatus(data) {
  return await knex("purchase_order_request_item_status").insert(data);
}

async function insertPurchaseOrderItemStatus(data) {
  return await knex("purchase_order_item_status").insert(data);
}

/**
/**
 * Creates a new user in the PostgreSQL database.
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
exports.handler = async function (event, context) {
  try {
    await initializeDb();

    // put code to create and insert each entity here
    await knexInstance("user").insert(newUser);
    return "Success";
  } catch (error) {
    console.error(error);
    return "Fail";
  }
};
