export async function up(knex) {
    await knex.schema.alterTable("purchase_order", function (table) {
      table.float("shipping_cost").nullable();
      table.float("estimated_taxes").nullable();
    });
  }
  
  export async function down(knex) {
    await knex.schema.alterTable("purchase_order", function (table) {
      table.dropColumn("shipping_cost");
      table.dropColumn("estimated_taxes");
    });
  }
  