import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let PATH_TO_SQL_FILE = "../sql/database_creation_script.sql";

// We need the primary key to be an auto incrementing integer
export async function up(knex) {
  // Step 1: Drop the existing primary key constraint
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropPrimary();
  });

  // Step 2: Drop the existing transportation_request_type_id column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropColumn("transportation_request_type_id");
  });

  // Step 3: Add a new auto-incrementing integer primary key column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.increments("transportation_request_type_id").primary();
  });
}

export async function down(knex) {
  // Step 1: Drop the new primary key constraint
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropPrimary();
  });

  // Step 2: Drop the new transportation_request_type_id column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.dropColumn("transportation_request_type_id");
  });

  // Step 3: Restore the original string-based primary key column
  await knex.schema.alterTable("transportation_request_type", function (table) {
    table.string("transportation_request_type_id", 25).notNullable();
    table.primary("transportation_request_type_id");
  });
}
