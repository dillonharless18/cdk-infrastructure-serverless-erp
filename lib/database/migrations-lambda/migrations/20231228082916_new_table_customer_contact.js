export async function up(knex) {
  await knex.schema.createTable("customer_contact", function (table) {
    table.increments("customer_contact_id").primary();
    table.uuid("uuid").defaultTo(knex.raw("uuid_generate_v4()"));
    table.integer("customer_id").notNullable();

    table
      .foreign("customer_id")
      .references("customer_id")
      .inTable("customer")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.string("first_name").notNullable();
    table.string("middle_initial").nullable();
    table.string("last_name").notNullable();
    table.string("address_1").nullable();
    table.string("address_2").nullable();
    table.string("state").nullable();
    table.string("city").nullable();
    table.string("postal_code").nullable();
    table.string("country").nullable();
    table.string("notes").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex) {
  await await knex.schema.dropTableIfExists("customer_contact");
}
