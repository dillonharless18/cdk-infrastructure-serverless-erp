// Add is_active to purchase_order_status
export async function up(knex) {
  await knex.schema.table("purchase_order_status", function (table) {
    table.boolean("is_active").notNullable().defaultTo(true);
  });
}

export async function down(knex) {
  await knex.schema.table("purchase_order_status", function (table) {
    table.dropColumn("is_active");
  });
}
