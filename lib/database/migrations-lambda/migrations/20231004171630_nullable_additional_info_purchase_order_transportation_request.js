export const up = async function (knex) {
  return knex.schema.table(
    "purchase_order_transportation_request",
    function (table) {
      // make additional_details nullable
      table.string("additional_details").nullable().alter();
    }
  );
};

export const down = async function (knex) {
  return knex.schema.table(
    "purchase_order_transportation_request",
    function (table) {
      // Make additional_details nonNullable
      table.string("additional_details").notNullable().alter();
    }
  );
};
