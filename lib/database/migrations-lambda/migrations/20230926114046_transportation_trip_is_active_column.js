export async function up(knex) {
  const columnExists = await knex.schema.hasColumn(
    "transportation_trip",
    "is_active"
  );

  if (!columnExists) {
    return knex.schema.table("transportation_trip", (table) => {
      table.boolean("is_active").defaultTo(true);
    });
  }
}

export async function down(knex) {
  const columnExists = await knex.schema.hasColumn(
    "transportation_trip",
    "is_active"
  );

  if (columnExists) {
    return knex.schema.table("transportation_trip", (table) => {
      table.dropColumn("is_active");
    });
  }
}
