import { v4 as uuidv4 } from "uuid";

class OcrImportedPurchaseOrderDraft {
    static fromJson(OcrImportedPurchaseOrderDraftData, knexInstance) {
        return {
            ocr_imported_purchase_order_draft_id: uuidv4(),
            created_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2",
            last_updated_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2",
            created_at: knexInstance.raw("NOW()"),
            last_updated_at: knexInstance.raw("NOW()"),
            ocr_suggested_vendor:
                OcrImportedPurchaseOrderDraftData.ocr_suggested_vendor,
            ocr_suggesetd_purchase_order_number:
                OcrImportedPurchaseOrderDraftData.ocr_suggesetd_purchase_order_number,
            s3_uri: OcrImportedPurchaseOrderDraftData.s3_uri,
        };
    }

    static async writeDraftAndItemsToDatabase(knex, draftData, draftItemsData) {
        // Use trx to make this atomic.  This should be an all or nothing operation
        return knex.transaction(async (trx) => {
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

                // If no errors, commit the transaction
                await trx.commit();
            } catch (error) {
                // If any errors, roll back the transaction
                await trx.rollback();
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
            if (imageUrl) {
                console.log("No image URL provided for fetch method");
                throw new Error(
                    "Missing imageUrl to download PO draft image from Veryfi"
                );
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
            throw e;
        }
    };

    /**
     * Uplaods a purchase order's encoded image to an S3 bucket
     *
     * @param {String} bucketName The name of the Veryfi image S3 bucket
     * @param {String} bucketKey The key for the Purchase Order Draft Image
     * @param {Uint8Array} imageBody The body for the Purchase Order Draft Image
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

        try {
            const parallelUploadToS3 = new Upload({
                client: new S3Client({}),
                params: targetParams,
            });

            parallelUploadToS3.on("httpUploadProgress", (progress) => {
                console.log(progress);
            });

            const completedUploadObject = await parallelUploadToS3.done();

            const s3Uri = completedUploadObject.Location;
            console.log(`S3URi: ${s3Uri}`);

            return s3Uri;
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
        if (
            typeof purchaseOrderId !== "string" ||
            purchaseOrderId.trim() === ""
        ) {
            console.error(
                `Invalid purchaseOrderId parameter used to create bucket key: ${purchaseOrderId}`
            );
            throw new Error(
                `purchaseOrderId is not a string or is an empty string: ${purchaseOrderId}`
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
}

export default OcrImportedPurchaseOrderDraft;
