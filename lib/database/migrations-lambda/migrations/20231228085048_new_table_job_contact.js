export async function up(knex) {
  await knex.schema.createTable("job_contacts", (table) => {
    table.integer("project_id").notNullable();
    table.integer("customer_contact_id").notNullable();
    table.primary(["project_id", "customer_contact_id"], "job_contact_id");
    table
      .foreign("project_id")
      .references("project_id")
      .inTable("project")
      .onDelete("CASCADE");
    table
      .foreign("customer_contact_id")
      .references("customer_contact_id")
      .inTable("customer_contact")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  await knex.raw(
    "CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON job_contacts FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();"
  );
}

export async function down(knex) {
  await knex.schema.dropTable("job_contacts");
}
