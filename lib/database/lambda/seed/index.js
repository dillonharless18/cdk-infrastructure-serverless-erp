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

// Used to create each instance of an entity.
function createInstance(data) {
  const newData = { ...data };
  const currentDate = new Date();
  newData.created_at = currentDate;
  newData.last_updated_at = currentDate;

  return newData;
}

// Definitions for each instance
function createVehicleTypeInstance(vehicleTypeName) {
  const vehicleTypeData = {
    vehicle_type_name: vehicleTypeName,
    is_active: true,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };

  return vehicleTypeData;
}
function createUrgentOrderStatusData(urgentOrderStatusName) {
  const urgentOrderStatusData = {
    urgent_order_status_name: urgentOrderStatusName,
    is_active: true,
    create_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };

  return urgentOrderStatusData;
}
function createTransportationTripStatusData(transportationTripStatusName) {
  const transportationTripStatusData = {
    transportation_trip_status_name: transportationTripStatusName,
    is_active: true,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };

  return transportationTripStatusData;
}
function create(transportationRequestTypeName) {
  const transportationRequestTypeData = {
    transportation_request_type_id: transportationRequestTypeName,
    is_active: true,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };

  return transportationRequestTypeData;
}

function create(input) {
  const transportationRequestStatusData = {
    transportation_request_status_name: "Pending",
    is_active: true,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };
}
function createPurchaseOrderStatusData(purchaseOrderStatusName) {
  const purchaseOrderStatusData = {
    purchase_order_status_name: purchaseOrderStatusName,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };

  return purchaseOrderStatusData;
}
function createPurchaseOrderRequestItemStatus(
  purchaseOrderRequestItemStatusName
) {
  const purchaseOrderRequestItemStatusData = {
    purchase_order_request_item_status_name: purchaseOrderRequestItemStatusName,
    is_active: true,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };

  return purchaseOrderRequestItemStatusData;
}
function createPurchaseOrderItemStatusData(PurchaseOrderItemStatusName) {
  const purchaseOrderItemStatusData = {
    purchase_order_item_status_name: PurchaseOrderItemStatusName,
    is_active: true,
    created_by: "",
    last_updated_by: "",
    created_at: new Date(),
    last_updated_at: new Date(),
  };
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
