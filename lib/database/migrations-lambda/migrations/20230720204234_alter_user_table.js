export async function up(knex) {
  await knex.schema.alterTable("user", function (table) {
    table.string("created_by", 36).references('user_id').inTable('user');
    table.string("last_updated_by", 36).references('user_id').inTable('user');
  });
}

export async function down(knex) {
  await knex.schema.alterTable("user", function (table) {
    table.dropForeign("created_by");
    table.dropForeign("last_updated_by");
  });
}
