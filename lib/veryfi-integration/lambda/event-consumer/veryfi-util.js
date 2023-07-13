class VeryfiUtil {
    /**
     * validates each purchase order and its items
     *
     * @param {*} purchaseOrder The purchase order object
     */
    static validatePurchaseOrderDraft(purchaseOrder) {
        const errors = {
            purchaseOrderErrors: [],
            purchaseOrderItemErrors: [],
        };

        try {
            this.#checkForRequiredOrderAttributes(purchaseOrder, errors);
            this.#checkForRequiredItemAttributes(purchaseOrder, errors);
        } catch (error) {
            console.error(
                "unexpected error occurred while validating purchase order",
                error
            );
        }

        if (
            errors.purchaseOrderErrors.length !== 0 ||
            errors.purchaseOrderItemErrors.length !== 0
        ) {
            console.error(
                "Errors found for purchase order:",
                JSON.stringify(errors, undefined, 2)
            );
            throw new Error("Errors found for purchase order:", errors);
        }
    }

    /**
     * Checks that a purchase order object has contains required fields
     *
     * @param {Object} purchaseOrder The purchase order dict
     * @param {List} errors The list to store all purchase order errors
     */
    static #checkForRequiredOrderAttributes(purchaseOrder, errors) {
        const { veryfi_document_id, user_email_address } = purchaseOrder;

        if (!this.#isValidNumber(veryfi_document_id)) {
            errors.purchaseOrderErrors.push(
                `Purchase Order: undefined or zero number found: ${veryfi_document_id}`
            );
        }
        if (!this.#isValidString(user_email_address)) {
            errors.purchaseOrderErrors.push(
                `Purchase Order: undefined or empty user_email_address found: ${user_email_address}`
            );
        }
    }

    /**
     * Checks that a purchase order item contains all required fields
     *
     * @param {Object} purchaseOrder The purchase order dict
     * @param {List} errors The list to store all item errors
     */
    static #checkForRequiredItemAttributes(purchaseOrder, errors) {
        for (const item of purchaseOrder.purchase_order_items) {
            const { veryfi_id } = item;

            if (!this.#isValidNumber(veryfi_id)) {
                errors.purchaseOrderItemErrors.push(
                    `purchaseOrderItem: undefined or zero number found: ${veryfi_id}`
                );
            }
        }
    }

    /**
     * Returns true if the param is a nonempty string
     *
     * @param {String} stringToValidate The string that should be nonempty
     * @returns true or false
     */
    static #isValidString(stringToValidate) {
        return (
            typeof stringToValidate === "string" &&
            stringToValidate.trim() !== ""
        );
    }

    /**
     * Returns true if the param is a non-zero number
     *
     * @param {Number} numberToValidate The number that should be non-zero
     * @returns true or false
     */
    static #isValidNumber(numberToValidate) {
        return typeof numberToValidate === "number" && numberToValidate !== 0;
    }
}

export default VeryfiUtil;
