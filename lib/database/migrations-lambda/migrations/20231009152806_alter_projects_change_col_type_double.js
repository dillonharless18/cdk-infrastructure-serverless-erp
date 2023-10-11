export const up = async function (knex) {
    return knex.schema.table("project", function (table) {
        table.decimal("material_budget", 10, 2).alter();
        table.decimal("labor_budget", 10, 2).alter();
    });
};

export const down = async function (knex) {
    return knex.schema.table("project", function (table) {
        table.string("material_budget").alter();
        table.string("labor_budget").alter();
    });
};
