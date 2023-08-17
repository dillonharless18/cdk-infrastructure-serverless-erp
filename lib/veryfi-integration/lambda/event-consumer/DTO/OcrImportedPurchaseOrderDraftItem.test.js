import { v4 as uuidv4 } from "uuid";
import OcrImportedPurchaseOrderDraftItem from "./OcrImportedPurchaseOrderDraftItem.js";

const currentTimestamp = "2023-08-14 12:34:56.789012";
const userId = "user123";
const ocrImportedPurchaseOrderDraftId = "draft456";
const mockUUID = "mocked-uuid";

jest.mock("uuid", () => ({
    v4: jest.fn(), // Mock uuidv4 function
}));
const mockKnexInstance = {
    table: jest.fn().mockReturnThis(),
    insert: jest.fn(),
    raw: jest.fn(),
};
mockKnexInstance.raw.mockReturnValue(currentTimestamp);

describe("OcrImportedPurchaseOrderDraftItem", () => {
    describe("fromJson", () => {
        it("should create a draft item object from JSON", () => {
            const draftItemData = {
                quantity: 5,
                item_name: "Sample Item",
                price: "10.99",
                unit_of_measure: "pcs",
                description: "A sample item description",
            };

            uuidv4.mockReturnValue(mockUUID);

            const result = OcrImportedPurchaseOrderDraftItem.fromJson(
                draftItemData,
                mockKnexInstance,
                userId,
                ocrImportedPurchaseOrderDraftId
            );

            expect(result).toEqual(
                expect.objectContaining({
                    created_at: currentTimestamp,
                    ocr_imported_purchase_order_draft_item_id:
                        expect.any(String),
                    created_by: userId,
                    last_updated_at: currentTimestamp,
                    last_updated_by: userId,
                    quantity: draftItemData.quantity,
                    purchase_order_item_status_id: 1,
                    ocr_imported_purchase_order_draft_id:
                        ocrImportedPurchaseOrderDraftId,
                    item_name: draftItemData.item_name,
                    price: draftItemData.price,
                    unit_of_measure: draftItemData.unit_of_measure,
                    description: draftItemData.description,
                    ocr_imported_purchase_order_draft_item_id: mockUUID,
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
                    price: "10.99",
                    unit_of_measure: "pcs",
                    description: "A sample item description",
                },
                {
                    quantity: 6,
                    item_name: "Sample Item 2",
                    price: "4.01",
                    unit_of_measure: "lb",
                    description: "A sample item description again",
                },
            ];

            const result =
                OcrImportedPurchaseOrderDraftItem.createListOfOcrImportedPurchaseOrderDraftItems(
                    purchaseOrderDraftItemObjects,
                    mockKnexInstance,
                    userId,
                    ocrImportedPurchaseOrderDraftId
                );

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(
                expect.objectContaining({
                    ocr_imported_purchase_order_draft_item_id: mockUUID,
                    created_at: currentTimestamp,
                    created_by: userId,
                    last_updated_at: currentTimestamp,
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
                    ocr_imported_purchase_order_draft_item_id: mockUUID,
                    created_at: currentTimestamp,
                    created_by: userId,
                    last_updated_at: currentTimestamp,
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

        it("does nothing when purchase_order_items are not provided", () => {
            const purchaseOrder = {};
            const errors = {
                purchaseOrderItemErrors: [],
            };

            OcrImportedPurchaseOrderDraftItem.checkForRequiredItemAttributes(
                purchaseOrder,
                errors
            );
            expect(errors.purchaseOrderItemErrors.length).toBe(0);
        });

        it("does not add an error for valid veryfi_id", () => {
            const purchaseOrder = {
                purchase_order_items: [
                    {
                        veryfi_id: 1234,
                    },
                ],
            };
            const errors = {
                purchaseOrderItemErrors: [],
            };

            OcrImportedPurchaseOrderDraftItem.checkForRequiredItemAttributes(
                purchaseOrder,
                errors
            );
            expect(errors.purchaseOrderItemErrors.length).toBe(0);
        });
    });
});
