import initializeKnex from "/opt/nodejs/db/index.js";
import VeryfiUtil from "./veryfi-util.js";
import OcrImportedPurchaseOrderDraft from "./DTO/OcrImportedPurchaseOrderDraft.jss";
import OcrImportedPurchaseOrderDraftItem from "./DTO/OcrImportedPurchaseOrderDraftItem.js";

const VERYFI_IMAGE_BUCKET_NAME = process.env["BUCKET_NAME"];
let knexInstance;

export const handler = async (event, context) => {
    const sqsMessages = event.Records;

    try {
        await initializeDb();
        processSqsMessages(sqsMessages, knexInstance);
    } catch (error) {
        console.error("unexpected veryfi event consumer error:", error);
        throw error;
    }

    return "Success!";
};

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
 * @param {Array} sqsMessages Up to 10 messages pulled from the veryfi event-broker
 * @param {*} knexInstance The knexInstance used to interact the the oneXerp Database
 */
const processSqsMessages = async (sqsMessages, knexInstance) => {
    if (!sqsMessages) {
        return;
    }

    for (const sqsMessage of sqsMessages) {
        const messageBody = sqsMessage.body;

        try {
            const purchaseOrderDraftObject = JSON.parse(messageBody);
            console.log(
                "Processing Ocr ImportedPurchaseOrderDraft",
                JSON.stringify(purchaseOrderDraftObject, undefined, 2)
            );

            VeryfiUtil.validatePurchaseOrderDraft(purchaseOrderDraftObject);

            // Download and process Veryfi image for OcrImportedPurchaseOrderDraft
            const purchaseOrderImageBody =
                OcrImportedPurchaseOrderDraft.downloadPurchaseOrderImage(
                    purchaseOrderDraftObject.imageURL
                );
            const s3Key =
                OcrImportedPurchaseOrderDraft.createUniqueBucketKeyForPurchaseOrderImage(
                    purchaseOrderDraftObject.veryfi_document_id
                );
            const s3Uri =
                OcrImportedPurchaseOrderDraft.uploadPurchaseOrderDraftImageToS3(
                    VERYFI_IMAGE_BUCKET_NAME,
                    s3Key,
                    purchaseOrderImageBody
                );
            purchaseOrderDraftObject.s3_uri = s3Uri;

            // Create objects to store in the database
            const { purchase_order_items, ...ocrImportedPurchaseOrderDraft } =
                purchaseOrderDraftObject;

            ocrImportedPurchaseOrderDraft =
                OcrImportedPurchaseOrderDraft.fromJson(
                    purchaseOrderDraftObject,
                    knexInstance
                );
            const ocrImportedPurchaseOrderDraftItems =
                OcrImportedPurchaseOrderDraftItem.createListOfOcrImportedPurchaseOrderDraftItems(
                    purchase_order_items,
                    knexInstance
                );

            // load objects into database
            OcrImportedPurchaseOrderDraft.writeDraftAndItemsToDatabase(
                knexInstance,
                ocrImportedPurchaseOrderDraft,
                ocrImportedPurchaseOrderDraftItems
            );
        } catch (error) {
            console.error("Error processing sqs message", error);
            throw error;
        }
    }
};
