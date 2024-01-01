export async function up(knex) {
  // 1. Add a nullable column first
  await knex.schema.alterTable("project", function (table) {
    table.integer("customer_id").nullable();
  });

  // 2. Update existing records
  await knex("project").update({ customer_id: 1 }).whereNull("customer_id");

  // 3. Modify the column to be non-nullable
  await knex.schema.alterTable("project", function (table) {
    table.integer("customer_id").notNullable().defaultTo(1).alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable("project", function (table) {
    table.dropColumn("customer_id");
  });
}
