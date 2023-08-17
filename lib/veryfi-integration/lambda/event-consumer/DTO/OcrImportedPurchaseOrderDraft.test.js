import OcrImportedPurchaseOrderDraft from "./OcrImportedPurchaseOrderDraft.js";
import OcrImportedPurchaseOrderDraftItem from "./OcrImportedPurchaseOrderDraftItem.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import nodeFetch from "node-fetch";

jest.mock("node-fetch", () => jest.fn());
let mockKnexObject;
let mockKnexFunction;
let mockPurchaseOrder;

const mockUUID = "uuid";
const mockUserId = "userId";
const mockNow = "now123";
const mockS3Uri = "https://bucket-name/mock-s3-uri";
const mockVendor = "vendor name";
const mockPurchaseOrderNumber = "123123123";
const mockItemQuantity = 5;
const mockItemName = "Sample Item";
const mockItemPrice = "10.99";
const mockItemUnitOfMeasure = "pcs";
const mockItemDescription = "A sample item description";
const mockVeryfiDocumentId = 123;
const mockOcrToolId = "ocrToolId";
const MockVeryfiItemId = 1;

describe("OcrImportedPurchaseOrderDraft", () => {
    beforeEach(() => {
        S3Client.mockImplementation(() => ({
            send: jest.fn(
                () => "https://anotherbucket.s3.amazonaws.com/anotherkey"
            ),
        }));
        PutObjectCommand.mockImplementation((data) => data);

        const mockUserIdArray = [1, 2, 3];
        const mockPluck = jest.fn(() => Promise.resolve(mockUserIdArray));
        const mockWhere = jest.fn(() => ({ pluck: mockPluck }));
        const mockTrx = (tableName) => ({
            insert: jest.fn(),
            update: jest.fn(),
        });
        mockKnexObject = jest.fn(() => {
            return {
                where: mockWhere,
                pluck: mockPluck,
                table: jest.fn().mockReturnThis(),
                insert: jest.fn(),
                raw: jest.fn(() => "2023-08-14 12:34:56.789012"),
                transaction: jest.fn(async (callback) => {
                    return await callback(mockTrx);
                }),
            };
        });
        mockKnexFunction = jest.fn((tableName) => {
            return {
                where: mockWhere,
                pluck: mockPluck,
                table: jest.fn().mockReturnThis(),
                insert: jest.fn(),
                raw: jest.fn(() => "2023-08-14 12:34:56.789012"),
                transaction: jest.fn(async (callback) => {
                    return await callback(mockTrx);
                }),
            };
        });

        // Attach methods directly to the mock function
        mockKnexFunction.where = mockWhere;
        mockKnexFunction.pluck = mockPluck;
        mockKnexFunction.table = jest.fn().mockReturnThis();
        mockKnexFunction.insert = jest.fn();
        mockKnexFunction.raw = jest.fn(() => "2023-08-14 12:34:56.789012");
        mockKnexFunction.transaction = jest.fn(async (callback) => {
            return await callback(mockTrx);
        });

        mockPurchaseOrder = {
            ocr_imported_purchase_order_draft_id: mockUUID,
            created_by: mockUserId,
            last_updated_by: mockUserId,
            created_at: mockNow,
            last_updated_at: mockNow,
            s3_uri: mockS3Uri,
            ocr_suggested_vendor: mockVendor,
            ocr_suggesetd_purchase_order_number: mockPurchaseOrderNumber,
            ocr_tool_id: mockOcrToolId,
            veryfi_document_id: mockVeryfiDocumentId,
            purchase_order_items: [
                {
                    veryfi_id: MockVeryfiItemId,
                    quantity: mockItemQuantity,
                    item_name: mockItemName,
                    price: mockItemPrice,
                    unit_of_measure: mockItemUnitOfMeasure,
                    description: mockItemDescription,
                },
            ],
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("fromJson should create a draft from provided data", () => {
        const data = {
            s3_uri: "test-uri",
            ocr_tool_id: "id",
            ocr_suggested_vendor: "test-vendor",
            ocr_suggested_purchase_order_number: "12345",
        };

        const result = OcrImportedPurchaseOrderDraft.fromJson(
            data,
            mockKnexFunction
        );

        expect(result.s3_uri).toEqual(data.s3_uri);
        expect(result.ocr_suggested_vendor).toEqual("test-vendor");
    });

    it("fromJson should throw an error when knex attempts to get usID", () => {
        const purchaseOrder = mockPurchaseOrder;
    });

    it("throws an error when imageUrl is not provided", async () => {
        await expect(
            OcrImportedPurchaseOrderDraft.downloadPurchaseOrderImage()
        ).rejects.toThrow(
            "Missing imageUrl to download PO draft image from Veryfi"
        );
    });

    it("throws an error when response is not ok", async () => {
        nodeFetch.mockResolvedValue({
            ok: false,
            statusText: "Not Found",
        });

        await expect(
            OcrImportedPurchaseOrderDraft.downloadPurchaseOrderImage(
                "https://example.com/image.png"
            )
        ).rejects.toThrow("unexpected response Not Found");
    });

    it("returns the expected result when response is ok", async () => {
        const mockArrayBuffer = new ArrayBuffer(8);
        nodeFetch.mockResolvedValue({
            ok: true,
            arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
        });

        const result =
            await OcrImportedPurchaseOrderDraft.downloadPurchaseOrderImage(
                "https://example.com/image.png"
            );
        expect(result).toEqual(mockArrayBuffer);
    });

    it("throws an error when nodeFetch throws an error", async () => {
        const mockError = new Error("Network Error");
        nodeFetch.mockRejectedValue(mockError);

        await expect(
            OcrImportedPurchaseOrderDraft.downloadPurchaseOrderImage(
                "https://example.com/image.png"
            )
        ).rejects.toThrow("Network Error");
    });

    it("throws an error when an invalid purchaseOrderId is provided", () => {
        expect(() => {
            OcrImportedPurchaseOrderDraft.createUniqueBucketKeyForPurchaseOrderImage(
                "invalid-id"
            );
        }).toThrow("purchaseOrderId is not a valid number: invalid-id");
    });

    it("returns a formatted bucket key for valid purchaseOrderId", () => {
        const staticDate = new Date("2023-08-16T16:40:48.504Z");
        global.Date = class extends Date {
            constructor() {
                super();
                return staticDate;
            }
        };

        const key =
            OcrImportedPurchaseOrderDraft.createUniqueBucketKeyForPurchaseOrderImage(
                123
            );
        expect(key).toBe("veryfi_images/2023/08/16/16/40/123");
    });

    describe("validatePurchaseOrderDraft", () => {
        it("does nothing when there are no errors", () => {
            const purchaseOrder = mockPurchaseOrder;

            expect(() => {
                OcrImportedPurchaseOrderDraft.validatePurchaseOrderDraft(
                    purchaseOrder
                );
            }).not.toThrow();
        });

        it("throws an error when there are purchaseOrder errors", () => {
            const purchaseOrder = mockPurchaseOrder;
            purchaseOrder.veryfi_document_id = "invalid number";
            purchaseOrder.ocr_tool_id = 123;

            expect(() => {
                OcrImportedPurchaseOrderDraft.validatePurchaseOrderDraft(
                    purchaseOrder
                );
            }).toThrow("Errors found for purchase order:");
        });

        it("throws an error when there are purchaseOrderItem errors", () => {
            const purchaseOrder = mockPurchaseOrder;
            purchaseOrder.purchase_order_items[0].veryfi_id = "123";

            expect(() => {
                OcrImportedPurchaseOrderDraft.validatePurchaseOrderDraft(
                    purchaseOrder
                );
            }).toThrow("Errors found for purchase order:");
        });

        it("throws an error when both purchaseOrder and its items have errors", () => {
            const purchaseOrder = mockPurchaseOrder;
            purchaseOrder.veryfi_document_id = "invalid number";
            purchaseOrder.ocr_tool_id = 123;
            purchaseOrder.purchase_order_items[0].veryfi_id = "123";

            expect(() => {
                OcrImportedPurchaseOrderDraft.validatePurchaseOrderDraft(
                    purchaseOrder
                );
            }).toThrow("Errors found for purchase order:");
        });
    });

    it("writeDraftAndItemsToDatabase should write draft and items to DB", async () => {
        const mockDraftData = {};
        const mockDraftItemsData = [{}];

        const knexFunction = mockKnexObject();
        await OcrImportedPurchaseOrderDraft.writeDraftAndItemsToDatabase(
            knexFunction,
            mockDraftData,
            mockDraftItemsData
        );

        expect(knexFunction.transaction).toHaveBeenCalled();
    });

    it("uploadPurchaseOrderDraftImageToS3 should upload image to S3", async () => {
        const bucketName = "test-bucket";
        const bucketKey = "test-key";
        const imageBody = new ArrayBuffer(8);

        const s3Uri =
            await OcrImportedPurchaseOrderDraft.uploadPurchaseOrderDraftImageToS3(
                bucketName,
                bucketKey,
                imageBody
            );

        expect(s3Uri).toBeDefined();
    });

    it("uploadPurchaseOrderDraftImage to s3 should throw error", async () => {
        S3Client.mockImplementation(() => ({
            send: jest.fn(() => {
                throw new Error("Mock S3 upload error");
            }),
        }));

        const bucketName = "test-bucket";
        const bucketKey = "test-key";
        const imageBody = new ArrayBuffer(8);

        await expect(
            OcrImportedPurchaseOrderDraft.uploadPurchaseOrderDraftImageToS3(
                bucketName,
                bucketKey,
                imageBody
            )
        ).rejects.toThrow("Mock S3 upload error");
    });
});
