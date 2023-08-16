import PurchaseOrder from "./PurchaseOrder.js";

describe("PurchaseOrder", () => {
    describe("fromJson", () => {
        it("should return an empty object if documentJson is undefined", () => {
            const documentJson = undefined;
            const expectedPurchaseOrder = {};

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should return an empty object if documentJson is empty", () => {
            const documentJson = {};
            const expectedPurchaseOrder = {};

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should process documentJSON with no line items", () => {
            const documentJson = {
                id: "1",
                invoice_number: "123",
                line_items: [],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "user",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: documentJson.id,
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should extract information from non-empty documentJson correctly", () => {
            const documentJson = {
                id: "1",
                invoice_number: "123",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                ],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "user",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: documentJson.id,
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                ],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should handle documentJson with empty invoice_number", () => {
            const documentJson = {
                id: "1",
                invoice_number: "",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                ],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "user",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number: "",
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: documentJson.id,
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                ],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should handle documentJson with empty img_url", () => {
            const documentJson = {
                id: "1",
                invoice_number: "2",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                ],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "user",
                },
                img_url: "",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: documentJson.id,
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                ],
                img_url: "",
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should handle documentJson with empty veryfi id", () => {
            const documentJson = {
                id: "",
                invoice_number: "123",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                ],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "user",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: "",
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                ],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should handle documentJson with missing vendor.name", () => {
            const documentJson = {
                id: "1",
                invoice_number: "123",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                ],
                vendor: {
                    name: "",
                },
                meta: {
                    owner: "user",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: "",
                veryfi_document_id: documentJson.id,
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                ],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should handle documentJson with empty meta.owner", () => {
            const documentJson = {
                id: "1",
                invoice_number: "123",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                ],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: documentJson.id,
                ocr_tool_id: "",
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                ],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });

        it("should handle documentJson with multiple line_items", () => {
            const documentJson = {
                id: "1",
                invoice_number: "123",
                line_items: [
                    {
                        id: "1",
                        quantity: "2",
                        price: "3.50",
                        description: "Test item 2",
                        unit_of_measure: "kg",
                        text: "item text",
                    },
                    {
                        id: "2",
                        quantity: "3",
                        price: "40",
                        description: "Test item 2",
                        unit_of_measure: "lb",
                        text: "item text 2",
                    },
                ],
                vendor: {
                    name: "Test Vendor",
                },
                meta: {
                    owner: "user",
                },
                img_url: "https://www.example.com/img",
            };
            const expectedPurchaseOrder = {
                ocr_suggested_purchase_order_number:
                    documentJson.invoice_number,
                ocr_suggested_vendor: documentJson.vendor.name,
                veryfi_document_id: documentJson.id,
                ocr_tool_id: documentJson.meta.owner,
                purchase_order_items: [
                    {
                        veryfi_id: documentJson.line_items[0].id,
                        quantity: documentJson.line_items[0].quantity,
                        price: documentJson.line_items[0].price,
                        unit_of_measure:
                            documentJson.line_items[0].unit_of_measure,
                        description: documentJson.line_items[0].description,
                        item_name: documentJson.line_items[0].text,
                    },
                    {
                        veryfi_id: documentJson.line_items[1].id,
                        quantity: documentJson.line_items[1].quantity,
                        price: documentJson.line_items[1].price,
                        unit_of_measure:
                            documentJson.line_items[1].unit_of_measure,
                        description: documentJson.line_items[1].description,
                        item_name: documentJson.line_items[1].text,
                    },
                ],
                img_url: documentJson.img_url,
            };

            const purchaseOrder = PurchaseOrder.fromJson(documentJson);

            expect(purchaseOrder).toEqual(expectedPurchaseOrder);
        });
    });
});
