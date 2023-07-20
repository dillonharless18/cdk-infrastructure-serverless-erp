/**
 * DTO for a Purchase Order Item
 */
class PurchaseOrderItem {
    /**
     * Creates a purchase order item object from a JSON item.
     *
     * @param {string} itemJson - The JSON representation of the item.
     * @returns {object} - The purchase order item object with extracted information.
     */
    static fromJson(itemJson) {
        const veryfiId = PurchaseOrderItem.#getIdFromitemJson(itemJson);
        const quantity = PurchaseOrderItem.#getQuantityFromitemJson(itemJson);
        const price = PurchaseOrderItem.#getPriceFromitemJson(itemJson);
        const description =
            PurchaseOrderItem.#getDescriptionFromitemJson(itemJson);
        const unitOfMeasure =
            PurchaseOrderItem.#getUnitOfMeasureFromitemJson(itemJson);
        const itemName = PurchaseOrderItem.#getItemNameFromitemJson(itemJson);

        return {
            veryfi_id: veryfiId,
            quantity: quantity,
            price: price,
            unit_of_measure: unitOfMeasure,
            description: description,
            item_name: itemName,
        };
    }

    /**
     * Return the id for a VeryFi document object's line item
     *
     * @param {Object} itemJson - The JSON for a VeryFi document line item
     * @returns {string} - The line item's id
     */
    static #getIdFromitemJson(itemJson) {
        const lineItemId = itemJson?.id;

        if (!lineItemId) {
            console.log("No id found in line item");
            return "";
        }

        return lineItemId;
    }

    /**
     * Return the quantity for a VeryFi document object's line item
     *
     * @param {Object} itemJson - The JSON for a VeryFi line item
     * @returns {string} - The line item's quantity
     */
    static #getQuantityFromitemJson(itemJson) {
        const lineItemQuantity = itemJson?.quantity;

        if (!lineItemQuantity) {
            console.log("No quantity found in line item object");
            return "";
        }

        return lineItemQuantity;
    }

    /**
     * Return the price for a VeryFi document object's line item
     *
     * @param {Object} itemJson - The JSON for a VeryFi line item
     * @returns {string} - The line item's price
     */
    static #getPriceFromitemJson(itemJson) {
        const lineItemPrice = itemJson?.price;

        if (!lineItemPrice) {
            console.log("No line item price found for line item object");
            return "";
        }

        return lineItemPrice;
    }

    /**
     * Return the description for a VeryFi document object's line item
     *
     * @param {Object} itemJson - The JSON for a VeryFi line item
     * @returns {string} - The line item's description
     */
    static #getDescriptionFromitemJson(itemJson) {
        const unformattedDescription = itemJson?.description;

        if (!unformattedDescription) {
            console.log("No description found for line item");
            return "";
        }
        const descriptionWithoutEscapedNewLineChars =
            unformattedDescription.replace(/\n/g, " ");

        return descriptionWithoutEscapedNewLineChars;
    }

    /**
     * Return the unit of measure for a VeryFi document object's line item
     *
     * @param {Object} itemJson - The JSON for a VeryFi line item
     * @returns {string} - The line item's unit of measure
     */
    static #getUnitOfMeasureFromitemJson(itemJson) {
        const unitOfMeasure = itemJson?.unit_of_measure;

        if (!unitOfMeasure) {
            console.log("No unit of measure found for line item");
            return "";
        }

        return unitOfMeasure;
    }

    /**
     * Return the item name for a VeryFi document object's line item
     *
     * @param {Object} itemJson - The JSON for a VeryFi line item
     * @returns {string} - The line item's name
     */
    static #getItemNameFromitemJson(itemJson) {
        const itemName = itemJson?.text;

        if (!itemName) {
            console.log("No item name found for line item");
            return "";
        }

        return itemName;
    }
}

export default PurchaseOrderItem;
