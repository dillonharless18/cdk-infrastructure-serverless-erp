// This field is missing and needed to seed the database
export async function up(knex) {
  await knex.schema.table("transportation_request_type", function (table) {
    table.string("transportation_request_type_name", 30).notNullable();
  });
}

export async function down(knex) {
  await knex.schema.table("transportation_request_type", function (table) {
    table.dropColumn("transportation_request_type_name");
  });
}
