export async function up(knex) {
  await knex.schema.alterTable("customer", function (table) {
    table.dropUnique(["customer_name"]);
  });
}

export async function down(knex) {
  await knex.schema.alterTable("customer", function (table) {
    table.unique(["customer_name"]);
  });
}
