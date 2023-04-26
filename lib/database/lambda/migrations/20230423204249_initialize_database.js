// migration.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let PATH_TO_SQL_FILE = "../sql/database_creation_script.sql";

export async function up(knex) {
  const sql = fs.readFileSync(path.join(__dirname, PATH_TO_SQL_FILE), 'utf8');
  await knex.schema.raw(sql);
};

export async function down(knex) {
  // ... Write the code to reverse the changes made in the up function
};
