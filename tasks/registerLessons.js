const repositories = require("../repositories/index.js");

const ERROR_DUPLICATED_PKEY = "23505";

const registerLessons = async (teacherId) => {
  const course = await repositories.course.findByTeacher(teacherId);

  if (!course) {
    console.log("the teacher has no course associated");
    return;
  }

  const lessons = await repositories.lesson.findByCourse(course.id);

  console.log("trying to register lessons for teacher ", teacherId);

  for (const lesson of lessons) {
    try {
      await repositories.lessonCourse.create(course.id, lesson.id);
    } catch (err) {
      if (err.code !== ERROR_DUPLICATED_PKEY) {
        console.log("error", err);
      }
    }
  }

  console.log("done");
};

module.exports = registerLessons;
