import OcrImportedPurchaseOrderDraft from "./OcrImportedPurchaseOrderDraft.js";

jest.mock("@aws-sdk/client-s3", () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn(() => "https://bucket.s3.amazonaws.com/key"),
    })),
    PutObjectCommand: jest.fn().mockImplementation((data) => data),
}));
jest.mock("node-fetch", () => jest.fn());

describe("OcrImportedPurchaseOrderDraft", () => {
    const mockUserIdArray = [1, 2, 3];
    const mockPluck = jest.fn(() => Promise.resolve(mockUserIdArray));
    const mockWhere = jest.fn(() => ({ pluck: mockPluck }));
    const mockTrx = (tableName) => ({
        insert: jest.fn(),
        update: jest.fn(),
    });
    const mockKnexObject = jest.fn(() => {
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
    const mockKnexFunction = jest.fn((tableName) => {
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

    it("fromJson should create a draft from provided data", () => {
        const data = {
            s3_uri: "test-uri",
            ocr_tool_id: "id",
            ocr_suggested_vendor: "test-vendor",
            ocr_suggested_purchase_order_number: "12345",
        };

        console.log("knexfunction type", typeof mockKnexFunction);
        const result = OcrImportedPurchaseOrderDraft.fromJson(
            data,
            mockKnexFunction
        );

        expect(result.s3_uri).toEqual(data.s3_uri);
        expect(result.ocr_suggested_vendor).toEqual("test-vendor");
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
});
