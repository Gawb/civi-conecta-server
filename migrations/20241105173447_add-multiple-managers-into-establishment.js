/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("establishment_manager", (t) => {
    t.integer("establishment_id").unsigned();
    t.integer("manager_id").unsigned();
    t.foreign("establishment_id").references("establishment.id");
    t.foreign("manager_id").references("user.id");
    t.primary(["establishment_id", "manager_id"]);
  });

  const establishments = await knex
    .select()
    .from("establishment")
    .whereNotNull("manager_id", null);

  for (const establishment of establishments) {
    const fields = {
      establishment_id: establishment.id,
      manager_id: establishment.manager_id,
    };
    await knex.insert(fields).into("establishment_manager");
  }

  await knex.schema.alterTable("establishment", (t) => {
    t.dropColumn("manager_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
