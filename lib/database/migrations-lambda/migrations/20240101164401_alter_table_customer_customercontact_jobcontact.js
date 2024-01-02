export async function up(knex) {
  await knex.schema.alterTable("customer", (table) => {
    table.string("created_by");
    table.string("last_updated_by");
    table.boolean("is_active").defaultTo(true);

    table
      .foreign("created_by")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");

    table
      .foreign("last_updated_by")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
  });

  await knex("customer")
    .update({ created_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2" })
    .whereNull("created_by");
  await knex("customer")
    .update({ last_updated_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2" })
    .whereNull("last_updated_by");

  await knex.schema.alterTable("customer", function (table) {
    table.string("created_by").notNullable().alter();
    table.string("last_updated_by").notNullable().alter();
  });

  await knex.schema.alterTable("customer_contact", (table) => {
    table.string("created_by");
    table.string("last_updated_by");
    table.boolean("is_active").defaultTo(true);

    table
      .foreign("created_by")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");

    table
      .foreign("last_updated_by")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
  });

  await knex("customer_contact")
    .update({ created_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2" })
    .whereNull("created_by");
  await knex("customer_contact")
    .update({ last_updated_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2" })
    .whereNull("last_updated_by");

  await knex.schema.alterTable("customer_contact", function (table) {
    table.string("created_by").notNullable().alter();
    table.string("last_updated_by").notNullable().alter();
  });

  await knex.schema.alterTable("job_contacts", (table) => {
    table.string("created_by").notNullable();
    table.string("last_updated_by").notNullable();
    table.boolean("is_active").defaultTo(true);

    table
      .foreign("created_by")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");

    table
      .foreign("last_updated_by")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
  });

  await knex("job_contacts")
    .update({ created_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2" })
    .whereNull("created_by");
  await knex("job_contacts")
    .update({ last_updated_by: "1b3ef41c-23af-4eee-bbd7-5610b38e37f2" })
    .whereNull("last_updated_by");

  await knex.schema.alterTable("job_contacts", function (table) {
    table.string("created_by").notNullable().alter();
    table.string("last_updated_by").notNullable().alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable("customer", function (table) {
    table.dropColumn("created_by");
    table.dropColumn("last_updated_by");
    table.dropColumn("is_active");
  });

  await knex.schema.alterTable("customer_contact", function (table) {
    table.dropColumn("created_by");
    table.dropColumn("last_updated_by");
    table.dropColumn("is_active");
  });

  await knex.schema.alterTable("job_contacts", function (table) {
    table.dropColumn("created_by");
    table.dropColumn("last_updated_by");
    table.dropColumn("is_active");
  });
}
