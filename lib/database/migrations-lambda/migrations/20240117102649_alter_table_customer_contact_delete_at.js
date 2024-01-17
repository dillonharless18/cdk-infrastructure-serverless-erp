export async function up(knex) {
  await knex.schema.alterTable("customer_contact", function (table) {
    table.timestamp("deleted_at");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("customer_contact", function (table) {
    table.dropColumn(["deleted_at"]);
  });
}
