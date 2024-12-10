const { RoleTypes } = require("../constants/entities");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createView("reports_teachers_survey", (view) => {
    view.as(
      knex
        .column({
          teacher_name: "user.name",
          establishment_id: "establishment.id",
          establishment_name: "establishment.name",
          grade: "grade.level",
          letter: "letter.character",
          is_custom_planification: "user.is_custom_planification",
          is_teacher_survey_finished: "feedback.is_finished",
          is_course_survey_finished: "feedback_course.is_finished",
          is_link_generated: "feedback_course.is_link_generated",
          is_report_downloaded: "feedback_course.is_report_downloaded",
        })
        .from("establishment")
        .innerJoin("course", "course.establishment_id", "establishment.id")
        .innerJoin("grade", "course.grade_id", "grade.id")
        .innerJoin("letter", "course.letter_id", "letter.id")
        .rightJoin("user", "course.teacher_id", "user.id")
        .leftJoin("feedback", "feedback.teacher_id", "course.teacher_id")
        .leftJoin("feedback_course", "feedback_course.course_id", "course.id")
        .leftJoin("course_student", "course_student.course_id", "course.id")
        .where("user.role", RoleTypes.USER)
        .groupBy(
          "teacher_name",
          "establishment.id",
          "establishment.name",
          "is_custom_planification",
          "feedback.is_finished",
          "feedback_course.is_finished",
          "is_link_generated",
          "feedback_course.is_report_downloaded",
          "grade.level",
          "letter.character",
        )
        .orderBy("establishment.id", "user.name"),
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
