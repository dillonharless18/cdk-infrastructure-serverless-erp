import VeryfiCustomClient from "./VeryfiCustomClient.cjs";
import PurchaseOrder from "./PurchaseOrder.js";

CLIENT_ID = process.env["CLIENT_ID"];
CLIENT_SECRET = process.env["CLIENT_SECRET"];
USERNAME = process.env["USER_NAME"];
API_KEY = process.env["API_KEY"];
TARGET_AWS_REGION_NAME = process.env["AWS_REGION"];
TARGET_DB_NAME = process.env["DB_NAME"];

const GTE_TIME_DELTA_HOURS = 1;
const LTE_TIME_DELTA_HOURS = 0;
const DOMAIN_NAME = "bridgewaterstudio";
const DOMAIN_SUFFIX = "net";

const handler = async (event, context) => {
    const veryfiClient = new VeryfiCustomClient(
        CLIENT_ID,
        CLIENT_SECRET,
        USERNAME,
        API_KEY
    );
    const documentList = await veryfiClient.getDocumentsCreatedWithinRange(
        GTE_TIME_DELTA_HOURS,
        LTE_TIME_DELTA_HOURS
    );

    const purchaseOrders = documentList.map((document) =>
        PurchaseOrder.fromJson(document, DOMAIN_NAME, DOMAIN_SUFFIX)
    );

    console.log(JSON.stringify(purchaseOrders, undefined, 2));
};

handler(null, null);
