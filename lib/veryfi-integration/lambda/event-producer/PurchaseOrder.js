import PurchaseOrderItem from "./PurchaseOrderItem.js";

/**
 * DTO for a Purchase Order
 */
class PurchaseOrder {
    /**
     * Creates a purchase order object from a JSON document.
     *
     * @param {string} documentJson - The JSON representation of a Veryfi document.
     * @param {string} emailDomainName - The domain name for email addresses.
     * @param {string} emailSuffix - The suffix for email addresses.
     * @returns {object} - The purchase order object with extracted information.
     */
    static fromJson(documentJson, emailDomainName, emailSuffix) {
        if (!documentJson || Object.keys(documentJson).length === 0) {
            return {};
        }

        const imageUrl =
            PurchaseOrder.#getImageUrlFromDocumentJson(documentJson);
        const suggestedPurchaseOrderNumber =
            PurchaseOrder.#getSuggestedPurchaseOrderNumber(documentJson);
        const suggestedVendor =
            PurchaseOrder.#getVendorFromDocumentJson(documentJson);
        const veryfiDocumentId =
            PurchaseOrder.#getDocumentIdFromDocumentJson(documentJson);
        const originalEmailAddress = PurchaseOrder.#getEmailFromDocumentJson(
            documentJson,
            emailDomainName,
            emailSuffix
        );
        const purchaseOrderItems =
            PurchaseOrder.#getPurchaseOrderItemFromItemJson(documentJson);

        return {
            ocr_suggested_purchase_order_number: suggestedPurchaseOrderNumber,
            ocr_suggested_vendor: suggestedVendor,
            veryfi_document_id: veryfiDocumentId,
            user_email_address: originalEmailAddress,
            purchase_order_items: purchaseOrderItems,
            img_url: imageUrl,
        };
    }

    static #getPurchaseOrderItemFromItemJson(documentJson) {
        const itemJsonList = documentJson?.line_items ?? [];
        const purchaseOrderItems = itemJsonList.map((itemJson) =>
            PurchaseOrderItem.fromJson(itemJson)
        );

        return purchaseOrderItems;
    }

    /**
     * Get the id for a VeryFi document object
     *
     * @param {*} documentJson The json for a VeryFi document object
     * @returns {string} The document id
     */
    static #getDocumentIdFromDocumentJson(documentJson) {
        const documentId = documentJson?.id;

        if (!documentId) {
            console.log("No id found in document");
            return "";
        }

        return documentId;
    }

    /**
     * Return the OCR purchase order number
     *
     * @param {Object} documentJson - The JSON for a VeryFi document object
     * @returns {string} - Purchase order number
     */
    static #getSuggestedPurchaseOrderNumber(documentJson) {
        const invoice_number = documentJson?.invoice_number;

        if (!invoice_number) {
            console.log("No invoice number found in document");

            return "";
        }

        return invoice_number;
    }

    /**
     * Extract the email from a VeryFi document object
     *
     * @param {Object} documentJson - The JSON for a VeryFi document object
     * @param {string} domainName - The domain name for an email
     * @param {string} emailSuffix - The suffix for an email
     * @returns {string} - Email address
     */
    static #getEmailFromDocumentJson(
        documentJson,
        emailDomainName,
        emailSuffix
    ) {
        const emailUsername = documentJson?.meta?.owner;

        if (!emailUsername) {
            console.log("No username found in document");
            return "";
        }

        return `${emailUsername}@${emailDomainName}.${emailSuffix}`;
    }

    /**
     * Extract the img url from a VeryFi document object
     *
     * @param {Object} documentJson - The JSON for a VeryFi document object
     * @returns {string} - img url
     */
    static #getImageUrlFromDocumentJson(documentJson) {
        const imgUrl = documentJson?.img_url;

        if (!imgUrl) {
            console.log("No imgUrl found in document");
            return "";
        }

        return imgUrl;
    }

    /**
     * Grabs the vendor name from a VeryFi document object
     *
     * @param {Object} documentJson - The JSON for a VeryFi document object
     * @returns {string} - The name of a vendor
     */
    static #getVendorFromDocumentJson(documentJson) {
        const vendorName = documentJson?.vendor?.name;

        if (!vendorName) {
            console.log("No vendor name found in document");
            return "";
        }

        return vendorName;
    }
}

export default PurchaseOrder;
