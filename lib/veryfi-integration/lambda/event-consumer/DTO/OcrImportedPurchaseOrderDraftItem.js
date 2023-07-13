import { v4 as uuidv4 } from "uuid";

class OcrImportedPurchaseOrderDraftItem {
    static fromJson(draftItemData, knexInstance) {
        return {
            ocr_imported_purchase_order_draft_item_id: uuidv4(),
            created_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2",
            last_updated_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2",
            item_name: draftItemData.item_name,
            price: draftItemData.price,
            quantity: draftItemData.quantity,
            unit_of_measure: draftItemData.unit_of_measure,
            description: draftItemData.description,
            created_at: knexInstance.raw("NOW()"),
            last_updated_at: knexInstance.raw("NOW()"),
            purchase_order_item_status_id: 1, // OCR-Processed
        };
    }

    static createListOfOcrImportedPurchaseOrderDraftItems = (
        purchaseOrderDraftItemObjects,
        knexInstance
    ) => {
        return purchaseOrderDraftItemObjects.map(
            (object) =>
                new OcrImportedPurchaseOrderDraftItem.fromJson(
                    object,
                    knexInstance
                )
        );
    };
}

export default OcrImportedPurchaseOrderDraftItem;
