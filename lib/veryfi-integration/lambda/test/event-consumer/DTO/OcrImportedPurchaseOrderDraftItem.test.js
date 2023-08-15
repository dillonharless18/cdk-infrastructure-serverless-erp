import { v4 as uuidv4 } from "uuid";
import VeryfiUtil from "../../../event-consumer/veryfi-util.js";
import OcrImportedPurchaseOrderDraftItem from "../../../event-consumer/DTO/OcrImportedPurchaseOrderDraftItem.js";

jest.mock("../../../event-consumer/veryfi-util.js", () => ({
    isValidNumber: jest.fn(),
    isValidString: jest.fn(),
    formatStringWithMaxLength: jest.fn(),
}));

jest.mock("uuid", () => ({
    v4: jest.fn(), // Mock uuidv4 function
}));

VeryfiUtil.isValidNumber.mockImplementation((numberToValidate) => {
    if (numberToValidate === null) return false;
    if (numberToValidate === 123) return true;
    return false;
});

const mockKnexInstance = {
    table: jest.fn().mockReturnThis(),
    insert: jest.fn(),
    raw: jest.fn(),
};
mockKnexInstance.raw.mockReturnValue("2023-08-14 12:34:56.789012");

const userId = "user123";
const ocrImportedPurchaseOrderDraftId = "draft456";

describe("OcrImportedPurchaseOrderDraftItem", () => {
    describe("fromJson", () => {
        it("should create a draft item object from JSON", () => {
            const draftItemData = {
                quantity: 5,
                item_name: "Sample Item",
                price: 10.99,
                unit_of_measure: "pcs",
                description: "A sample item description",
            };

            VeryfiUtil.isValidString.mockReturnValue(true);
            VeryfiUtil.formatStringWithMaxLength.mockImplementation(
                (str) => str
            );
            uuidv4.mockReturnValue("mocked-uuid");

            const result = OcrImportedPurchaseOrderDraftItem.fromJson(
                draftItemData,
                mockKnexInstance,
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
                    item_name: draftItemData.item_name,
                    price: draftItemData.price,
                    unit_of_measure: draftItemData.unit_of_measure,
                    description: draftItemData.description,
                })
            );
        });
    });

    describe("create List Of OcrImportedPurchaseOrderDraftItems", () => {
        it("should create a list of draft item objects", () => {
            const purchaseOrderDraftItemObjects = [
                {
                    quantity: 5,
                    item_name: "Sample Item",
                    price: 10.99,
                    unit_of_measure: "pcs",
                    description: "A sample item description",
                },
                {
                    quantity: 6,
                    item_name: "Sample Item 2",
                    price: 4.01,
                    unit_of_measure: "lb",
                    description: "A sample item description again",
                },
            ];

            // Mock VeryfiUtil functions
            VeryfiUtil.isValidString.mockReturnValue(true);
            VeryfiUtil.formatStringWithMaxLength.mockImplementation(
                (str) => str
            );

            const result =
                OcrImportedPurchaseOrderDraftItem.createListOfOcrImportedPurchaseOrderDraftItems(
                    purchaseOrderDraftItemObjects,
                    mockKnexInstance,
                    userId,
                    ocrImportedPurchaseOrderDraftId
                );

            expect(result).toHaveLength(2); // Ensure correct length
            expect(result[0]).toEqual(
                expect.objectContaining({
                    ocr_imported_purchase_order_draft_item_id:
                        expect.any(String),
                    created_by: userId,
                    last_updated_by: userId,
                    quantity: purchaseOrderDraftItemObjects[0].quantity,
                    purchase_order_item_status_id: 1,
                    ocr_imported_purchase_order_draft_id:
                        ocrImportedPurchaseOrderDraftId,
                    item_name: purchaseOrderDraftItemObjects[0].item_name,
                    price: purchaseOrderDraftItemObjects[0].price,
                    unit_of_measure:
                        purchaseOrderDraftItemObjects[0].unit_of_measure,
                    description: purchaseOrderDraftItemObjects[0].description,
                })
            );
            expect(result[1]).toEqual(
                expect.objectContaining({
                    ocr_imported_purchase_order_draft_item_id:
                        expect.any(String),
                    created_by: userId,
                    last_updated_by: userId,
                    quantity: purchaseOrderDraftItemObjects[1].quantity,
                    purchase_order_item_status_id: 1,
                    ocr_imported_purchase_order_draft_id:
                        ocrImportedPurchaseOrderDraftId,
                    item_name: purchaseOrderDraftItemObjects[1].item_name,
                    price: purchaseOrderDraftItemObjects[1].price,
                    unit_of_measure:
                        purchaseOrderDraftItemObjects[1].unit_of_measure,
                    description: purchaseOrderDraftItemObjects[1].description,
                })
            );
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
