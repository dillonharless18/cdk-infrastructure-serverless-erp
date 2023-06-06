import VeryfiCustomClient from "./VeryfiCustomClient.cjs";
import PurchaseOrder from "./PurchaseOrder.js";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const CLIENT_ID = process.env["CLIENT_ID"];
const CLIENT_SECRET = process.env["CLIENT_SECRET"];
const USERNAME = process.env["USER_NAME"];
const API_KEY = process.env["API_KEY"];

const QUEUE_URL = process.env["SQS_QUEUE_URL"];
const TARGET_AWS_REGION = process.env["AWS_REGION"];

const GTE_TIME_DELTA_HOURS = 1;
const LTE_TIME_DELTA_HOURS = 0;
const DOMAIN_NAME = "bridgewaterstudio";
const DOMAIN_SUFFIX = "net";

const SUCCESS_RESPONSE = "success";

export const handler = async (event, context) => {
    try {
        const sqsClient = new SQSClient({ region: TARGET_AWS_REGION });
        const veryfiClient = new VeryfiCustomClient(
            CLIENT_ID,
            CLIENT_SECRET,
            USERNAME,
            API_KEY
        );

        // Get List of Veryfi documents that were created from the beginning
        // of the last hour until the beginning of the current hour.
        const documentList = await veryfiClient.getDocumentsCreatedWithinRange(
            GTE_TIME_DELTA_HOURS,
            LTE_TIME_DELTA_HOURS
        );
        console.log(
            "Document objects received from VeryFi:",
            JSON.stringify(documentList, undefined, 2)
        );

        // Extract purchase order data for non-empty document objects
        // and send to the event broker
        documentList.forEach(async (document) => {
            try {
                if (Object.keys(document).length === 0) {
                    return;
                }

                await extractDataFromDocumentObjectAndSendToSQS(
                    sqsClient,
                    document
                );
            } catch (error) {
                console.error(
                    "Error while extracting and sending data to SQS:",
                    error
                );
            }
        });

        return SUCCESS_RESPONSE;
    } catch (error) {
        console.error("Unexpected error while handling request:", error);
        throw error;
    }
};

/**
 * Extracts data from a Veryfi document object and sends
 * extracted data to the Veryfi event broker
 *
 * @param {*} sqsClient The SQS client for the event broker
 * @param {*} document The Veryfi document object
 */
const extractDataFromDocumentObjectAndSendToSQS = async (
    sqsClient,
    document
) => {
    const currentPurchaseOrder = PurchaseOrder.fromJson(
        document,
        DOMAIN_NAME,
        DOMAIN_SUFFIX
    );
    const sendCommand = new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageAttributes: {
            EventSource: {
                DataType: "String",
                StringValue: "Veryfi",
            },
        },
        MessageBody: JSON.stringify(currentPurchaseOrder),
    });

    console.log("current purchase order", currentPurchaseOrder);
    const sqsResponse = await sqsClient.send(sendCommand);
    console.log("SQS response:", sqsResponse);
};
