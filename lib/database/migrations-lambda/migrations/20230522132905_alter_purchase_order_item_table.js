export async function up(knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await knex.schema.alterTable('purchase_order_item', (table) => {
      table.uuid('uuid').defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('s3_uri');
    });
  
    // Use knex.raw() to generate a new UUID for each existing record
    await knex('purchase_order_item').update({
      s3_uri: 'dummy_s3_uri', // Replace 'dummy_s3_uri' with your actual dummy S3 URI
      uuid: knex.raw('uuid_generate_v4()')
    });
  
    return knex.schema.alterTable('purchase_order_item', (table) => {
      table.string('s3_uri').notNullable().alter();
      table.uuid('uuid').notNullable().alter();
    });
  }
  
  export function down(knex) {
    return knex.schema.alterTable('purchase_order_item', (table) => {
      table.dropColumn('uuid');
      table.dropColumn('s3_uri');
    });
  }
  