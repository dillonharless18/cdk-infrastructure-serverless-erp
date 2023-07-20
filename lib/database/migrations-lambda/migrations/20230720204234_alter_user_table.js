export async function up(knex) {
  await knex.schema.alterTable("user", function (table) {
    table.string("created_by", 36).references('user_id').inTable('user');
    table.date("created_at");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("user", function (table) {
    table.dropColumn("created_by");
    table.dropColumn("created_at");
  });
}
