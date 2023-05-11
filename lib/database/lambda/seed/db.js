const knex = require("knex");
const knexConfig = require("./knexfile");

const initializeKnex = async () => {
  const config = await knexConfig();
  return knex(config);
};

module.exports = initializeKnex;
