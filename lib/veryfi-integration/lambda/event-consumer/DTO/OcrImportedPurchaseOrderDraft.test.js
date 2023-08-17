import OcrImportedPurchaseOrderDraft from "./OcrImportedPurchaseOrderDraft.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import nodeFetch from "node-fetch";

jest.mock("node-fetch", () => jest.fn());
let mockKnexObject;
let mockKnexFunction;
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
        // Mocking the Date object to return a specific date
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

    it("validatePurchaseOrderDraft should validate a purchase order", () => {
        const mockOrder = {
            veryfi_document_id: 1,
            ocr_tool_id: "test-tool",
            purchase_order_imtes: [{ veryfi_id: 1 }],
        };

        const mockErrors = {
            purchaseOrderErrors: [],
            purchaseOrderItemErrors: [],
        };

        OcrImportedPurchaseOrderDraft.validatePurchaseOrderDraft(mockOrder);

        expect(mockErrors.purchaseOrderErrors.length).toEqual(0);
        expect(mockErrors.purchaseOrderItemErrors.length).toEqual(0);
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
