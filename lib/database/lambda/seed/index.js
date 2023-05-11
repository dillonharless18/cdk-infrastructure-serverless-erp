import initializeKnex from "./db.js";
import { v4 as uuid } from "uuid";

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

/**
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

// Function needed to INSERT into each entity
async function insertDataIntoDatabase(tableName, data) {
  return await knexInstance(tableName).insert(data);
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

// Definitions for each instance
function createVehicleTypeInstance(vehicleTypeName, userId) {
  const instanceData = {
    vehicle_type_name: vehicleTypeName,
  };

  return createInstance(instanceData, userId);
}

function createUrgentOrderStatusInstance(urgentOrderStatusName, userId) {
  const instanceData = {
    urgent_order_status_name: urgentOrderStatusName,
  };

  return createInstance(instanceData, userId);
}

function createTransportationTripStatusInstance(
  transportationTripStatusName,
  userId
) {
  const instanceData = {
    transportation_trip_status_name: transportationTripStatusName,
  };

  return createInstance(instanceData, userId);
}

function createTransportationRequestTypeInstance(
  transportationRequestTypeName,
  userId
) {
  const instanceData = {
    transportation_request_type_id: transportationRequestTypeName,
  };

  return createInstance(instanceData, userId);
}

function createTransportationRequestStatusInstance(
  transportationRequestStatusName,
  userId
) {
  const instanceData = {
    transportation_request_status_name: transportationRequestStatusName,
  };

  return createInstance(instanceData, userId);
}

function createPurchaseOrderStatusInstance(purchaseOrderStatusName, userId) {
  const instanceData = {
    purchase_order_status_name: purchaseOrderStatusName,
  };

  return createInstance(instanceData, userId);
}

function createPurchaseOrderRequestItemStatus(
  purchaseOrderRequestItemStatusName,
  userId
) {
  const instanceData = {
    purchase_order_request_item_status_name: purchaseOrderRequestItemStatusName,
  };

  return createInstance(instanceData, userId);
}

function createPurchaseOrderItemStatusInstance(
  PurchaseOrderItemStatusName,
  userId
) {
  const instanceData = {
    purchase_order_item_status_name: PurchaseOrderItemStatusName,
  };

  return createInstance(instanceData, userId);
}
