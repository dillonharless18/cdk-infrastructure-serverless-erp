import initializeKnex from "/opt/nodejs/db/index.js";
import OcrImportedPurchaseOrderDraft from "./DTO/OcrImportedPurchaseOrderDraft.js";
import OcrImportedPurchaseOrderDraftItem from "./DTO/OcrImportedPurchaseOrderDraftItem.js";

const VERYFI_IMAGE_BUCKET_NAME = process.env["BUCKET_NAME"];
let knexInstance;

/**
 * Lambda handler for the event consumer
 *
 * @param {*} event the sqs event
 * @param {*} context the sqs event context
 * @returns success if now errors occur during the sqs message processing
 */
export const handler = async (event, context) => {
    const sqsMessages = event.Records;

    try {
        await initializeDb();
        await processSqsMessages(sqsMessages, knexInstance);
        console.log("success");
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
 * Main method for the event consumer that performs the following actions:
 *
 * - Validates all PO drafts and draft items
 * - Fetches the PO draft image from Veryfi
 * - Uploads the image to S3 and grabs the S3 URI
 * - Uploads PO drafts and draft items to the oneXerp database
 *
 * @param {Array} sqsMessages Up to 10 messages pulled from the veryfi event-broker
 * @param {*} knexInstance The knexInstance used to interact the the oneXerp Database
 */
const processSqsMessages = async (sqsMessages, knexInstance) => {
    if (!sqsMessages) {
        return;
    }

    await Promise.all(
        sqsMessages.map(async (sqsMessage) => {
            try {
                const messageBody = sqsMessage.body;

                // Get PO draft object from sqs message and validate it
                const purchaseOrderDraftObject = JSON.parse(messageBody);
                console.log(
                    "Processing Ocr ImportedPurchaseOrderDraft",
                    JSON.stringify(purchaseOrderDraftObject, undefined, 2)
                );
                OcrImportedPurchaseOrderDraft.validatePurchaseOrderDraft(
                    purchaseOrderDraftObject
                );

                // Download and process Veryfi image for OcrImportedPurchaseOrderDraft
                const { purchaseOrderImageBody, contentType } =
                    await OcrImportedPurchaseOrderDraft.downloadPurchaseOrderImage(
                        purchaseOrderDraftObject.img_url
                    );

                const fileExtension = contentType.split("/")[1];
                if (!fileExtension) {
                    throw new Error(`Unsupported MIME type: ${contentType}`);
                }
                console.log("successfully downloaded PO Image body.");

                const s3Key =
                    OcrImportedPurchaseOrderDraft.createUniqueBucketKeyForPurchaseOrderImage(
                        purchaseOrderDraftObject.veryfi_document_id,
                        fileExtension
                    );
                console.log("successfully created S3 key:", s3Key);

                const s3Uri =
                    await OcrImportedPurchaseOrderDraft.uploadPurchaseOrderDraftImageToS3(
                        VERYFI_IMAGE_BUCKET_NAME,
                        s3Key,
                        purchaseOrderImageBody,
                        contentType
                    );
                console.log("successfully uploaded image to S3:", s3Uri);
                purchaseOrderDraftObject.s3_uri = s3Key;

                // Create objects to store in the database
                const {
                    purchase_order_items,
                    ...ocrImportedPurchaseOrderDraft
                } = purchaseOrderDraftObject;

                const ocrImportedPurchaseOrderDraftJson =
                    await OcrImportedPurchaseOrderDraft.fromJson(
                        purchaseOrderDraftObject,
                        knexInstance
                    );
                const ocrImportedPurchaseOrderDraftItems =
                    OcrImportedPurchaseOrderDraftItem.createListOfOcrImportedPurchaseOrderDraftItems(
                        purchase_order_items,
                        knexInstance,
                        ocrImportedPurchaseOrderDraftJson.created_by,
                        ocrImportedPurchaseOrderDraftJson.ocr_imported_purchase_order_draft_id
                    );

                // load objects into database
                await OcrImportedPurchaseOrderDraft.writeDraftAndItemsToDatabase(
                    knexInstance,
                    ocrImportedPurchaseOrderDraftJson,
                    ocrImportedPurchaseOrderDraftItems
                );
                console.log("successfully uploaded PO and items to DB");
            } catch (error) {
                console.error("Error processing sqs message", error);
                throw error;
            }
        })
    );
};
