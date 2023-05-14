// db.js
import knex from "knex";
import getKnexConfig from "./knexfile.js";

const initializeKnex = async () => {
  const config = await getKnexConfig();
  return knex(config);
};

export default initializeKnex;
