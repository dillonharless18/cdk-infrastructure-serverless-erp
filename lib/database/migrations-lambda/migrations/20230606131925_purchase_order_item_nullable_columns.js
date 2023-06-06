export const up = async function(knex) {
    return knex.schema.alterTable('purchase_order_item', function(table) {
      table.boolean('is_damaged').nullable().alter();
      table.string('damage_or_return_text', 100).nullable().alter();
    });
  };
  
  export const down = async function(knex) {
    return knex.schema.alterTable('purchase_order_item', function(table) {
      table.boolean('is_damaged').notNullable().alter();
      table.string('damage_or_return_text', 100).notNullable().alter();
    });
  };
  