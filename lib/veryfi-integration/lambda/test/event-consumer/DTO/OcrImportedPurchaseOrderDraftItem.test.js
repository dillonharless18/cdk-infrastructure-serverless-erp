import { v4 as uuidv4 } from "uuid";
import VeryfiUtil from "../../../event-consumer/veryfi-util.js";
import OcrImportedPurchaseOrderDraftItem from "../../../event-consumer/DTO/OcrImportedPurchaseOrderDraftItem.js";

jest.mock("../../../event-consumer/veryfi-util.js", () => ({
    isValidNumber: jest.fn(),
    formatStringWithMaxLength: jest.fn(),
}));

jest.mock("uuid", () => ({
    v4: jest.fn(), // Mock uuidv4 function
}));

describe("OcrImportedPurchaseOrderDraftItem", () => {
    describe("fromJson", () => {
        it("should create a draft item object from JSON", () => {
            // Mock data
            const draftItemData = {
                quantity: 5,
                item_name: "Sample Item",
                price: 10.99,
                unit_of_measure: "pcs",
                description: "A sample item description",
            };
            const knexInstance = {}; // Mock knex instance
            const userId = "user123";
            const ocrImportedPurchaseOrderDraftId = "draft456";

            // Mock VeryfiUtil functions
            VeryfiUtil.isValidString.mockReturnValue(true);
            VeryfiUtil.formatStringWithMaxLength.mockImplementation(
                (str) => str
            );
            uuidv4.mockReturnValue("mocked-uuid");

            const result = OcrImportedPurchaseOrderDraftItem.fromJson(
                draftItemData,
                knexInstance,
                userId,
                ocrImportedPurchaseOrderDraftId
            );

            expect(result).toEqual(
                expect.objectContaining({
                    ocr_imported_purchase_order_draft_item_id:
                        expect.any(String),
                    created_by: userId,
                    last_updated_by: userId,
                    quantity: draftItemData.quantity,
                    purchase_order_item_status_id: 1,
                    ocr_imported_purchase_order_draft_id:
                        ocrImportedPurchaseOrderDraftId,
                    // Other attributes
                })
            );
        });
    });

    describe("createListOfOcrImportedPurchaseOrderDraftItems", () => {
        it("should create a list of draft item objects", () => {
            // Mock data
            const purchaseOrderDraftItemObjects = [
                {
                    /* object1 data */
                },
                {
                    /* object2 data */
                },
            ];
            const knexInstance = {}; // Mock knex instance
            const userId = "user123";
            const ocrImportedPurchaseOrderDraftId = "draft456";

            // Mock VeryfiUtil functions
            VeryfiUtil.isValidString.mockReturnValue(true);
            VeryfiUtil.formatStringWithMaxLength.mockImplementation(
                (str) => str
            );

            const result =
                OcrImportedPurchaseOrderDraftItem.createListOfOcrImportedPurchaseOrderDraftItems(
                    purchaseOrderDraftItemObjects,
                    knexInstance,
                    userId,
                    ocrImportedPurchaseOrderDraftId
                );

            expect(result).toHaveLength(2); // Ensure correct length
            expect(result[0]).toEqual(
                expect.objectContaining({
                    // Object1 attributes
                })
            );
            // Check other attributes for object2
        });
    });

    describe("checkForRequiredItemAttributes", () => {
        it("should add error for invalid veryfi_id", () => {
            const purchaseOrder = {
                purchase_order_items: [
                    { veryfi_id: null }, // Invalid
                    { veryfi_id: 123 }, // Valid
                ],
            };
            const errors = { purchaseOrderItemErrors: [] };

            OcrImportedPurchaseOrderDraftItem.checkForRequiredItemAttributes(
                purchaseOrder,
                errors
            );

            expect(errors.purchaseOrderItemErrors).toContain(
                "purchaseOrderItem: undefined or zero number found: null"
            );
            expect(errors.purchaseOrderItemErrors).not.toContain(
                "purchaseOrderItem: undefined or zero number found: 123"
            );
        });
    });
});
