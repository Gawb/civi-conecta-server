/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createView("questions_by_grade", (view) => {
    view.as(
      knex
        .column({
          grade: "unit.grade_id",
          is_for_student: "question.is_for_student",
        })
        .count({ quantity: "question.id" })
        .from("question")
        .innerJoin("unit", "question.unit_id", "unit.id")
        .groupBy("unit.grade_id", "question.is_for_student")
        .orderBy("unit.grade_id", "question.is_for_student"),
    );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
