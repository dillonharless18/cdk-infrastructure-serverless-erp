export const up = async function (knex) {
    return knex.schema.table(
        "ocr_imported_purchase_order_draft_item",
        function (table) {
            // make project_id nullable
            table.integer("project_id").nullable().alter();
        }
    );
};

export const down = async function (knex) {
    return knex.schema.table(
        "ocr_imported_purchase_order_draft_item",
        function (table) {
            // Make project_id nonNullable
            table.integer("project_id").notNullable().alter();
        }
    );
};
