/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const ref = knex.ref.bind(knex);

  await knex.schema.dropViewIfExists("reports_planning_and_units");

  await knex.schema.createView("reports_planning_and_units", (view) => {
    view.as(
      knex
        .with("t1", (builder) => {
          builder
            .column({
              id: "establishment.id",
              establishment_name: "establishment.name",
              teacher_name: "teacher.name",
              teacher_uuid: "teacher.uuid",
              is_custom_planification: "teacher.is_custom_planification",
              grade: "grade.level",
              letter: "letter.character",
              has_finished_lesson: knex.raw(
                "COALESCE(lesson_course.has_finished, 0)",
              ),
              has_downloaded_content: knex.raw(
                "COALESCE(lesson_course.has_downloaded_content, 0)",
              ),
              lesson_id: "lesson.id",
              unit_id: "unit.id",
              grade_id: "grade.id",
              letter_id: "letter.id",
            })
            .from("establishment")
            .innerJoin("course", "course.establishment_id", "establishment.id")
            .innerJoin("grade", "course.grade_id", "grade.id")
            .innerJoin("letter", "course.letter_id", "letter.id")
            .innerJoin(
              ref("user").as("teacher"),
              "course.teacher_id",
              "teacher.id",
            )
            .leftJoin("lesson_course", "lesson_course.course_id", "course.id")
            .leftJoin("lesson", "lesson_course.lesson_id", "lesson.id")
            .leftJoin("unit", "lesson.unit_id", "unit.id")
            .orderBy(["establishment_id", "teacher.name"]);
        })
        .select(
          "t1.id",
          "t1.establishment_name",
          "t1.teacher_name",
          "t1.teacher_uuid",
          "t1.is_custom_planification",
          "t1.grade",
          "t1.letter",
          "t1.grade_id",
          "t1.letter_id",
        )
        .column({
          working_units: knex.raw("COUNT(DISTINCT t1.unit_id)"),
          downloaded_content_lessons: knex.raw(
            "SUM(t1.has_downloaded_content)",
          ),
          lesson_which_are_finished: knex.raw("SUM(t1.has_finished_lesson)"),
        })
        .from("t1")
        .groupBy(
          "t1.id",
          "t1.establishment_name",
          "t1.teacher_name",
          "t1.teacher_uuid",
          "t1.grade",
          "t1.letter",
          "t1.is_custom_planification",
          "t1.unit_id",
          "t1.grade_id",
          "t1.letter_id",
        ),
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
