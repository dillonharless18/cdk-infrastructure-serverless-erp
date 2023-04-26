const fs = require('fs');
const path = require('path');

let PATH_TO_SQL_FILE = "../sql/database_creation_script.sql"

exports.up = async function (knex) {
  const sql = fs.readFileSync(path.join(__dirname, PATH_TO_SQL_FILE), 'utf8');
  await knex.schema.raw(sql);
};

exports.down = async function (knex) {
  // ... Write the code to reverse the changes made in the up function
};