export const up = async function (knex) {
  return knex.schema.alterTable("vehicle_type", (table) => {
    table.unique("vehicle_type_name");
  });
};

export const down = async function (knex) {
  return knex.schema.alterTable("vehicle_type", (table) => {
    table.dropUnique("vehicle_type_name");
  });
};
