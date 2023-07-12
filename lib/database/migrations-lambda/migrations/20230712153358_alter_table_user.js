export const up = async function (knex) {
    return knex.schema.table("user", function (table) {
      table.string("cognito_sub", 255);
    });
  };
  
  export const down = async function (knex) {
    return knex.schema.table("user", function (table) {
      table.dropColumn("cognito_sub");
    });
  };