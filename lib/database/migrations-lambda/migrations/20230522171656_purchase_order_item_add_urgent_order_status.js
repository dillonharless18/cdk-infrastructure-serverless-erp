export async function up(knex) {
  await knex.schema.alterTable('purchase_order_item', (table) => {
    table.integer('urgent_order_status_id');
  });

  // Update existing records with default value
  await knex('purchase_order_item').update({
    urgent_order_status_id: 2, // Update with default value 2, it will set urgent_order_status = Today
  });

  return knex.schema.alterTable('purchase_order_item', (table) => {
    table.integer('urgent_order_status_id').notNullable().alter().references('urgent_order_status_id').inTable('urgent_order_status');
  });
}

export async function down(knex) {
  return knex.schema.alterTable('purchase_order_item', (table) => {
    table.dropColumn('urgent_order_status_id');
  });
}
