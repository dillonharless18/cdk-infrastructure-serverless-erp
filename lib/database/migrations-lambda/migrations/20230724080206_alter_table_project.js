export const up = async function (knex) {
    return knex.schema.table("project", function (table) {
      table.string("material_budget", 255);
      table.string("labor_budget", 255);
    });
  };
  
  export const down = async function (knex) {
    return knex.schema.table("project", function (table) {
        table.string("material_budget", 255);
        table.string("labor_budget", 255);
    });
  };