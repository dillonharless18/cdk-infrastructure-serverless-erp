export async function up(knex) {
    await knex.schema.alterTable(
        "purchase_order_transportation_request",
        function (table) {
            table.string("s3_uri", 255);
        }
    );
}

export async function down(knex) {
    await knex.schema.alterTable(
        "purchase_order_transportation_request",
        function (table) {
            table.dropColumn("s3_uri");
        }
    );
}
