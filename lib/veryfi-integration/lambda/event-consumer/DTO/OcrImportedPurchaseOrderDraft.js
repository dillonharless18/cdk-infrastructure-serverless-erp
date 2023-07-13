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
}

export default OcrImportedPurchaseOrderDraft;
