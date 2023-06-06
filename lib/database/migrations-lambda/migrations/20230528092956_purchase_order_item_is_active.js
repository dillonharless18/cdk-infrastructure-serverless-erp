export const up = async function(knex) {
    return knex.schema.alterTable('purchase_order_item', function(table) {
      // Add new column with default value true
      table.boolean('is_active').defaultTo(true);
    }).then(function() {
      // Update existing records to set is_active as true
      return knex('purchase_order_item').update('is_active', true);
    });
  };
  
  export const down = async function(knex) {
    return knex.schema.alterTable('purchase_order_item', function(table) {
      // Remove the column if rollback is necessary
      table.dropColumn('is_active');
    });
  };