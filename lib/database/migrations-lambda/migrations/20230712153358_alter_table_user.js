export const up = async function (knex) {
    return knex.schema.table("user", function (table) {
      table.string("sub", 255);
    });
  };
  
  export const down = async function (knex) {
    return knex.schema.table("user", function (table) {
      table.dropColumn("sub");
    });
  };