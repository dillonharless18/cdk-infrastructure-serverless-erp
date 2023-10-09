export const up = async function (knex) {
  return knex.schema.table("vendor", function (table) {
    table.string("tax_ID").nullable().alter();
  });
};

export const down = async function (knex) {
  return knex.schema.table("vendor", function (table) {
    table.string("tax_ID").notNullable().alter();
  });
};
