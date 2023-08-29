export const up = async function (knex) {
    return knex.schema.alterTable("users", function (table) {
        table.string("phone", 20).alter();
    });
};

export const down = async function (knex) {
    return knex.schema.alterTable("users", function (table) {
        table.string("phone", 15).alter();
    });
};
