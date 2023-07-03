export const up = async function (knex) {
  return knex.schema.table("transportation_trip", function (table) {
    table.string("additional_details", 255);
  });
};

export const down = async function (knex) {
  return knex.schema.table("transportation_trip", function (table) {
    table.dropColumn("additional_details");
  });
};
