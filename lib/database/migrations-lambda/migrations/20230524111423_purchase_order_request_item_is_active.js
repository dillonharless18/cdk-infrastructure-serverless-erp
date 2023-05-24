export const up = async function(knex) {
    await knex.schema.alterTable('purchase_order_request_item', function(table) {
      table.boolean('is_active').defaultTo(true).notNullable().after('urgent_order_status_id');
    });
    await knex('purchase_order_request_item').update({is_active: true});
  };
  
  export const down = async function(knex) {
    await knex.schema.alterTable('purchase_order_request_item', function(table) {
      table.dropColumn('is_active');
    });
  };
  