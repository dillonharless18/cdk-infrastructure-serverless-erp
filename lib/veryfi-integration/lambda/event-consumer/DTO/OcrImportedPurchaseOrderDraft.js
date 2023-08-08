import { v4 as uuidv4 } from "uuid";
import OcrImportedPurchaseOrderDraftItem from "./OcrImportedPurchaseOrderDraftItem.js";
import VeryfiUtil from "../veryfi-util.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { default as nodeFetch } from "node-fetch";
import knex from "knex";

class OcrImportedPurchaseOrderDraft {
    /**
     * Converts a JSON object in an OCR Imported PO Draft object
     *
     * @param {*} draftItemData a JSON draft item object
     * @param {*} knexInstance the knexInstance that connects to the oneXerp database
     * @returns
     */
    static fromJson(OcrImportedPurchaseOrderDraftData, knexInstance) {
        userId = OcrImportedPurchaseOrderDraft.#getUserIdWithOcrToolId(
            knexInstance,
            OcrImportedPurchaseOrderDraftData.ocr_tool_id
        );

        return {
            ocr_imported_purchase_order_draft_id: uuidv4(),
            created_by: userId,
            last_updated_by: userId,
            created_at: knexInstance.raw("NOW()"),
            last_updated_at: knexInstance.raw("NOW()"),
            s3_uri: OcrImportedPurchaseOrderDraftData.s3_uri,
            ocr_suggested_vendor: VeryfiUtil.formatStringWithMaxLength(
                OcrImportedPurchaseOrderDraftData.ocr_suggested_vendor,
                45
            ),
            ocr_suggesetd_purchase_order_number:
                VeryfiUtil.formatStringWithMaxLength(
                    OcrImportedPurchaseOrderDraftData.ocr_suggested_purchase_order_number,
                    45
                ),
        };
    }

    /**
     * validates each purchase order and its items
     *
     * @param {*} purchaseOrder The purchase order object
     */
    static validatePurchaseOrderDraft(purchaseOrder) {
        const errors = {
            purchaseOrderErrors: [],
            purchaseOrderItemErrors: [],
        };

        try {
            this.#checkForRequiredOrderAttributes(purchaseOrder, errors);
            OcrImportedPurchaseOrderDraftItem.checkForRequiredItemAttributes(
                purchaseOrder,
                errors
            );
        } catch (error) {
            console.error(
                "unexpected error occurred while validating purchase order",
                error
            );
        }

        if (
            errors.purchaseOrderErrors.length !== 0 ||
            errors.purchaseOrderItemErrors.length !== 0
        ) {
            console.error(
                "Errors found for purchase order:",
                JSON.stringify(errors, undefined, 2)
            );
            throw new Error("Errors found for purchase order:", errors);
        }
    }

    /**
     *
     * @param {*} knexInstance the knexInstance that connects to the oneXerp database
     * @param {Object} draftData Valid JSON data for an OCR Imported PO Draft
     * @param {Array} draftItemsData List of valid JSON data for OCR Imported PO Draft items
     * @returns
     */
    static async writeDraftAndItemsToDatabase(
        knexInstance,
        draftData,
        draftItemsData
    ) {
        // Use trx to make this atomic.  This should be an all or nothing operation
        return await knexInstance.transaction(async (trx) => {
            try {
                await trx("ocr_imported_purchase_order_draft").insert(
                    draftData
                );

                for (const itemData of draftItemsData) {
                    itemData.ocr_imported_purchase_order_draft_id =
                        draftData.ocr_imported_purchase_order_draft_id;
                    await trx("ocr_imported_purchase_order_draft_item").insert(
                        itemData
                    );
                }
            } catch (error) {
                // If any errors, roll back the transaction
                throw error;
            }
        });
    }

    /**
     * Downloads the image stored in Veryfi for a purchase order
     *
     * @param {String} imageUrl The image URL provided by Veryfi
     * @returns {Uint8Array} The encoded image body
     */
    static downloadPurchaseOrderImage = async (imageUrl) => {
        try {
            if (!imageUrl) {
                console.log("No image URL provided for fetch method");
                throw new Error(
                    "Missing imageUrl to download PO draft image from Veryfi"
                );
            }

            const response = await nodeFetch(imageUrl);
            if (!response.ok) {
                throw new Error(`unexpected response ${response.statusText}`);
            }

            const imageBuffer = await response.arrayBuffer();
            console.log(
                `Downloaded image from veryfi with the following URL: ${imageUrl}`
            );

            return imageBuffer;
        } catch (e) {
            console.error("Error downloading object from veryfi", e);
            throw e;
        }
    };

    /**
     * Uplaods a purchase order's encoded image to an S3 bucket
     *
     * @param {String} bucketName The name of the Veryfi image S3 bucket
     * @param {String} bucketKey The key for the Purchase Order Draft Image
     * @param {*} imageBody The body for the Purchase Order Draft Image
     * @returns The S3 uri for the Veryfi image
     */
    static uploadPurchaseOrderDraftImageToS3 = async (
        bucketName,
        bucketKey,
        imageBody
    ) => {
        const targetParams = {
            Bucket: bucketName,
            Key: bucketKey,
            Body: imageBody,
        };
        const s3Client = new S3Client({ region: process.env["AWS_REGION"] });
        const putObjectCommand = new PutObjectCommand(targetParams);

        try {
            console.log("uploading image to S3");
            const response = await s3Client.send(putObjectCommand);

            console.log("successful upload!", response);
            const s3Url = `https://${bucketName}.s3.amazonaws.com/${bucketKey}`;

            return s3Url;
        } catch (e) {
            console.error(
                "Failed upload of PO Image to S3:",
                "bucketName:",
                bucketName,
                "S3 Key:",
                bucketKey,
                "image body:",
                imageBody
            );
            throw e;
        }
    };

    /**
     * Generates a unique S3 key for a purchase order
     *
     * @param {String} purchaseOrderId
     * @returns the s3 key for the purchase order
     */
    static createUniqueBucketKeyForPurchaseOrderImage = (purchaseOrderId) => {
        if (!VeryfiUtil.isValidNumber(purchaseOrderId)) {
            console.error(
                `Invalid purchaseOrderId parameter used to create bucket key: ${purchaseOrderId}`
            );
            throw new Error(
                `purchaseOrderId is not a valid number: ${purchaseOrderId}`
            );
        }
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const formattedDate = `veryfi_images/${year}/${month}/${day}/${hour}/${minutes}/${purchaseOrderId}`;

        return formattedDate;
    };

    /**
     * Checks that a purchase order object has contains required fields
     *
     * @param {Object} purchaseOrder The purchase order dict
     * @param {List} errors The list to store all purchase order errors
     */
    static #checkForRequiredOrderAttributes(purchaseOrder, errors) {
        const { veryfi_document_id, ocr_tool_id } = purchaseOrder;

        if (!VeryfiUtil.isValidNumber(veryfi_document_id)) {
            errors.purchaseOrderErrors.push(
                `Purchase Order: undefined or zero number found: ${veryfi_document_id}`
            );
        }
        if (!VeryfiUtil.isValidString(ocr_tool_id)) {
            errors.purchaseOrderErrors.push(
                `Purchase Order: undefined or empty ocr_tool_id found: ${ocr_tool_id}`
            );
        }
    }

    static async #getUserIdWithOcrToolId(knexInstance, ocrToolIdForUser) {
        if (!VeryfiUtil.isValidString(ocrToolIdForUser)) {
            throw new Error(
                "Invalid OCR Tool ID provided.  Null or Undefined not allowed."
            );
        }

        const userId = await knexInstance("user")
            .where("ocr_tool_id", ocrToolIdForUser)
            .pluck("user_id");

        if (userId.length === 0) {
            throw new Error(
                `no userId found for the associated ocr_tool_id: ${ocrToolIdForUser}`
            );
        }

        return userId[0];
    }
}

export default OcrImportedPurchaseOrderDraft;
