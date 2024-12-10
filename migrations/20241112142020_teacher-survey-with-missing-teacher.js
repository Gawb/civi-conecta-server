/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.dropViewIfExists("reports_teachers_survey");

  await knex.schema.createView("reports_teachers_survey", (view) => {
    view.as(
      knex
        .column({
          establishment_id: "establishment.id",
          establishment_name: "establishment.name",
          course_id: "course.id",
          grade_id: "grade.id",
          grade: "grade.level",
          letter: "letter.character",
          teacher_name: "teacher.name",
          teacher_uuid: "teacher.uuid",
          is_custom_planification: "teacher.is_custom_planification",
          is_teacher_survey_finished: "feedback.is_finished",
          is_course_survey_finished: "feedback_course.is_finished",
          is_link_generated: "feedback_course.is_link_generated",
          is_report_downloaded: "feedback_course.is_report_downloaded",
        })
        .from("establishment")
        .innerJoin("course", "course.establishment_id", "establishment.id")
        .innerJoin("grade", "course.grade_id", "grade.id")
        .innerJoin("letter", "course.letter_id", "letter.id")
        .leftJoin(
          knex.ref("user").as("teacher"),
          "course.teacher_id",
          "teacher.id",
        )
        .leftJoin("feedback", "feedback.teacher_id", "course.teacher_id")
        .leftJoin("feedback_course", "feedback_course.course_id", "course.id")
        .orderBy("establishment.id", "course.id"),
    );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropViewIfExists("reports_teachers_survey");
};
