import PurchaseOrderItem from "../../event-producer/PurchaseOrderItem.js";

describe("PurchaseOrderItem", () => {
    describe("fromJson", () => {
        it("should return a valid object when all parameters are present", () => {
            const itemJson = {
                id: "1",
                quantity: "2",
                price: "3.50",
                description: "Test item",
                unit_of_measure: "kg",
                text: "item text",
            };
            const expectedLineItem = {
                veryfi_id: itemJson.id,
                quantity: itemJson.quantity,
                price: itemJson.price,
                description: itemJson.description,
                unit_of_measure: itemJson.unit_of_measure,
                item_name: itemJson.text,
            };

            const lineItem = PurchaseOrderItem.fromJson(itemJson);

            expect(lineItem).toEqual(expectedLineItem);
        });

        it("should return a valid object when id is empty", () => {
            const itemJson = {
                id: "",
                quantity: "2",
                price: "3.50",
                description: "Test item",
                unit_of_measure: "kg",
                text: "item text",
            };
            const expectedLineItem = {
                veryfi_id: "",
                quantity: itemJson.quantity,
                price: itemJson.price,
                description: itemJson.description,
                unit_of_measure: itemJson.unit_of_measure,
                item_name: itemJson.text,
            };

            const lineItem = PurchaseOrderItem.fromJson(itemJson);

            expect(lineItem).toEqual(expectedLineItem);
        });

        it("should return a valid object when quantity is empty", () => {
            const itemJson = {
                id: "1",
                quantity: "",
                price: "3.50",
                description: "Test item",
                unit_of_measure: "kg",
                text: "item text",
            };
            const expectedLineItem = {
                veryfi_id: itemJson.id,
                quantity: "",
                price: itemJson.price,
                description: itemJson.description,
                unit_of_measure: itemJson.unit_of_measure,
                item_name: itemJson.text,
            };

            const lineItem = PurchaseOrderItem.fromJson(itemJson);

            expect(lineItem).toEqual(expectedLineItem);
        });

        it("should return a valid object when price is empty", () => {
            const itemJson = {
                id: "1",
                quantity: "2",
                price: "",
                description: "Test item",
                unit_of_measure: "kg",
                text: "item text",
            };
            const expectedLineItem = {
                veryfi_id: itemJson.id,
                quantity: itemJson.quantity,
                price: "",
                description: itemJson.description,
                unit_of_measure: itemJson.unit_of_measure,
                item_name: itemJson.text,
            };

            const lineItem = PurchaseOrderItem.fromJson(itemJson);

            expect(lineItem).toEqual(expectedLineItem);
        });

        it("should return a valid object when description is empty", () => {
            const itemJson = {
                id: "1",
                quantity: "2",
                price: "3.50",
                description: "",
                unit_of_measure: "kg",
                text: "item text",
            };
            const expectedLineItem = {
                veryfi_id: itemJson.id,
                quantity: itemJson.quantity,
                price: itemJson.price,
                description: "",
                unit_of_measure: itemJson.unit_of_measure,
                item_name: itemJson.text,
            };

            const lineItem = PurchaseOrderItem.fromJson(itemJson);

            expect(lineItem).toEqual(expectedLineItem);
        });

        it("should return a valid object when unit of measure is empty", () => {
            const itemJson = {
                id: "1",
                quantity: "2",
                price: "3.50",
                description: "Test item",
                unit_of_measure: "",
                text: "item text",
            };
            const expectedLineItem = {
                veryfi_id: itemJson.id,
                quantity: itemJson.quantity,
                price: itemJson.price,
                description: itemJson.description,
                unit_of_measure: "",
                item_name: itemJson.text,
            };

            const lineItem = PurchaseOrderItem.fromJson(itemJson);

            expect(lineItem).toEqual(expectedLineItem);
        });
    });

    it("should return a valid object when item name is empty", () => {
        const itemJson = {
            id: "1",
            quantity: "2",
            price: "3.50",
            description: "Test item",
            unit_of_measure: "kg",
            text: "",
        };
        const expectedLineItem = {
            veryfi_id: itemJson.id,
            quantity: itemJson.quantity,
            price: itemJson.price,
            description: itemJson.description,
            unit_of_measure: itemJson.unit_of_measure,
            item_name: "",
        };

        const lineItem = PurchaseOrderItem.fromJson(itemJson);

        expect(lineItem).toEqual(expectedLineItem);
    });
});
