/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("establishment", (table) => {
    table.integer("manager_id").unsigned().references("id").inTable("user");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("establishment", (table) => {
    table.dropColumn("manager_id");
  });
};
