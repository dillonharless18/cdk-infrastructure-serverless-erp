// migration.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let PATH_TO_SQL_FILE = "../sql/database_creation_script.sql";


/**
 * Creates the following tables:
 * - user
 * - vendor
 * - transportation_request_status
 * - urgent_order_status
 * - project
 * - purchase_order_item_status
 * - transportation_request_type
 * - purchase_order
 * - item_transportation_request
 * - transportation_trip
 * - transportation_trip_by_item_transportation_request
 * - purchase_order_transportation_request
 * - purchase_order_request_item_comment
 * - purchase_order_item
 * - purchase_order_comment
 * - ocr_purchase_order_draft_by_created_purchase_order
 * - ocr_imported_purchase_order_draft_item
 * - ocr_imported_purchase_order_draft_comment
 * - item_transportation_request_image
 * - item_transportation_request_comment
 * - transportation_trip_by_purchase_order_transportation_request
 * - purchase_order_transportation_request_comment
 * - purchase_order_request_item_by_purchase_order_item
 * - ocr_imported_purchase_order_draft_item_by_purchase_order_item
 */


export async function up(knex) {

  // User Table
  await knex.schema.createTable('user', function(table) {
    table.string('user_id', 32).notNullable().primary();
    table.boolean('is_active').notNullable();
    table.string('first_name', 20).notNullable();
    table.string('last_name', 20).notNullable();
    table.string('phone_number', 15).notNullable();
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('ocr_tool_id', 45).notNullable();
    table.string('user_role', 20).notNullable();
    table.string('user_email', 45).notNullable();
  });

  // Vendor Table 
  await knex.schema.createTable('vendor', function(table) {
    table.increments('vendor_id').notNullable().primary();
    table.string('vendor_name', 30).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.boolean('is_net_vendor').notNullable();
  });

  // Vehicle Type Table
  await knex.schema.createTable('vehicle_type', function(table) {
    table.increments('vehicle_type_id').notNullable().primary();
    table.string('vehicle_type_name', 30).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  });

  // Urgent Order Status Table
  await knex.schema.createTable('urgent_order_status', function(table) {
    table.increments('urgent_order_status_id').notNullable().primary();
    table.string('urgent_order_status_name', 25).notNullable();
    table.boolean('is_active').notNullable();
    table.string('create_by', 32).notNullable().references('user_id').inTable('user'); // TODO typo here in schema, "create_by"
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  });

  // Transportation Trip Status Table
  await knex.schema.createTable('transportation_trip_status', function(table) {
    table.increments('transportation_trip_status_id').notNullable().primary();
    table.string('transportation_trip_status_name', 30).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  });

  // Transportation Request Type Table
  await knex.schema.createTable('transportation_request_type', function(table) {
    table.string('transportation_request_type_id', 25).notNullable().primary();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  });

  // Transportation Request Status Table
  await knex.schema.createTable('transportation_request_status', function(table) {
    table.increments('transportation_request_status_id').notNullable().primary();
    table.string('transportation_request_status_name', 25).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  });

  // Purchase Order Status Table
  await knex.schema.createTable('purchase_order_status', function(table) {
    table.increments('purchase_order_status_id').notNullable().primary();
    table.string('purchase_order_status_name', 25).notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  });

  // Purchase Order Request Item Status Table
  await knex.schema.createTable('purchase_order_request_item_status', function(table) {
    table.increments('purchase_order_request_item_status_id').notNullable().primary();
    table.string('purchase_order_request_item_status_name', 25).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  })


  // Purchase Order Item Status Table
  await knex.schema.createTable('purchase_order_item_status', function(table) {
    table.increments('purchase_order_item_status_id').notNullable().primary();
    table.string('purchase_order_item_status_name', 30).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
  })

  // Project Table
  await knex.schema.createTable('project', function(table) {
    table.increments('project_id').notNullable().primary();
    table.string('project_name', 30).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('project_code', 4).notNullable();
  })


  // Credit Card Table
  await knex.schema.createTable('credit_card', function(table) {
    table.increments('credit_card_id').notNullable().primary();
    table.boolean('is_active').notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('credit_card_last_four_digits', 4).notNullable();
    table.string('credit_card_name', 10).notNullable();
  });


  // Transportation Trip Table
  await knex.schema.createTable('transportation_trip', function(table) {
    table.string('transportation_trip_id', 32).notNullable().primary();
    table.string('driver_id', 32).notNullable().references('user_id').inTable('user');
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('trip_name', 45).notNullable();
    table.integer('transportation_trip_status_id').notNullable().references('transportation_trip_status_id').inTable('transportation_trip_status');
    table.integer('vehicle_type_id').notNullable().references('vehicle_type_id').inTable('vehicle_type');
  });


  // Purchase Order Request Item Table
  await knex.schema.createTable('purchase_order_request_item', function(table) {
    table.string('purchase_order_request_item_id', 32).notNullable().primary();
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('item_name', 45).notNullable();
    table.string('quantity', 45).notNullable();
    table.string('unit_of_measure', 15).notNullable();
    table.string('suggested_vendor', 30).notNullable();
    table.string('s3_uri', 255).notNullable();
    table.string('description', 65).notNullable();
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('price', 15).notNullable();
    table.integer('vendor_id').notNullable().references('vendor_id').inTable('vendor');
    table.integer('project_id').notNullable().references('project_id').inTable('project');
    table.integer('purchase_order_request_item_status_id').notNullable().references('purchase_order_request_item_status_id').inTable('purchase_order_request_item_status');
    table.integer('urgent_order_status_id').notNullable().references('urgent_order_status_id').inTable('urgent_order_status');
  });


  // Purchase Order Table
  await knex.schema.createTable('purchase_order', function(table) {
    table.string('purchase_order_id', 32).notNullable().primary();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('total_price', 20).notNullable();
    table.string('purchase_order_number', 45).notNullable();
    table.integer('vendor_id').notNullable().references('vendor_id').inTable('vendor');
    table.integer('purchase_order_status_id').notNullable().references('purchase_order_status_id').inTable('purchase_order_status');
    table.string('quickbooks_purchase_order_id', 45).notNullable();
    table.string('s3_uri', 255).notNullable();
  });

  
  // OCR Imported Purchase Order Draft Table
  await knex.schema.createTable('ocr_imported_purchase_order_draft', function(table) {
    table.string('ocr_imported_purchase_order_draft_id', 32).notNullable().primary();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.integer('vendor_id').notNullable().references('vendor_id').inTable('vendor');
    table.string('last_updated_by', 32).notNullable().references('user_id').inTable('user');
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('ocr_suggested_vendor', 45).notNullable();
    table.string('ocr_suggesetd_purchase_order_number', 45).notNullable();
    table.string('s3_uri', 255).notNullable();
    table.integer('credit_card_id').notNullable().references('credit_card_id').inTable('credit_card');
  });

  // Item Transportation Request Table
  await knex.schema.createTable('item_transportation_request', table => {
    table.string('item_transportation_request_id', 32).notNullable().primary();
    table.string('last_updated_by', 32).notNullable();
    table.string('transportation_request_type_id', 25).notNullable();
    table.string('created_by', 32).notNullable();
    table.string('item_name', 45).notNullable();
    table.string('from_location', 100).notNullable();
    table.string('to_location', 100).notNullable();
    table.string('recipients', 100).notNullable();
    table.string('contact_number', 17).notNullable();
    table.string('contact_name', 30).notNullable();
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.string('additional_details', 100).notNullable();
    table.date('future_transportation_date').notNullable();
    table.time('future_transportation_time').notNullable();
    table.integer('project_id').notNullable();
    table.integer('urgent_order_status_id').notNullable();
    table.integer('transportation_request_status_id').notNullable();

    table.foreign('created_by').references('user.user_id');
    table.foreign('transportation_request_type_id').references('transportation_request_type.transportation_request_type_id');
    table.foreign('last_updated_by').references('user.user_id');
    table.foreign('project_id').references('project.project_id');
    table.foreign('urgent_order_status_id').references('urgent_order_status.urgent_order_status_id');
    table.foreign('transportation_request_status_id').references('transportation_request_status.transportation_request_status_id');
    
  });

  // Transportation Trip Comment Table
  await knex.schema.createTable('transportation_trip_comment', (table) => {
    table.string('transportation_trip_comment_id', 32).primary();
    table.string('transportation_trip_id', 32).notNullable();
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.datetime('created_at').notNullable();
    table.string('comment_text', 100).notNullable();

    table.foreign('transportation_trip_id').references('transportation_trip_id').inTable('transportation_trip');
  });


  // Transportation Trip by Item Transportation Request Table (Stop Table)  
  await knex.schema.createTable('transportation_trip_by_item_transportation_request', table => {
    table.string('item_transportation_request_id', 32).notNullable();
    table.string('transportation_trip_id', 32).notNullable();
    table.integer('transportation_request_status_id').notNullable();
    table.string('last_updated_by', 32).notNullable();
    table.string('created_by', 32).notNullable();
    table.datetime('created_at').notNullable();
    table.datetime('last_updated_at').notNullable();

    table.primary(['item_transportation_request_id', 'transportation_trip_id']);

    table.foreign('transportation_trip_id').references('transportation_trip.transportation_trip_id');
    table.foreign('item_transportation_request_id').references('item_transportation_request.item_transportation_request_id');
    table.foreign('created_by').references('user.user_id');
    table.foreign('last_updated_by').references('user.user_id');
  });


  // Purchase Order Transportation Request Table
  await knex.schema.createTable('purchase_order_transportation_request', function(table) {
    table.string('purchase_order_transportation_request_id', 32).notNullable().primary();
    table.string('purchase_order_id', 32).notNullable();
    table.string('last_updated_by', 32).notNullable();
    table.string('transportation_request_type_id', 25).notNullable();
    table.string('created_by', 32).notNullable();
    table.string('from_location', 100).notNullable();
    table.string('to_location', 100).notNullable();
    table.string('additional_details', 100).notNullable();
    table.datetime('created_at').notNullable();
    table.datetime('last_updated_at').notNullable();
    table.integer('urgent_order_status_id').notNullable();
    table.integer('transportation_request_status_id').notNullable();
    table.date('future_transportation_date').notNullable();
    table.time('transportation_time').notNullable();

    table.foreign('created_by').references('user.user_id');
    table.foreign('transportation_request_type_id').references('transportation_request_type.transportation_request_type_id');
    table.foreign('last_updated_by').references('user.user_id');
    table.foreign('purchase_order_id').references('purchase_order.purchase_order_id');
    table.foreign('urgent_order_status_id').references('urgent_order_status.urgent_order_status_id');
    table.foreign('transportation_request_status_id').references('transportation_request_status.transportation_request_status_id');
  });


  // Purchase Order Request Item Comment Table
  await knex.schema.createTable('purchase_order_request_item_comment', function(table) {
    table.string('purchase_order_request_item_comment_id', 32).notNullable().primary();
    table.string('purchase_order_request_item_id', 32).notNullable().references('purchase_order_request_item.purchase_order_request_item_id');
    table.string('created_by', 32).notNullable().references('user.user_id');
    table.string('comment_text', 100).notNullable();
    table.datetime('created_at').notNullable();
  })


  // Purchase Order Item Table
  await knex.schema.createTable('purchase_order_item', function(table) {
    table.string('purchase_order_item_id', 32).notNullable();
    table.string('purchase_order_id', 32).notNullable();
    table.string('created_by', 32).notNullable();
    table.string('last_updated_by', 32).notNullable();
    table.string('price', 15).notNullable();
    table.string('quantity', 10).notNullable();
    table.string('unit_of_measure', 10).notNullable();
    table.string('description', 100).notNullable();
    table.dateTime('created_at').notNullable();
    table.dateTime('last_updated_at').notNullable();
    table.boolean('is_damaged').notNullable();
    table.string('damage_or_return_text', 100).notNullable();
    table.integer('project_id').notNullable();
    table.integer('purchase_order_item_status_id').notNullable();

    table.primary(['purchase_order_item_id']);
    table.foreign('created_by').references('user.user_id');
    table.foreign('last_updated_by').references('user.user_id');
    table.foreign('project_id').references('project.project_id');
    table.foreign('purchase_order_item_status_id').references('purchase_order_item_status.purchase_order_item_status_id');
    table.foreign('purchase_order_id').references('purchase_order.purchase_order_id');

  });

  // Purchase Order Comment Table
  await knex.schema.createTable('purchase_order_comment', function(table) {
    table.string('purchase_order_comment_id', 32).notNullable().primary();
    table.string('purchase_order_id', 32).notNullable().references('purchase_order_id').inTable('purchase_order');
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.datetime('created_at').notNullable();
    table.string('comment_text', 100).notNullable();
  });

  // OCR Purchase Order Draft by Create Purchase Order Table
  await knex.schema.createTable('ocr_purchase_order_draft_by_created_purchase_order', table => {
    table.string('ocr_imported_purchase_order_draft_id', 32).notNullable();
    table.string('purchase_order_id', 32).notNullable();

    table.primary(['ocr_imported_purchase_order_draft_id', 'purchase_order_id']);
    
    table.foreign('ocr_imported_purchase_order_draft_id').references('ocr_imported_purchase_order_draft.ocr_imported_purchase_order_draft_id');
    table.foreign('purchase_order_id').references('purchase_order.purchase_order_id');
  });


  // OCR Imported Purchase Order Draft Item Table
  await knex.schema.createTable('ocr_imported_purchase_order_draft_item', table => {
    table.string('ocr_imported_purchase_order_draft_item_id', 32).notNullable().primary();
    table.string('ocr_imported_purchase_order_draft_id', 32).notNullable().references('ocr_imported_purchase_order_draft.ocr_imported_purchase_order_draft_id');
    table.string('created_by', 32).notNullable().references('user.user_id');
    table.string('last_updated_by', 32).notNullable().references('user.user_id');
    table.string('item_name', 45).notNullable();
    table.string('price', 20).notNullable();
    table.integer('quantity').notNullable();
    table.string('unit_of_measure', 20).notNullable();
    table.string('description', 100).notNullable();
    table.datetime('created_at').notNullable();
    table.datetime('last_updated_at').notNullable();
    table.integer('project_id').notNullable().references('project.project_id');
    table.integer('purchase_order_item_status_id').notNullable().references('purchase_order_item_status.purchase_order_item_status_id');
  });


  // OCR Imported Purchase Order Draft Comment
  await knex.schema.createTable('ocr_imported_purchase_order_draft_comment', function(table) {
    table.string('ocr_imported_purchase_order_draft_comment_id', 32).notNullable().primary();
    table.string('ocr_imported_purchase_order_draft_id', 32).notNullable().references('ocr_imported_purchase_order_draft.ocr_imported_purchase_order_draft_id');
    table.string('created_by', 32).notNullable().references('user.user_id');
    table.datetime('created_at').notNullable();
    table.string('comment_text', 100).notNullable();
  });

  // Item Transportation Request Image Table
  await knex.schema.createTable('item_transportation_request_image', function(table) {
    table.string('item_transportation_request_image_id', 255).notNullable();
    table.string('item_transportation_request_id', 32).notNullable();
    table.string('created_by', 32).notNullable();
    table.dateTime('created_at').notNullable();

    table.primary('item_transportation_request_image_id');
    table.foreign('item_transportation_request_id').references('item_transportation_request.item_transportation_request_id');
    table.foreign('created_by').references('user.user_id');
  });

  // Item Transportation Request Comment Table
  await knex.schema.createTable('item_transportation_request_comment', function(table) {
    table.string('item_transportation_request_comment_id', 32).notNullable().primary();
    table.string('item_transportation_request_id', 32).notNullable().references('item_transportation_request.item_transportation_request_id').onDelete('CASCADE');
    table.string('created_by', 32).notNullable().references('user.user_id').onDelete('CASCADE');
    table.string('comment_text', 100).notNullable();
    table.datetime('created_at').notNullable();
  });

  // Transportation Trip by Purchase Order Transportation Request Table
  await knex.schema.createTable('transportation_trip_by_purchase_order_transportation_request', function(table) {
    table.string('purchase_order_transportation_request_id', 32).notNullable();
    table.string('transportation_trip_id', 32).notNullable();
    table.integer('transportation_request_status_id').notNullable();
    table.string('last_updated_by', 32).notNullable();
    table.string('created_by', 32).notNullable();
    table.datetime('created_at').notNullable();
    table.datetime('last_updated_at').notNullable();

    table.primary(['purchase_order_transportation_request_id', 'transportation_trip_id']);

    table.foreign('purchase_order_transportation_request_id').references('purchase_order_transportation_request.purchase_order_transportation_request_id');
    table.foreign('transportation_trip_id').references('transportation_trip.transportation_trip_id');
    table.foreign('last_updated_by').references('user.user_id');
    table.foreign('created_by').references('user.user_id');
  });

  // Purchase Order Transportation Request Comment
  await knex.schema.createTable('purchase_order_transportation_request_comment', function(table) {
    table.string('purchase_order_transportation_request_comment_id', 32).notNullable().primary();
    table.string('purchase_order_transportation_request_id', 32).notNullable().references('purchase_order_transportation_request_id').inTable('purchase_order_transportation_request');
    table.string('created_by', 32).notNullable().references('user_id').inTable('user');
    table.datetime('created_at').notNullable();
    table.string('comment_text', 100).notNullable();
  });

  // Purchase Order Request Item by Purchase Order Item table
  await knex.schema.createTable('purchase_order_request_item_by_purchase_order_item', table => {
    table.string('purchase_order_item_id').notNullable();
    table.string('purchase_order_request_item_id').notNullable();
    table.primary(['purchase_order_item_id', 'purchase_order_request_item_id']);
  });


  // OCR Imported Purchase Order Draft Item by Purchase Order Item Table
  await knex.schema.createTable('ocr_imported_purchase_order_draft_item_by_purchase_order_item', table => {
    // TODO confirm this is okay. I was getting an error that said the constrain already existed. I think it does the FKs implicitly.
    // table.string('purchase_order_item_id', 32).notNullable().references('purchase_order_item_id').inTable('purchase_order_item').onDelete('CASCADE');
    table.string('purchase_order_item_id', 32).notNullable();
    // table.string('ocr_imported_purchase_order_draft_item_id', 32).notNullable().references('ocr_imported_purchase_order_draft_item_id').inTable('ocr_imported_purchase_order_draft_item').onDelete('CASCADE');
    table.string('ocr_imported_purchase_order_draft_item_id', 32).notNullable();
    table.primary(['purchase_order_item_id', 'ocr_imported_purchase_order_draft_item_id']);
  });

};


// TODO Look into why I had to drop FK constraints and ensure that everything is set to CASCADE where appropriate
export async function down(knex) {

  // drop foreign key constraints on transportation_trip table
  // await knex.schema.table('transportation_trip_comment', table => {
  //   table.dropForeign('transportation_trip_id');
  // });

  // await knex.schema.table('transportation_trip_by_item_transportation_request', table => {
  //   table.dropForeign('transportation_trip_id');
  // });

  // await knex.schema.table('transportation_trip_by_purchase_order_transportation_request', table => {
  //   table.dropForeign('transportation_trip_id');
  // });

  // // Drop foreign key constraints on project table
  // await knex.schema.table('purchase_order_request_item', table => {
  //   table.dropForeign('project_id');
  // });

  // await knex.schema.table('item_transportation_request', table => {
  //   table.dropForeign('project_id');
  // });

  // await knex.schema.table('purchase_order_item', table => {
  //   table.dropForeign('project_id');
  // });

  // await knex.schema.table('ocr_imported_purchase_order_draft_item', table => {
  //   table.dropForeign('project_id');
  // });

  // // drop foreign key constraints on urgent order status table
  // await knex.schema.table('purchase_order_request_item', table => {
  //   table.dropForeign('urgent_order_status_id');
  // });

  // await knex.schema.table('item_transportation_request', table => {
  //   table.dropForeign('urgent_order_status_id');
  // });

  // await knex.schema.table('purchase_order_transportation_request', table => {
  //   table.dropForeign('urgent_order_status_id');
  // });

  // // drop foreign key constraints on vendor table
  // await knex.schema.table('purchase_order_request_item', table => {
  //   table.dropForeign('vendor_id');
  // });

  // await knex.schema.table('purchase_order', table => {
  //   table.dropForeign('vendor_id');
  // });

  // await knex.schema.table('ocr_imported_purchase_order_draft', table => {
  //   table.dropForeign('vendor_id');
  // });
  
  
  // // drop foreign key constraint on user
  // await knex.schema.table('vendor', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('vehicle_type', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('urgent_order_status', table => {
  //   table.dropForeign('create_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('transportation_trip_status', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('transportation_request_type', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('transportation_request_status', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('purchase_order_status', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('purchase_order_request_item_status', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('purchase_order_item_status', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('project', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('credit_card', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('transportation_trip', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('purchase_order_request_item', table => {
  //   table.dropForeign('last_updated_by');
  //   table.dropForeign('created_by');
  // });
  
  // await knex.schema.table('purchase_order', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('ocr_imported_purchase_order_draft', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('item_transportation_request', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('transportation_trip_comment', table => {
  //   table.dropForeign('created_by');
  // });
  
  // await knex.schema.table('transportation_trip_by_item_transportation_request', table => {
  //   table.dropForeign('created_by_f');
  //   table.dropForeign('last_updated');
  // });
  
  // await knex.schema.table('purchase_order_transportation_request', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('purchase_order_request_item_comment', table => {
  //   table.dropForeign('created_by');
  // });
  
  // await knex.schema.table('purchase_order_item', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('purchase_order_comment', table => {
  //   table.dropForeign('created_by');
  // });
  
  // await knex.schema.table('ocr_imported_purchase_order_draft_item', table => {
  //   table.dropForeign('created_by');
  //   table.dropForeign('last_updated_by');
  // });
  
  // await knex.schema.table('ocr_imported_purchase_order_draft_comment', table => {
  //   table.dropForeign('created_by');
  // });

  // await knex.schema.table('item_transportation_request_image', table => {
  //   table.dropForeign('created_by')
  // });


  // await knex.schema.table('transportation_trip_by_purchase_order_transportation_request', table => {
  //   table.dropForeign('last_updated_by');
  // });

  // await knex.schema.table('purchase_order_transportation_request_comment', table => {
  //   table.dropForeign('created_by_foreign');
  // });
  
  
  // then drop the tables themselves
  // await knex.schema.dropTableIfExists('ocr_imported_purchase_order_draft_item_by_purchase_order_item');
  // await knex.schema.dropTableIfExists('purchase_order_request_item_by_purchase_order_item');
  // await knex.schema.dropTableIfExists('purchase_order_transportation_request_comment');
  // await knex.schema.dropTableIfExists('transportation_trip_by_purchase_order_transportation_request');
  // await knex.schema.dropTableIfExists('item_transportation_request_comment');
  // await knex.schema.dropTableIfExists('item_transportation_request_image');
  // await knex.schema.dropTableIfExists('ocr_imported_purchase_order_draft_comment');
  // await knex.schema.dropTableIfExists('ocr_imported_purchase_order_draft_item');
  // await knex.schema.dropTableIfExists('ocr_purchase_order_draft_by_created_purchase_order');
  // await knex.schema.dropTableIfExists('purchase_order_comment');
  // await knex.schema.dropTableIfExists('purchase_order_item');
  // await knex.schema.dropTableIfExists('purchase_order_request_item_comment');
  // await knex.schema.dropTableIfExists('purchase_order_transportation_request');
  // await knex.schema.dropTableIfExists('transportation_trip_by_item_transportation_request');
  // await knex.schema.dropTableIfExists('transportation_trip');
  // await knex.schema.dropTableIfExists('item_transportation_request');
  // await knex.schema.dropTableIfExists('purchase_order');
  // await knex.schema.dropTableIfExists('transportation_request_type');
  // await knex.schema.dropTableIfExists('purchase_order_item_status');
  // await knex.schema.dropTableIfExists('credit_card');
  // await knex.schema.dropTableIfExists('ocr_imported_purchase_order_draft');
  // await knex.schema.dropTableIfExists('purchase_order_request_item');
  // await knex.schema.dropTableIfExists('purchase_order_request_item_status');
  // await knex.schema.dropTableIfExists('purchase_order_status');
  // await knex.schema.dropTableIfExists('transportation_trip_comment');
  // await knex.schema.dropTableIfExists('transportation_trip_status');
  // await knex.schema.dropTableIfExists('vehicle_type');
  // await knex.schema.dropTableIfExists('project');
  // await knex.schema.dropTableIfExists('urgent_order_status');
  // await knex.schema.dropTableIfExists('transportation_request_status');
  // await knex.schema.dropTableIfExists('vendor');
  // await knex.schema.dropTableIfExists('user');

  await knex.raw('DROP TABLE IF EXISTS ocr_imported_purchase_order_draft_item_by_purchase_order_item CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_request_item_by_purchase_order_item CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_transportation_request_comment CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_trip_by_purchase_order_transportation_request CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS item_transportation_request_comment CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS item_transportation_request_image CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS ocr_imported_purchase_order_draft_comment CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS ocr_imported_purchase_order_draft_item CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS ocr_purchase_order_draft_by_created_purchase_order CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_comment CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_item CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_request_item_comment CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_transportation_request CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_trip_by_item_transportation_request CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_trip CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS item_transportation_request CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_request_type CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_item_status CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS credit_card CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS ocr_imported_purchase_order_draft CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_request_item CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_request_item_status CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS purchase_order_status CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_trip_comment CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_trip_status CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS vehicle_type CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS project CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS urgent_order_status CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS transportation_request_status CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS vendor CASCADE;');
  await knex.raw('DROP TABLE IF EXISTS "user" CASCADE;');

};


