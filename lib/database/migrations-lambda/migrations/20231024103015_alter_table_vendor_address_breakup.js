export async function up(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    table.renameColumn("billed_from", "billed_from_address1");
    table.renameColumn("shipped_from", "billed_from_address2");
    table.string("billed_from_city");
    table.string("billed_from_state");
    table.integer("billed_from_postal_code");
    table.string("billed_from_country");

    table.string("shipped_from_address1");
    table.string("shipped_from_address2");
    table.string("shipped_from_city");
    table.string("shipped_from_state");
    table.integer("shipped_from_postal_code");
    table.string("shipped_from_country");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    table.renameColumn("billed_from_address1", "billed_from");
    table.renameColumn("billed_from_address2", "shipped_from");
    table.dropColumn("billed_from_city");
    table.dropColumn("billed_from_state");
    table.dropColumn("billed_from_postal_code");
    table.dropColumn("billed_from_country");

    table.dropColumn("shipped_from_address1");
    table.dropColumn("shipped_from_address2");
    table.dropColumn("shipped_from_city");
    table.dropColumn("shipped_from_state");
    table.dropColumn("shipped_from_postal_code");
    table.dropColumn("shipped_from_country");
  });
}
