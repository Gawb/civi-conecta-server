/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.dropViewIfExists("reports_situations");
  await knex.schema.dropViewIfExists("reports_ephemeris");

  const ref = knex.ref.bind(knex);
  const raw = knex.raw.bind(knex);

  await knex.schema.createView("reports_situations", (view) => {
    view.as(
      knex
        .with("t1", (builder) => {
          builder
            .select({
              id: "establishment.id",
              establishment_name: "establishment.name",
              teacher_uuid: "teacher.uuid",
              teacher_name: "teacher.name",
              grade_level: "grade.level",
              grade_id: "grade.id",
              letter_character: "letter.character",
              is_custom_planification: "teacher.is_custom_planification",
              has_finished_lesson: knex.raw("COALESCE(lesson_course.has_finished, 0)"),
              has_downloaded_content: knex.raw("COALESCE(lesson_course.has_downloaded_content, 0)"),
            })
            .from("establishment")
            .join("course", "course.establishment_id", "establishment.id")
            .join("grade", "course.grade_id", "grade.id")
            .join("letter", "course.letter_id", "letter.id")
            .join("user as teacher", "course.teacher_id", "teacher.id")
            .leftJoin("lesson_course", "lesson_course.course_id", "course.id")
            .leftJoin("lesson", "lesson_course.lesson_id", "lesson.id")
            .leftJoin("event", "lesson.event_id", "event.id")
            .whereRaw("event.event_type_id = 1 OR event.event_type_id IS NULL");
        })
        .select({
          id: "t1.id",
          establishment_name: "t1.establishment_name",
          teacher_uuid: "t1.teacher_uuid",
          teacher_name: "t1.teacher_name",
          grade_id: "t1.grade_id",
          letter_character: "t1.letter_character",
          grade_level: "t1.grade_level",
          is_custom_planification: "t1.is_custom_planification",
          lessons_downloaded: knex.raw("SUM(t1.has_downloaded_content)"),
          lessons_finished: knex.raw("SUM(t1.has_finished_lesson)"),
        })
        .from("t1")
        .groupBy(
          "t1.teacher_uuid",
          "t1.teacher_name",
          "t1.letter_character",
          "t1.establishment_name",
          "t1.id",
          "t1.grade_level",
          "t1.grade_id",
          "t1.is_custom_planification"
        )
    );
  });

  await knex.schema.createView("reports_ephemeris", (view) => {
    view.as(
      knex
        .with("t1", (builder) => {
          builder
            .column({
              id: "establishment.id",
              establishment_name: "establishment.name",
              teacher_name: "teacher.name",
              teacher_uuid: "teacher.uuid",
              grade_level: "grade.level",
              grade_id: "grade.id",
              letter_character: "letter.character",
              is_custom_planification: "teacher.is_custom_planification",
              has_finished_lesson: knex.raw("COALESCE(lesson_course.has_finished, 0)"),
              has_downloaded_content: knex.raw("COALESCE(lesson_course.has_downloaded_content, 0)")
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
            .leftJoin("event", "lesson.event_id", "event.id")
            .whereRaw("event.event_type_id = 2 OR event.event_type_id IS NULL")
        })
        .column({
          id: "t1.id",
          establishment_name: "t1.establishment_name",
          teacher_name: "t1.teacher_name",
          teacher_uuid: "t1.teacher_uuid",
          grade_id: "t1.grade_id",
          letter_character: "t1.letter_character",
          grade_level: "t1.grade_level",
          is_custom_planification: "t1.is_custom_planification",
          lessons_finished: knex.raw("SUM(t1.has_finished_lesson)"),
          lessons_downloaded: knex.raw("SUM(t1.has_downloaded_content)")
        })
        .from("t1")
        .groupBy(
          "t1.id",
          "t1.establishment_name",
          "t1.teacher_name",
          "t1.teacher_uuid",
          "t1.grade_id",
          "t1.is_custom_planification",
          "t1.grade_level",
          "t1.letter_character"
        ),
    );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropViewIfExists("reports_situations");
  await knex.schema.dropViewIfExists("reports_ephemeris");
};
