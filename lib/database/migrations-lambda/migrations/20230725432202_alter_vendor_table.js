export async function up(knex) {
  await knex.schema.alterTable("vendor", function (table) {
    // Adding columns without NOT NULL constraint initially
    table.string("billing_contact", 45);
    table.string("billing_contact_number", 45);
    table.string("account_payable_contact", 45);
    table.string("account_payable_contact_number", 45);
    table.string("tax_ID", 45);
    table.string("billed_from", 100);
    table.string("shipped_from", 100);
    table.string("payment_terms", 20);
    table.string("email", 45);
    table.string("phone_number", 20);
  });
  // Update the NULL values to desired values for NOT NULL columns
  await knex("vendor").whereNull("tax_ID").update({ tax_ID: 'desired_value_for_tax_ID' });
  await knex("vendor").whereNull("billed_from").update({ billed_from: 'desired_value_for_billed_from' });
  await knex("vendor").whereNull("shipped_from").update({ shipped_from: 'desired_value_for_shipped_from' });
  await knex("vendor").whereNull("payment_terms").update({ payment_terms: 'desired_value_for_payment_terms' });
  await knex("vendor").whereNull("email").update({ email: 'desired_value_for_email' });
  await knex("vendor").whereNull("phone_number").update({ phone_number: 'desired_value_for_phone_number' });
  // Alter columns to set NOT NULL constraint
  await knex.schema.alterTable("vendor", function (table) {
    table.string("tax_ID", 45).notNullable().alter();
    table.string("billed_from", 100).notNullable().alter();
    table.string("shipped_from", 100).notNullable().alter();
    table.string("payment_terms", 20).notNullable().alter();
    table.string("email", 45).notNullable().alter();
    table.string("phone_number", 20).notNullable().alter();
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
    table.dropColumn("phone_number");
  });
}