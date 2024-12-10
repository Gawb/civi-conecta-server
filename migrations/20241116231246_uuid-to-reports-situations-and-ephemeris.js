/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.dropViewIfExists("reports_situations");
  await knex.schema.dropViewIfExists("reports_ephemeris");

  const ref = knex.ref.bind(knex);
  const raw = knex.raw.bind(knex);

  await knex.schema.createView("reports_situations", (view) => {
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
              has_finished_lesson: raw(
                "COALESCE(lesson_course.has_finished, 0)",
              ),
              has_downloaded_content: raw(
                "COALESCE(lesson_course.has_downloaded_content, 0)",
              ),
              lesson_id: "lesson.id",
              situation_id: "event.id",
            })
            .from("establishment")
            .innerJoin("course", "course.establishment_id", "establishment.id")
            .innerJoin(
              ref("user").as("teacher"),
              "course.teacher_id",
              "teacher.id",
            )
            .leftJoin("lesson_course", "lesson_course.course_id", "course.id")
            .leftJoin("lesson", "lesson_course.lesson_id", "lesson.id")
            .leftJoin("event", "lesson.event_id", "event.id")
            .whereRaw("event.event_type_id = 1 OR event.event_type_id IS NULL")
            .orderBy("establishment.id", "teacher.name");
        })
        .column({
          id: "t1.id",
          establishment_name: "t1.establishment_name",
          teacher_name: "t1.teacher_name",
          teacher_uuid: "t1.teacher_uuid",
          is_custom_planification: "t1.is_custom_planification",
          working_situation: raw("COUNT(DISTINCT t1.situation_id)"),
          lessons_finished: raw(
            "SUM(CASE WHEN t1.situation_id IS NOT NULL THEN t1.has_finished_lesson ELSE 0 END)",
          ),
          lessons_downloaded: raw(
            "SUM(CASE WHEN t1.situation_id IS NOT NULL THEN t1.has_downloaded_content ELSE 0 END)",
          ),
        })
        .from("t1")
        .groupBy(
          "t1.id",
          "t1.establishment_name",
          "t1.teacher_name",
          "t1.teacher_uuid",
          "t1.is_custom_planification",
          "t1.situation_id",
        ),
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
              is_custom_planification: "teacher.is_custom_planification",
              has_finished_lesson: raw(
                "COALESCE(lesson_course.has_finished, 0)",
              ),
              has_downloaded_content: raw(
                "COALESCE(lesson_course.has_downloaded_content, 0)",
              ),
              lesson_id: "lesson.id",
              ephemeris_id: "event.id",
            })
            .from("establishment")
            .innerJoin("course", "course.establishment_id", "establishment.id")
            .innerJoin(
              ref("user").as("teacher"),
              "course.teacher_id",
              "teacher.id",
            )
            .leftJoin("lesson_course", "lesson_course.course_id", "course.id")
            .leftJoin("lesson", "lesson_course.lesson_id", "lesson.id")
            .leftJoin("event", "lesson.event_id", "event.id")
            .whereRaw("event.event_type_id = 2 OR event.event_type_id IS NULL")
            .orderBy("establishment.id", "teacher.name");
        })
        .column({
          id: "t1.id",
          establishment_name: "t1.establishment_name",
          teacher_name: "t1.teacher_name",
          teacher_uuid: "t1.teacher_uuid",
          is_custom_planification: "t1.is_custom_planification",
          working_ephemeris: raw("COUNT(DISTINCT t1.ephemeris_id)"),
          lessons_finished: raw(
            "SUM(CASE WHEN t1.ephemeris_id IS NOT NULL THEN t1.has_finished_lesson ELSE 0 END)",
          ),
          lessons_downloaded: raw(
            "SUM(CASE WHEN t1.ephemeris_id IS NOT NULL THEN t1.has_downloaded_content ELSE 0 END)",
          ),
        })
        .from("t1")
        .groupBy(
          "t1.id",
          "t1.establishment_name",
          "t1.teacher_name",
          "t1.teacher_uuid",
          "t1.is_custom_planification",
          "t1.ephemeris_id",
        ),
    );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropViewIfExists("reports_situations");
  await knex.schema.dropViewIfExists("reports_ephemeris");
};
