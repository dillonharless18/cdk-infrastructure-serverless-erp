import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const ACTION_TYPES = ["CREATE_PO", "CREATE_VENDOR", "UPDATE_VENDOR"];
const ITEM_TYPES = ["Materials", "Other"];
const defaultItemType = "Materials";
const defaultRate = 1;

const ADDRESS_VALIDATION_RULES = {
    _addr1: { validate: checkIsValidString, required: true },
    _addr2: { validate: checkIsValidString, required: false },
    _addr3: { validate: checkIsValidString, required: false },
    _addr4: { validate: checkIsValidString, required: false },
    _addr5: { validate: checkIsValidString, required: false },
    _city: { validate: checkIsValidString, required: true },
    _state: { validate: checkIsValidString, required: true },
    _postalCode: { validate: checkIsValidString, required: true },
    _country: { validate: checkIsValidString, required: true },
    _note: { validate: checkIsValidString, required: false },
};

const LINE_ITEM_VALIDATION_RULES = {
    oneXerpId: { validate: checkIsValidString, required: true },
    ItemName: { validate: checkIsValidString, required: true },
    Quantity: { validate: checkIsValidNumber, required: true },
    Rate: { validate: checkIsValidNumber, required: true },
    UnitOfMeasure: { validate: checkIsValidString, required: true },
    JobNumber: { validate: checkIsValidJobNumber, required: true }, // TODO assuming that fronted is passing this in.  I need to verify this or have backend grab it
};

const PURCHASE_ORDER_VALIDATION_RULES = {
    oneXerpId: checkIsValidString,
    VendorName: checkIsValidString,
    OrderDate: checkIsValidString,
    PurchaseOrderNumber: checkIsValidString,
    Shipping: checkIsValidNumber,
    Tax: checkIsValidNumber,
    // ShipTo: Address, - For now, there is defaulting to Bridgewater's warehouse in the QBD application. However, once it's broken out in the database, the oneXerpQB will automatically accept it
    // VendorAddress: Address -For now, not populating this in QBD. We can either get it from the Vendor inside QBD when we ensure it exists or send it in the message after we break the address out in oneXerp database.
};

const CREATE_VENDOR_VALIDATION_RULES = {
    Name: { validate: checkIsValidString, required: true },
    CompanyName: { validate: checkIsValidString, required: false },
    Phone: { validate: checkIsValidString, required: false },
    FirstName: { validate: checkIsValidString, required: false },
    LastName: { validate: checkIsValidString, required: false },
    Email: { validate: checkIsValidString, required: false },
};

const UPDATE_VENDOR_VALIDATION_RULES = {
    Name: { validate: checkIsValidString, required: true },
    CompanyName: { validate: checkIsValidString, required: false },
    Phone: { validate: checkIsValidString, required: false },
    NewName: { validate: checkIsValidString, required: false },
    FirstName: { validate: checkIsValidString, required: false },
    LastName: { validate: checkIsValidString, required: false },
    Email: { validate: checkIsValidString, required: false },
    _quickbooksId: { validate: checkIsValidString, required: true },
};

/**
 * Sends a message to the oneXerp QB Egress Queue given a url and message body.
 * This method doesnt contain error handling, so the caller must handle this.
 *
 * @param {*} queueUrl the oneXerp QB Egress Queue URL
 * @param {*} actionType can be one of the following "CREATE_PO" | "CREATE_VENDOR" | "UPDATE_VENDOR";
 * @param {*} messageBody the deserialized message body to be sent
 */
const sendMessageToOneXerpQBEgressQueue = async (actionType, data) => {
    const awsRegion = process.env["AWS_REGION"];
    const queueUrl = process.env["EGRESS_QUEUE_URL"];
    const sqsClient = new SQSClient({ region: awsRegion });

    const sendCommand = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageAttributes: {
            EventSource: {
                DataType: "String",
                StringValue: "oneXerp",
            },
        },
        MessageBody: constructOneXerpQBEgressQueueMessage(actionType, data),
    });
    const sqsResponse = await sqsClient.send(sendCommand);
    console.log("SQS response:", sqsResponse);
};

/**
 *
 * @param {*} actionType The action type
 * @param {*} data The data used to constuct the message
 * @returns
 */
function constructOneXerpQBEgressQueueMessage(actionType, data) {
    if (!actionType || !ACTION_TYPES.includes(actionType)) {
        throw new Error(`Invalid input! actionType: ${actionType} is invalid!`);
    }

    let body = {};

    switch (actionType) {
        case "CREATE_PO":
            body = constructCreatePurchaseOrderMessage(data);
            validateSchema(body, PURCHASE_ORDER_VALIDATION_RULES);
            break;
        case "CREATE_VENDOR":
            body = constructCreateVendorMessage(data);
            validateSchema(body, CREATE_VENDOR_VALIDATION_RULES);
            break;
        case "UPDATE_VENDOR":
            body = constructUpdateVendorMessage(data);
            validateSchema(body, UPDATE_VENDOR_VALIDATION_RULES);
            break;
        default:
            body = "";
    }

    return JSON.stringify({
        actionType,
        body,
    });
}

/**
 *
 * @param {*} data The data to construct the vendor message
 * @returns an object
 */
function constructCreateVendorMessage(data) {
    const { vendor_id, vendor_name, phone_number } = data;

    const messageBodyDict = {
        oneXerpId: vendor_id,
        Name: vendor_name,
        CompanyName: vendor_name,
    };

    let vendorAddressData;
    if (data["address_line_1"]) {
        vendorAddressData = constructAddress(data);
        messageBodyDict["VendorAddress"] = vendorAddressData;
    }
    if (phone_number) {
        messageBodyDict["Phone"] = phone_number;
    }

    return messageBodyDict;
}

/**
 *
 * @param {*} data The data used to construct the message
 * @returns an object
 */
function constructUpdateVendorMessage(data) {
    const { vendor_name, quickbooksId } = data;
    const messageBodyDict = constructCreateVendorMessage(data);

    if (vendor_name) {
        checkIsValidString(vendor_name);
        messageBodyDict["NewName"] = vendor_name;
        messageBodyDict["NewCompanyName"] = vendor_name;
    }
    if (quickbooksId) {
        checkIsValidString(quickbooksId);
        messageBodyDict["_quickbooksId"] = quickbooksId;
    }

    return messageBodyDict;
}

/**
 *
 * @param {*} data The data used to construct the message
 * @returns an object
 */
function constructCreatePurchaseOrderMessage(data) {
    const {
        purchase_order_id,
        vendor_name,
        created_at,
        items,
        purchase_order_number,
        shipping_cost,
        tax_cost,
    } = data;

    if (!Array.isArray(items) || items.length === 0)
        throw new Error("Invalid Items array");

    const transformedItems = items.map((item) => constructLineItem(item));
    const purchaseOrderData = {
        oneXerpId: purchase_order_id,
        VendorName: vendor_name,
        OrderDate: created_at,
        PurchaseOrderNumber: purchase_order_number,
        Shipping: Number(formatNumberAsDouble(shipping_cost)),
        Tax: Number(formatNumberAsDouble(tax_cost)),
        Items: transformedItems,
    };

    return purchaseOrderData;
}

/**
 *
 * @param {*} data The data to create the line item
 * @returns
 */
function constructLineItem(data) {
    const {
        purchase_order_item_id,
        item_name,
        quantity,
        rate,
        item_type,
        unit_of_measure,
        job_number,
    } = data;

    if (!rate) {
        rate = defaultRate;
    }
    if (!item_type) {
        item_type = defaultItemType;
    }
    lineItemData = {
        oneXerpId: purchase_order_item_id,
        ItemType: defaultItemType,
        ItemName: item_name,
        Quantity: Number(formatNumberAsDouble(quantity)),
        Rate: Number(formatNumberAsDouble(rate)),
        UnitOfMeasure: unit_of_measure,
        JobNumber: job_number,
    };

    if (!ITEM_TYPES.includes(lineItemData["ItemType"])) {
        throw new Error(`invalid item type! ${lineItemData["ItemType"]}`);
    }
    validateSchema(lineItemData, LINE_ITEM_VALIDATION_RULES);

    return lineItemData;
}

/**
 *
 * @param {*} data The data used to construct the Address
 * @returns an object
 */
function constructAddress(data) {
    const messageBodyDict = {};

    for (let key of ADDRESS_VALIDATION_RULES) {
        if (data[key]) {
            messageBodyDict[key] = data[key];
        }
    }
    validateSchema(messageBodyDict, ADDRESS_VALIDATION_RULES);

    return messageBodyDict;
}

/**
 *
 * @param {*} data A dictionary containing the data that is passed from oneXerp
 * @param {*} validationRules A dictionary containing the validation rules
 */
function validateSchema(data, validationRules) {
    for (const key in validationRules) {
        if (data[key] !== undefined) {
            validationRules[key].validate(data[key]);
        } else if (validationRules[key].required) {
            throw new Error(`Required key "${key}" is missing from the data!`);
        }
    }
}

function checkIsValidString(stringToValidate) {
    if (
        typeof stringToValidate !== "string" ||
        stringToValidate.trim() === ""
    ) {
        throw new Error(`${stringToValidate} is an invalid string`);
    }
}

function checkIsValidNumber(numberToValidate) {
    if (typeof numberToValidate !== "number") {
        throw new Error(`${numberToValidate} is an invalid number`);
    }
}

function checkIsValidJobNumber(jobNumber) {
    const pattern = /^[a-zA-Z0-9\s]+:\d{4}$/;
    if (!pattern.test(jobNumber)) {
        throw new Error(`${jobNumber} is an invalid job number`);
    }
}

function formatNumberAsDouble(number) {
    return number.toFixed(2);
}

function getTestDataForUpdateVendor() {
    return {
        oneXerpId: "20",
        name: "oneXerpQB Test Company",
        is_active: true,
        created_by: "40dc7ec0-385b-4941-90de-7d6f53cdd6d7",
        last_updated_by: "40dc7ec0-385b-4941-90de-7d6f53cdd6d7",
        created_at: "2023-10-01T16:31:45.465Z",
        last_updated_at: "2023-10-01T16:31:45.465Z",
        is_net_vendor: true,
        billing_contact: "Billing Contact",
        billing_contact_number: "+1 (111) 111-1111",
        account_payable_contact: "Payable Contact",
        account_payable_contact_number: "+1 (222) 222-2222",
        tax_ID: "123ABC",
        billed_from: "123 Example Address, Chicago, Illinois, 12345",
        shipped_from: "456 Example Address, Chicago, Illinois, 67890",
        payment_terms: "Net 30",
        email: "testemail@testcompany.com",
        phone_number: "+1 (111) 111-1122",
        createdby: "Chaa Loftin",
        updatedby: "Chaa Loftin",
        new_name: "new name 1", // added this - NOTE a migration
        quickbooks_id: "123123", // added this
    };
}

// need migration for quickbooksId
function getDataForCreateVendor() {
    return {
        vendor_id: "20", // oneXerpId
        vendor_name: "oneXerpQB Test Company", // name
        is_active: true,
        created_by: "40dc7ec0-385b-4941-90de-7d6f53cdd6d7",
        last_updated_by: "40dc7ec0-385b-4941-90de-7d6f53cdd6d7",
        created_at: "2023-10-01T16:31:45.465Z",
        last_updated_at: "2023-10-01T16:31:45.465Z",
        is_net_vendor: true,
        billing_contact: "Billing Contact",
        billing_contact_number: "+1 (111) 111-1111",
        account_payable_contact: "Payable Contact",
        account_payable_contact_number: "+1 (222) 222-2222",
        tax_ID: "123ABC",
        billed_from: "123 Example Address, Chicago, Illinois, 12345",
        shipped_from: "456 Example Address, Chicago, Illinois, 67890",
        payment_terms: "Net 30",
        email: "testemail@testcompany.com",
        phone_number: "+1 (111) 111-1122",
        createdby: "Chaa Loftin",
        updatedby: "Chaa Loftin",
    };
}

// looks like this needs a shipping and tax
function getDataForCreatePurchaseOrder() {
    return {
        purchase_order_id: "00a0c8a7-d7c4-427c-b82a-c73c5e47a5c9", // oneXerpId
        last_updated_by: "84b80897-f65a-4e4e-89fa-348f68eb761b",
        created_by: "2a8c380e-21c6-4f28-9291-46ff0869474c",
        created_at: "2023-09-08T15:41:51.480Z",
        total_price: "0231",
        purchase_order_number: "617319943654",
        vendor_id: 3,
        purchase_order_status_id: 4,
        quickbooks_purchase_order_id: "1", // need this
        s3_uri: "1694187710859_k55mi.pdf",
        requester: "Talha Altaf",
        vendor_name: "Vendor 2", // need this
        purchase_order_status_name: "Received",
        comment_count: "1",
        purchase_order_items: [
            {
                purchase_order_item_id: "324df33c-0e14-4c2f-82a3-e55e52b97e71",
                purchase_order_id: "00a0c8a7-d7c4-427c-b82a-c73c5e47a5c9",
                created_by: "2a8c380e-21c6-4f28-9291-46ff0869474c",
                last_updated_by: "84b80897-f65a-4e4e-89fa-348f68eb761b",
                price: "2",
                quantity: "1",
                unit_of_measure: "",
                description: "Airport Surcharge",
                created_at: "2023-09-08T15:41:51.480234+00:00",
                last_updated_at: "2023-09-08T19:22:11.292885+00:00",
                is_damaged: false,
                damage_or_return_text: null,
                project_id: 3,
                purchase_order_item_status_id: 4,
                s3_uri: null,
                item_name: "Airport Surcharge",
                suggested_vendor: "Uber",
                urgent_order_status_id: 5,
                is_active: true,
                purchase_order_item_status_name: "Received",
                project_name: "Project 4",
            },
            {
                purchase_order_item_id: "87691dff-178c-41ef-9ed9-7897b8da9414",
                purchase_order_id: "00a0c8a7-d7c4-427c-b82a-c73c5e47a5c9",
                created_by: "2a8c380e-21c6-4f28-9291-46ff0869474c",
                last_updated_by: "84b80897-f65a-4e4e-89fa-348f68eb761b",
                price: "1",
                quantity: "1",
                unit_of_measure: "",
                description: "Trip fare",
                created_at: "2023-09-08T15:41:51.480234+00:00",
                last_updated_at: "2023-09-08T19:22:11.550715+00:00",
                is_damaged: false,
                damage_or_return_text: null,
                project_id: 2,
                purchase_order_item_status_id: 4,
                s3_uri: null,
                item_name: "Trip fare",
                suggested_vendor: "Uber",
                urgent_order_status_id: 5,
                is_active: true,
                purchase_order_item_status_name: "Received",
                project_name: "Project 2",
            },
            {
                purchase_order_item_id: "dd1f1c7b-815e-40a9-beb0-d260cd7da4fc",
                purchase_order_id: "00a0c8a7-d7c4-427c-b82a-c73c5e47a5c9",
                created_by: "2a8c380e-21c6-4f28-9291-46ff0869474c",
                last_updated_by: "84b80897-f65a-4e4e-89fa-348f68eb761b",
                price: "3",
                quantity: "1",
                unit_of_measure: "",
                description: "Texas Regulatory Recovery Fee",
                created_at: "2023-09-08T15:41:51.480234+00:00",
                last_updated_at: "2023-09-08T19:22:11.651251+00:00",
                is_damaged: null,
                damage_or_return_text: null,
                project_id: 5,
                purchase_order_item_status_id: 4,
                s3_uri: null,
                item_name: "Texas Regulatory Recovery Fee",
                suggested_vendor: "Uber",
                urgent_order_status_id: 5,
                is_active: true,
                purchase_order_item_status_name: "Received",
                project_name: "SIT TEST 2",
            },
        ],
    };
}
