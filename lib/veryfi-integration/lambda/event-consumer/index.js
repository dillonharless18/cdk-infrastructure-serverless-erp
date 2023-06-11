import initializeKnex from "/opt/nodejs/db/index.js";
import PurchaseOrderUtil from "./PurchaseOrderUtil";
let knexInstance;

const initializeDb = async () => {
    try {
        if (!knexInstance) {
            knexInstance = await initializeKnex();
        }
    } catch (error) {
        console.error(
            "error encountered while initializing knex instance",
            error
        );
        throw error;
    }
};

/**
 * Validates the body (purchase orders) of an SQS message and
 * posts an OCR imported purchase order to the database
 *
 * @param {*} sqsMessages Up to 10 messages pulled from the veryfi event-broker
 * @returns the tot
 */
const processSqsMessages = async (sqsMessages) => {
    if (!sqsMessages) {
        return;
    }

    for (const sqsMessage of sqsMessages) {
        const messageBody = sqsMessage.body;

        try {
            const purchaseOrder = JSON.parse(messageBody);
            console.log(
                "Processing Purchase Order",
                JSON.stringify(purchaseOrder, undefined, 2)
            );
            PurchaseOrderUtil.validatePurchaseOrder(purchaseOrder);
        } catch (error) {
            console.error("Error processing sqs message", error);
            throw error;
        }
    }
};

export const handler = async (event, context) => {
    const sqsMessages = event.Records;

    try {
        await initializeDb();
        processSqsMessages(sqsMessages);
    } catch (error) {
        console.error("unexpected veryfi event consumer error:", error);
        throw error;
    }

    return "Success!";
};
