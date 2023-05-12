// db.js
import knex from "knex";
import knexConfig from "./knexfile.js";

const initializeKnex = async () => {
  const config = await knexConfig();
  return knex(config);
};

export default initializeKnex;
