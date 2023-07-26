export async function up(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    table.string("billing_contact", 45);
    table.string("billing_contact_number", 45);
    table.string("account_payable_contact", 45);
    table.string("account_payable_contact_number", 45);
    table.string("tax_ID", 45).notNullable();
    table.string("billed_from", 100).notNullable();
    table.string("shipped_from", 100).notNullable();
    table.string("payment_terms", 20).notNullable();
    table.string("email", 45).notNullable();
    table.string("phone_number", 20).notNullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    table.dropColumn("billing_contact");
    table.dropColumn("billing_contact_number");
    table.dropColumn("account_payable_contact");
    table.dropColumn("account_payable_contact_number");
    table.dropColumn("tax_ID");
    table.dropColumn("billed_from");
    table.dropColumn("shipped_from");
    table.dropColumn("payment_terms");
    table.dropColumn("email");
    table.dropColumn("phone_number")
  });
}
