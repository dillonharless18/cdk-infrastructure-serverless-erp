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

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  await knex.raw(
    "CREATE OR REPLACE FUNCTION trigger_set_updated_at() RETURNS trigger AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;"
  );
  await knex.raw(
    "CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON customer FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();"
  );
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("customer");
}
