export const up = async function (knex) {
  return knex.schema
    .alterTable("transportation_trip", function (table) {
      // Add new column with default value true
      table.string("additional_details").nullable();
    });

  table.string("additional_details").nullable();
};

export const down = async function (knex) {
  return knex.schema.alterTable("transportation_trip", function (table) {
    // Remove the column if rollback is necessary

    table.dropColumn("additional_details");
  });
};
