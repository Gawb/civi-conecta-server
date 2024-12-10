/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.dropViewIfExists("reports_planning_and_units");

  const ref = knex.ref.bind(knex);
  const raw = knex.raw.bind(knex);

  await knex.schema.createView("reports_planning_and_units", (view) => {
    view.as(
      knex
        .with("total_lessons", (builder) => {
          builder
            .column({
              unit_id: "unit.id",
              quantity: raw("COUNT(lesson.id)"),
            })
            .from("unit")
            .innerJoin("lesson", "lesson.unit_id", "unit.id")
            .groupBy("unit.id");
        })
        .with("units_by_teacher", (builder) => {
          builder
            .column({
              unit_id: "unit.id",
              quantity: "total_lessons.quantity",
              finished: raw("COUNT(lesson_course.has_finished)"),
              downloaded: raw("COUNT(lesson_course.has_downloaded_content)"),
              teacher_id: "teacher.id",
            })
            .from("unit")
            .innerJoin("total_lessons", "total_lessons.unit_id", "unit.id")
            .innerJoin("lesson", "lesson.unit_id", "unit.id")
            .leftJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
            .leftJoin("course", "lesson_course.course_id", "course.id")
            .leftJoin(
              ref("user").as("teacher"),
              "course.teacher_id",
              "teacher.id",
            )
            .groupBy("unit.id", "total_lessons.quantity", "teacher.id")
            .orderBy("unit.id");
        })
        .column({
          establishment_id: "establishment.id",
          establishment_name: "establishment.name",
          grade: "grade.level",
          letter: "letter.character",
          grade_id: "grade.id",
          teacher_name: "teacher.name",
          teacher_uuid: "teacher.uuid",
          is_custom_planification: "teacher.is_custom_planification",
          working_units: raw(
            "SUM(CASE WHEN units_by_teacher.quantity = units_by_teacher.finished THEN 1 ELSE 0 END)",
          ),
          lessons_finished: raw("SUM(units_by_teacher.finished)"),
          lessons_downloaded: raw("SUM(units_by_teacher.downloaded)"),
        })
        .from("establishment")
        .innerJoin("course", "course.establishment_id", "establishment.id")
        .innerJoin("grade", "course.grade_id", "grade.id")
        .innerJoin("letter", "course.letter_id", "letter.id")
        .leftJoin(ref("user").as("teacher"), "course.teacher_id", "teacher.id")
        .leftJoin(
          "units_by_teacher",
          "units_by_teacher.teacher_id",
          "teacher.id",
        )
        .groupBy(
          "establishment.id",
          "grade.level",
          "letter.character",
          "grade.id",
          "teacher.name",
          "teacher.uuid",
          "teacher.is_custom_planification",
        )
        .orderBy("establishment.id"),
    );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropViewIfExists("reports_planning_and_units");
};
