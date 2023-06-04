const VeryfiCustomClient = require("./VeryfiCustomClient");
const PurchaseOrder = require("./PurchaseOrder");

// CLIENT_ID = os.environ.get('CLIENT_ID')
// CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
// USERNAME = os.environ.get('USER_NAME')
// API_KEY = os.environ.get('API_KEY')
const CLIENT_ID = "vrfum8CF1oC7ka104tjEBKfmf4NYiE3gzLo8igS";
const CLIENT_SECRET =
    "FwxDFcfuZw7PTt0iARJxtp3w3JoET7vRePhIU1FbR2ytU7VLzUkeKYsVBXd8CSM8Xgl8SrE5Do0brNu0kuczzGTiWmTKzTVFJFFBueH66vXU34r2RYZV2eguwkV0tjoc";
const USERNAME = "chaamail";
const API_KEY = "1f1e83e8e9d688f57d0321728d384ba8";
// TARGET_AWS_REGION_NAME = os.environ.get("AWS_REGION");
// TARGET_DB_NAME = os.environ.get("DB_NAME");
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

    console.log();
    console.log(JSON.stringify(documentList, undefined, 2));
    console.log();

    const purchaseOrders = documentList.map((document) =>
        PurchaseOrder.fromJson(document, DOMAIN_NAME, DOMAIN_SUFFIX)
    );

    console.log(JSON.stringify(purchaseOrders, undefined, 2));
};

handler(null, null);
