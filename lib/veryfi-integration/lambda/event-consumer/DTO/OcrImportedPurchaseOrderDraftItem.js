import { v4 as uuidv4 } from "uuid";
import VeryfiUtil from "../veryfi-util";

class OcrImportedPurchaseOrderDraftItem {
    /**
     * Converts a JSON object
     *
     * @param {*} draftItemData a JSON draft item object
     * @param {*} knexInstance the knexInstance that connects to the oneXerp database
     * @returns
     */
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

    /**
     * Creates a new JSON object containing all relevant data for a PO draft item
     *
     * @param {Array} purchaseOrderDraftItemObjects List of item JSON objects
     * @param {*} knexInstance the knexInstance that connects to the oneXerp database
     * @returns
     */
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

    /**
     * Checks that a purchase order item contains all required fields
     *
     * @param {Object} purchaseOrder The purchase order dict
     * @param {List} errors The list to store all item errors
     */
    static checkForRequiredItemAttributes(purchaseOrder, errors) {
        for (const item of purchaseOrder.purchase_order_items) {
            const { veryfi_id } = item;

            if (!VeryfiUtil.isValidNumber(veryfi_id)) {
                errors.purchaseOrderItemErrors.push(
                    `purchaseOrderItem: undefined or zero number found: ${veryfi_id}`
                );
            }
        }
    }
}

export default OcrImportedPurchaseOrderDraftItem;
