export async function up(knex) {
  return knex.schema.createTable("job_contacts", (table) => {
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
  });
}

export async function down(knex) {
  return knex.schema.dropTable("job_contacts");
}
