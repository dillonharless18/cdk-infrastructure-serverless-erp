import initializeKnex from "/opt/nodejs/db/index.js";
import PurchaseOrderUtil from "./PurchaseOrderUtil.js";

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
 * @returns the tot
 */
const processSqsMessages = async (sqsMessages, knexInstance) => {
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
            // TODO - uncomment this after import statements are fixed
            // const purchaseOrderImageBody = downloadVeryfiImage(
            //     purchaseOrder.imageURL
            // );
            // const s3Key = createUniqueBucketKeyForImage(
            //     purchaseOrder.veryfi_document_id
            // );
            // const s3Url = uploadVeryfiImageToS3(
            //     VERYFI_IMAGE_BUCKET_NAME,
            //     s3Key,
            //     purchaseOrderImageBody
            // );
        } catch (error) {
            console.error("Error processing sqs message", error);
            throw error;
        }
    }
};

/**
 * Downloads the image stored in Veryfi for a purchase order
 *
 * @param {String} imageUrl The image URL provided by Veryfi
 * @returns {Uint8Array} The encoded image body
 */
const downloadPurchaseOrderImage = async (imageUrl) => {
    try {
        if (imageUrl) {
            console.log("No image URL provided for fetch method");
            return "";
        }
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`unexpected response ${response.statusText}`);
        }
        const imageBuffer = await response.arrayBuffer();
        const imageBody = new Uint8Array(imageBuffer);

        console.log(
            `Downloaded image from veryfi with the following URL: ${imageUrl}`
        );

        return imageBody;
    } catch (e) {
        console.error("Error downloading object from veryfi", e);
    }
};

/**
 * Uplaods a purchase order's encoded image to an S3 bucket
 *
 * @param {String} bucketName The name of the Veryfi image S3 bucket
 * @param {String} bucketKey The key for the Purchase Order Image
 * @param {Uint8Array} imageBody The
 * @returns The S3 url for the Veryfi image
 */
const uploadPurchaseOrderImageToS3 = async (
    bucketName,
    bucketKey,
    imageBody
) => {
    const targetParams = {
        Bucket: bucketName,
        Key: bucketKey,
        Body: imageBody,
    };

    try {
        const parallelUploadToS3 = new Upload({
            client: new S3Client({}),
            params: targetParams,
        });

        parallelUploadToS3.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });

        const completedUploadObject = await parallelUploadToS3.done();

        console.log(
            `Upload location for object: ${completedUploadObject.Location}`
        );

        const s3Url = completedUploadObject.Location;
        console.log(`S3URL: ${s3Url}`);

        return s3Url;
    } catch (e) {
        console.error("error uploading object to s3", e);
    }
};

/**
 * Generates a unique S3 key for a purchase order
 *
 * @param {String} purchaseOrderId
 * @returns the s3 key for the purchase order
 */
const createUniqueBucketKeyForPurchaseOrderImage = (purchaseOrderId) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedDate = `veryfi_images/${year}/${month}/${day}/${hour}/${minutes}/${purchaseOrderId}`;

    return formattedDate;
};
