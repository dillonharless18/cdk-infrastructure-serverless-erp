// The following fields for the Purchase Order Transportation Request are not required when it is initially created
export async function up(knex) {
    await knex.schema.alterTable(
        "purchase_order_transportation_request",
        function (table) {
            table.date("future_transportation_date").nullable().alter();
            table.time("transportation_time").nullable().alter();
        }
    );
}

export async function down(knex) {
    await knex.schema.alterTable(
        "purchase_order_transportation_request",
        function (table) {
            table.date("future_transportation_date").notNullable().alter();
            table.time("transportation_time").notNullable().alter();
        }
    );
}
