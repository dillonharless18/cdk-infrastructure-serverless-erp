export async function up(knex) {
    await knex.schema.alterTable("purchase_order_request_item", function (table) {
      table.dateTime("in_hand_date").nullable();
    });
  }
  
  export async function down(knex) {
    await knex.schema.alterTable("purchase_order_request_item", function (table) {
      table.dropColumn("in_hand_date");
    });
  }
  