export const up = async function(knex) {
    return knex.schema.alterTable('public.purchase_order_item', function(t) {
        t.string('s3_uri', 255).nullable().alter();
    });
};

export const down = async function(knex) {
    return knex.schema.alterTable('public.purchase_order_item', function(t) {
        t.string('s3_uri', 255).notNullable().alter();
    });
};
