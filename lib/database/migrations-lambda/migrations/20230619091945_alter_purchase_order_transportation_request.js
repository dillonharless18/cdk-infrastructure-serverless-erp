export const up = async function (knex) {
  return knex.schema.alterTable(
    "purchase_order_transportation_request",
    function (table) {
      // Make 'purchase_order_id' nullable
      table.string("purchase_order_id", 36).nullable().alter();

      // Add new columns
      table.string("item_name");
      table.string("recipients").nullable();
      table.string("contact_number").nullable();
      table.string("contact_name").nullable();
      table
        .integer("project_id")
        .references("project_id")
        .inTable("project")
        .onDelete("SET NULL");
    }
  );
};

export const down = async function (knex) {
  return knex.schema.alterTable(
    "purchase_order_transportation_request",
    function (table) {
      // Make 'purchase_order_id' not nullable again
      table.string("purchase_order_id", 36).notNullable().alter();

      // Drop added columns
      table.dropColumn("item_name");
      table.dropColumn("recipients");
      table.dropColumn("contact_number");
      table.dropColumn("contact_name");
      table.dropColumn("project_id");
    }
  );
};
