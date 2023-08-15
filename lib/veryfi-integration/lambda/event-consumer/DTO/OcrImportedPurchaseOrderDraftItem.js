import { v4 as uuidv4 } from "uuid";
import VeryfiUtil from "../veryfi-util.js";

class OcrImportedPurchaseOrderDraftItem {
    /**
     * Converts a JSON object
     *
     * @param {*} draftItemData a JSON draft item object
     * @param {*} knexInstance the knexInstance that connects to the oneXerp database
     * @param {*} userId The id of the user in oneXerp
     * @param {*} ocrImportedPurchaseOrderDraftId The Id of the parent PurchaseOrderDraft object
     * @returns
     */
    static fromJson(
        draftItemData,
        knexInstance,
        userId,
        ocrImportedPurchaseOrderDraftId
    ) {
        return {
            ocr_imported_purchase_order_draft_item_id: uuidv4(),
            created_by: userId,
            last_updated_by: userId,
            quantity: draftItemData.quantity,
            created_at: knexInstance.raw("NOW()"),
            last_updated_at: knexInstance.raw("NOW()"),
            purchase_order_item_status_id: 1, // OCR-Processed
            ocr_imported_purchase_order_draft_id:
                ocrImportedPurchaseOrderDraftId,
            item_name: VeryfiUtil.formatStringWithMaxLength(
                draftItemData.item_name,
                45
            ),
            price: VeryfiUtil.formatStringWithMaxLength(
                draftItemData.price,
                20
            ),
            unit_of_measure: VeryfiUtil.formatStringWithMaxLength(
                draftItemData.unit_of_measure,
                20
            ),
            description: VeryfiUtil.formatStringWithMaxLength(
                draftItemData.description,
                100
            ),
        };
    }

    /**
     * Creates a new JSON object containing all relevant data for a PO draft item
     *
     * @param {Array} purchaseOrderDraftItemObjects List of item JSON objects
     * @param {*} knexInstance the knexInstance that connects to the oneXerp database
     * * @param {*} userId The userId in oneXerp
     * * @param {*} OcrImportedPurchaseOrderDraftId The id of the parent PurchaseOrderDraft
     * @returns
     */
    static createListOfOcrImportedPurchaseOrderDraftItems = (
        purchaseOrderDraftItemObjects,
        knexInstance,
        userId,
        OcrImportedPurchaseOrderDraftId
    ) => {
        return purchaseOrderDraftItemObjects.map((object) =>
            OcrImportedPurchaseOrderDraftItem.fromJson(
                object,
                knexInstance,
                userId,
                OcrImportedPurchaseOrderDraftId
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
        if (!purchaseOrder.purchase_order_items) {
            return;
        }

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
