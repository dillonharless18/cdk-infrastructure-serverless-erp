export async function up(knex) {
  await knex.schema.alterTable("user", function (table) {
    table.string("created_by", 36)
    table.string("last_updated_by", 36)
    table.foreign("created_by", "fk_created_by").references("user_id").inTable("user");
    table.foreign("last_updated_by", "fk_last_updated_by").references("user_id").inTable("user");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("user", function (table) {
    table.dropForeign("fk_created_by");
    table.dropForeign("fk_last_updated_by");
    table.dropColumn("created_by");
    table.dropColumn("last_updated_by");
  });
}
