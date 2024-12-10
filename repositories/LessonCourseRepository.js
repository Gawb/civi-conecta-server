class LessonCourseRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async createLessonIfNotExists(uuid, lessonId) {
    const courseId = await this._findCourseByTeacherUUID(uuid);

    const exists = await this.connection
      .select()
      .from("lesson_course")
      .where("course_id", courseId)
      .where("lesson_id", lessonId)
      .first();

    if (exists) {
      return;
    }

    const fields = { course_id: courseId, lesson_id: lessonId };
    return this.connection.insert(fields).into("lesson_course");
  }

  async updateDownloadContent(uuid, lessonId) {
    const courseId = await this._findCourseByTeacherUUID(uuid);

    return this.connection("lesson_course")
      .where({ course_id: courseId, lesson_id: lessonId })
      .update("has_downloaded_content", 1);
  }

  async updateFinishLesson(uuid, lessonId) {
    const courseId = await this._findCourseByTeacherUUID(uuid);

    return this.connection("lesson_course")
      .where({ course_id: courseId, lesson_id: lessonId })
      .update("has_finished", 1);
  }

  async _findCourseByTeacherUUID(uuid) {
    const record = await this.connection
      .select("course.id")
      .from("public.user")
      .innerJoin("course", "course.teacher_id", "public.user.id")
      .where("public.user.uuid", uuid)
      .first();

    return record.id;
  }
}

module.exports = LessonCourseRepository;
