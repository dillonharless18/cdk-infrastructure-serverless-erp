import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let PATH_TO_SQL_FILE = "../sql/database_creation_script.sql";

// We need the primary key to be an auto incrementing integer
export async function up(knex) {
  // Step 1: Drop dependent foreign key constraints
  await knex.schema.alterTable("item_transportation_request", function (table) {
    table.dropForeign("transportation_request_type_id");
  });

  await knex.schema.alterTable(
    "purchase_order_transportation_request",
    function (table) {
      table.dropForeign("transportation_request_type_id");
    }
  );

  // Step 2: Drop the existing primary key constraint
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropPrimary();
  });

  // Step 3: Drop the existing transportation_request_type_id column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropColumn("transportation_request_type_id");
  });

  // Step 4: Add a new auto-incrementing integer primary key column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.increments("transportation_request_type_id").primary();
  });

  // Step 5: Re-create the dependent foreign key constraints
  await knex.schema.alterTable("item_transportation_request", function (table) {
    table
      .foreign("transportation_request_type_id")
      .references("transportation_request_type_id")
      .inTable("transportation_request_type");
  });

  await knex.schema.alterTable(
    "purchase_order_transportation_request",
    function (table) {
      table
        .foreign("transportation_request_type_id")
        .references("transportation_request_type_id")
        .inTable("transportation_request_type");
    }
  );
}

export async function down(knex) {
  // Step 1: Drop dependent foreign key constraints
  await knex.schema.alterTable("item_transportation_request", function (table) {
    table.dropForeign("transportation_request_type_id");
  });

  await knex.schema.alterTable(
    "purchase_order_transportation_request",
    function (table) {
      table.dropForeign("transportation_request_type_id");
    }
  );

  // Step 2: Drop the new primary key column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropColumn("new_transportation_request_type_id");
  });

  // Step 3: Restore the original primary key
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table
      .string("transportation_request_type_id", 25)
      .notNullable()
      .primary()
      .alter();
  });

  // Step 4: Re-create the dependent foreign key constraints with the original primary key
  await knex.schema.alterTable("item_transportation_request", function (table) {
    table
      .foreign("transportation_request_type_id")
      .references("transportation_request_type_id")
      .inTable("transportation_request_type");
  });

  await knex.schema.alterTable(
    "purchase_order_transportation_request",
    function (table) {
      table
        .foreign("transportation_request_type_id")
        .references("transportation_request_type_id")
        .inTable("transportation_request_type");
    }
  );
}
