export async function up(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    table.string("billed_from_address2").nullable().alter();
    table.string("shipped_from_address2").nullable().alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    table.string("billed_from_address2").notNullable().alter();
    table.string("shipped_from_address2").notNullable().alter();
  });
}
