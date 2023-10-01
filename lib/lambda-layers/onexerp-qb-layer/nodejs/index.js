import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Braket } from "aws-sdk";

const ACTION_TYPES = ["CREATE_PO", "CREATE_VENDOR", "UPDATE_VENDOR"];
const ITEM_TYPES = ["Materials", "Other"];
/**
 * Sends a message to the oneXerp QB Egress Queue given a url and message body.
 * This method doesnt contain error handling, so the caller must handle this.
 *
 * @param {*} queueUrl the oneXerp QB Egress Queue URL
 * @param {*} actionType can be one of the following "CREATE_PO" | "CREATE_VENDOR" | "UPDATE_VENDOR";
 * @param {*} messageBody the deserialized message body to be sent
 */
const sendMessageToOneXerpQBEgressQueue = async (actionType, messageBody) => {
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
            break;
        case "CREATE_VENDOR":
            body = constructCreateVendorMessage(data);
            break;
        case "UPDATE_VENDOR":
            body = constructUpdateVendorMessage(data);
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
function constructCreateVendorMessage({
    oneXerpId,
    name,
    vendorAddressData,
    phone,
}) {
    checkIsValidString(oneXerpId);
    checkIsValidString(name);

    const messageBodyDict = {
        oneXerpId: oneXerpId,
        Name: name,
        CompanyName: name,
    };

    if (vendorAddressData) {
        messageBodyDict["VendorAddress"] = constructAddress(vendorAddressData);
    }
    if (phone) {
        checkIsValidString(phone);
        messageBodyDict["Phone"] = phone;
    }

    return messageBodyDict;
}

/**
 *
 * @param {*} data The data used to construct the message
 * @returns an object
 */
function constructUpdateVendorMessage({
    oneXerpId,
    name,
    vendorAddress,
    phone,
    newName,
    quickbooksId,
}) {
    const messageBodyDict = constructCreateVendorMessage({
        oneXerpId,
        name,
        vendorAddress,
        phone,
    });
    if (newName) {
        checkIsValidString(newName);
        messageBodyDict["NewName"] = newName;
        messageBodyDict["NewCompanyName"] = newName;
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
function constructCreatePurchaseOrderMessage({
    oneXerpId,
    VendorName,
    OrderDate,
    Items,
    PurchaseOrderNumber,
    Shipping,
    Tax,
}) {
    if (!Array.isArray(Items) || Items.length === 0)
        throw new Error("Invalid Items array");
    checkIsValidString(oneXerpId);
    checkIsValidString(VendorName);
    checkIsValidString(PurchaseOrderNumber);
    checkIsValidNumber(Shipping);
    checkIsValidNumber(Tax);

    Items.forEach((item) => constructLineItem(item));

    return {
        oneXerpId,
        VendorName,
        OrderDate,
        PurchaseOrderNumber,
        Shipping: formatNumberAsDouble(Shipping),
        Tax: formatNumberAsDouble(Tax),
        Items,
    };
}

function constructLineItem({
    oneXerpId,
    ItemName,
    Quantity,
    Rate,
    ItemType,
    UnitOfMeasure,
    JobNumber,
}) {
    checkIsValidString(oneXerpId);
    checkIsValidString(ItemName);
    checkIsValidString(UnitOfMeasure);
    checkIsValidNumber(Quantity);
    checkIsValidNumber(Rate);
    checkIsValidJobNumber(JobNumber);

    if (!ITEM_TYPES.includes(ItemType)) {
        throw new Error(`invalid item type! ${ItemType}`);
    }

    return {
        oneXerpId,
        ItemType,
        ItemName,
        Quantity: formatNumberAsDouble(Quantity),
        Rate: formatNumberAsDouble(Rate),
        UnitOfMeasure,
        JobNumber,
    };
}

/**
 *
 * @param {*} data The data used to construct the Address
 * @returns an object
 */
function constructAddress({
    _addr1,
    _addr2,
    _addr3,
    _addr4,
    _addr5,
    _city,
    _state,
    _postalCode,
    _country,
    _note,
}) {
    const messageBodyDict = {};

    if (_addr1) {
        checkIsValidString(_addr1);
        messageBodyDict["_addr1"] = _addr1;
    }
    if (_addr2) {
        checkIsValidString(_addr2);
        messageBodyDict["_addr2"] = _addr2;
    }
    if (_addr3) {
        checkIsValidString(_addr3);
        messageBodyDict["_addr3"] = _addr3;
    }
    if (_addr4) {
        checkIsValidString(_addr4);
        messageBodyDict["_addr4"] = _addr4;
    }
    if (_addr5) {
        checkIsValidString(_addr5);
        messageBodyDict["_addr5"] = _addr5;
    }
    if (_city) {
        checkIsValidString(_city);
        messageBodyDict["_city"] = _city;
    }
    if (_state) {
        checkIsValidString(_state);
        messageBodyDict["_state"] = _state;
    }
    if (_postalCode) {
        checkIsValidString(_postalCode);
        messageBodyDict["_postalCode"] = _postalCode;
    }
    if (_country) {
        checkIsValidString(_country);
        messageBodyDict["_country"] = _country;
    }
    if (_note) {
        checkIsValidString(_note);
        messageBodyDict["_note"] = _note;
    }

    return messageBodyDict;
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
        new_name: "new name 1",
        quickbooksId: "123123",
    };
}

// need migration for quickbooksId
// need new_anem
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
