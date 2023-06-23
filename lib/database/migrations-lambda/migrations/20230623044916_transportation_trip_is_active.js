export const up = async function (knex) {
  return knex.schema
    .alterTable("transportation_trip", function (table) {
      // Add new column with default value true
      table.string("additional_details").nullable();
      table.boolean("is_active").defaultTo(true);
    })
    .then(function () {
      // Update existing records to set is_active as true
      return knex("transportation_trip").update("is_active", true);
    });

  table.string("additional_details").nullable();
};

export const down = async function (knex) {
  return knex.schema.alterTable("transportation_trip", function (table) {
    // Remove the column if rollback is necessary
    table.dropColumn("is_active");
    table.dropColumn("additional_details");
  });
};
