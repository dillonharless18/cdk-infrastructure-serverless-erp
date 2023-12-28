export async function up(knex) {
  await knex.schema.createTable("customer", function (table) {
    table.increments("customer_id").primary();
    table.uuid("uuid").defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("customer_name").notNullable().unique();

    table.string("address_1").nullable();
    table.string("address_2").nullable();
    table.string("state").nullable();
    table.string("city").nullable();
    table.string("postal_code").nullable();
    table.string("country").nullable();

    table.string("notes").nullable();
    table.string("phone").nullable();
    table.string("email").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("customer");
}
