export const up = async function (knex) {
  // Create new enum type
  await knex.raw(
    "CREATE TYPE \"userrole\" AS ENUM('basic_user', 'driver', 'logistics', 'project_manager', 'admin')"
  );

  // Add a new column with the enum type
  await knex.schema.alterTable("user", function (table) {
    table.specificType("new_user_role", "userrole");
  });

  // Copy the data over
  await knex.raw('UPDATE "user" SET "new_user_role" = "user_role"::"userrole"');

  // Add the NOT NULL constraint
  await knex.raw(
    'ALTER TABLE "user" ALTER COLUMN "new_user_role" SET NOT NULL'
  );

  // Drop old column
  await knex.schema.alterTable("user", function (table) {
    table.dropColumn("user_role");
  });

  // Rename new column to old column's name
  await knex.raw(
    'ALTER TABLE "user" RENAME COLUMN "new_user_role" TO "user_role"'
  );
};

export const down = async function (knex) {
  // Add a new column with the varchar type
  await knex.schema.alterTable("user", function (table) {
    table.string("new_user_role", 20);
  });

  // Copy the data over
  await knex.raw('UPDATE "user" SET "new_user_role" = "user_role"');

  // Add the NOT NULL constraint
  await knex.raw(
    'ALTER TABLE "user" ALTER COLUMN "new_user_role" SET NOT NULL'
  );

  // Drop old column
  await knex.schema.alterTable("user", function (table) {
    table.dropColumn("user_role");
  });

  // Rename new column to old column's name
  await knex.raw(
    'ALTER TABLE "user" RENAME COLUMN "new_user_role" TO "user_role"'
  );

  // Drop enum type
  return knex.raw('DROP TYPE "userrole"');
};
