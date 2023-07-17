export const up = async function (knex) {
    return knex.schema.table(
        "ocr_imported_purchase_order_draft",
        function (table) {
            // Make vendor_id and credit_card_id nullable
            table.integer("vendor_id").nullable().alter();
            table.integer("credit_card_id").nullable().alter();
        }
    );
};

export const down = async function (knex) {
    return knex.schema.table(
        "ocr_imported_purchase_order_draft",
        function (table) {
            // Make vendor_id and credit_card_id notNullable
            table.integer("vendor_id").notNullable().alter();
            table.integer("credit_card_id").notNullable().alter();
        }
    );
};
