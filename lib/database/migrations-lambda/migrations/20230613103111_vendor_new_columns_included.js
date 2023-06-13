export const up = async function (knex) {
  return knex.schema
    .table("vendor", function (table) {
      // add new nullable columns
      table.string("billing_contact_name");
      table.string("billing_contact_number");
      table.string("accounts_payable_contact_name");
      table.string("account_payable_contact_number");
      table.string("tax_id");
      table.string("phone_number");
      table.string("email");
      table.string("billed_from");
      table.string("shipped_from");

      // rename column vendor_name to company_name
      table.renameColumn("vendor_name", "company_name");
    })
    .raw(
      `CREATE TYPE payment_terms_enum AS ENUM('Check', 'Credit Card', 'Net 30');`
    )
    .table("vendor", (table) => {
      table
        .specificType("payment_terms", "payment_terms_enum")
        .defaultTo("Net 30");
    })
    .then(() => {
      // update old records with specific values
      return knex("vendor").update({
        tax_id: "11221122",
        phone_number: "03001234567",
        email: "default@cloudfruit.com",
        billed_from: "default text",
        payment_terms: "Net 30",
      });
    })
    .then(() => {
      // alter the columns to be NOT NULL
      return knex.schema.table("vendor", function (table) {
        table.string("tax_id").notNullable().alter();
        table.string("phone_number").notNullable().alter();
        table.string("email").notNullable().alter();
        table.string("billed_from").notNullable().alter();
        table
          .specificType("payment_terms", "payment_terms_enum")
          .notNullable()
          .alter();
      });
    });
};

export const down = async function (knex) {
  return knex.schema
    .table("vendor", function (table) {
      // drop added columns
      table.dropColumn("billing_contact_name");
      table.dropColumn("billing_contact_number");
      table.dropColumn("accounts_payable_contact_name");
      table.dropColumn("account_payable_contact_number");
      table.dropColumn("payment_terms");
      table.dropColumn("tax_id");
      table.dropColumn("phone_number");
      table.dropColumn("email");
      table.dropColumn("billed_from");
      table.dropColumn("shipped_from");

      // rename column company_name back to vendor_name
      table.renameColumn("company_name", "vendor_name");
    })
    .raw("DROP TYPE payment_terms_enum;");
};
