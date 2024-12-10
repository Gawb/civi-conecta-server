class LessonRepository {
  constructor(connection) {
    this.connection = connection;
  }

  findById(lessonId) {
    return this.connection
      .column({
        id: "lesson.id",
        number: "lesson.number",
        unit_number: "unit.number",
        title: "unit.title",
        date: "event.date",
        grade: "grade.level",
        objective: "lesson.objective",
        topic: "planning.topic",
        start_activity: "planning.start_activity",
        main_activity: "planning.main_activity",
        end_activity: "planning.end_activity",
        teacher_material: "planning.teacher_material",
        student_material: "planning.student_material",
        keywords: "planning.keywords",
      })
      .from("lesson")
      .innerJoin("planning", "planning.lesson_id", "lesson.id")
      .leftJoin("unit", "lesson.unit_id", "unit.id")
      .leftJoin("grade", "unit.grade_id", "grade.id")
      .leftJoin("event", "lesson.event_id", "event.id")
      .where("lesson.id", lessonId)
      .first();
  }

  async create(payload) {
    const fields = {
      number: payload.number,
      objective: payload.objective,
      description: payload.description,
      unit_id: payload.unitId,
      event_id: payload.eventId,
    };

    const [result] = await this.connection.insert(fields, ["*"]).into("lesson");

    return result;
  }

  async findFTPDataById(lessonId) {
    const lesson = await this.connection
      .select()
      .from("lesson")
      .where("id", lessonId)
      .first();

    return lesson.unit_id
      ? this._findGradeDataByUnit(lessonId)
      : this._findGradeDataByEvent(lessonId);
  }

  _findGradeDataByUnit(lessonId) {
    return this.connection
      .column({
        alias: "grade.alias",
        unit_number: "unit.number",
        lesson_number: "lesson.number",
      })
      .from("lesson")
      .innerJoin("unit", "lesson.unit_id", "unit.id")
      .innerJoin("grade", "unit.grade_id", "grade.id")
      .where("lesson.id", lessonId)
      .first();
  }

  _findGradeDataByEvent(lessonId) {
    return this.connection
      .column({
        alias: "grade.alias",
        event_number: "event.id",
      })
      .from("lesson")
      .innerJoin("event", "lesson.event_id", "event.id")
      .innerJoin("grade", "event.grade_id", "grade.id")
      .where("lesson.id", lessonId)
      .first();
  }

  async deleteById(lessonId) {
    await this.connection("document").where("lesson_id", lessonId).del();

    return this.connection("lesson").where("id", lessonId).del();
  }

  async countAssociatedLessonsByUnitId(unitId) {
    const results = await this.connection
      .count({ quantity: "lesson.id" })
      .from("lesson")
      .where("unit_id", unitId)
      .first();

    return Number.parseInt(results.quantity);
  }

  findByUnitId(unitId) {
    return this.connection
      .select()
      .from("lesson")
      .where("unit_id", unitId)
      .orderBy("id");
  }

  findByUnitIdAndTeacherUUID(unitId, uuid) {
    const raw = this.connection.raw.bind(this.connection);

    return this.connection
      .select("lesson.*")
      .column({
        has_entered_into_lesson: raw(
          "CASE WHEN course.id IS NULL THEN 0 ELSE 1 END",
        ),
      })
      .from("unit")
      .innerJoin("lesson", "lesson.unit_id", "unit.id")
      .leftJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
      .leftJoin("course", "lesson_course.course_id", "course.id")
      .leftJoin("public.user", "course.teacher_id", "public.user.id")
      .where("unit.id", unitId)
      .whereRaw("(public.user.uuid = ? OR public.user.uuid IS NULL)", [uuid])
      .orderBy("lesson.id");
  }

  findByEventId(eventId) {
    return this.connection
      .select("lesson.*")
      .column({ date: "event.date" })
      .from("lesson")
      .innerJoin("event", "lesson.event_id", "event.id")
      .where("event_id", eventId)
      .first();
  }

  async updatePlanning(data, lessonId) {
    const planningFields = {
      topic: data.topic,
      student_material: data.studentMaterials.join(","),
      teacher_material: data.teacherMaterials.join(","),
      start_activity: data.startActivity,
      main_activity: data.mainActivity,
      end_activity: data.endActivity,
    };

    if (data.keywords) {
      planningFields.keywords = data.keywords.join(",");
    }

    const lessonFields = {
      description: data.description,
      objective: data.objective,
    };

    const updatePlanning = this.connection("planning")
      .where("lesson_id", lessonId)
      .update(planningFields);

    const updateLesson = this.connection("lesson")
      .where("id", lessonId)
      .update(lessonFields);

    await Promise.all([updatePlanning, updateLesson]);

    if (data.date) {
      const event = await this.connection
        .select("event.id")
        .from("lesson")
        .innerJoin("event", "lesson.event_id", "event.id")
        .where("lesson.id", lessonId)
        .first();

      await this.connection("event")
        .where("id", event.id)
        .update("date", data.date);
    }
  }

  findLessonCompletionByTeacherCourse(teacherUUID, unitId) {
    const ref = this.connection.ref.bind(this.connection);
    const raw = this.connection.raw.bind(this.connection);

    return this.connection
      .column({
        id: "lesson.id",
        number: "lesson.number",
        objective: "lesson.objective",
        description: "lesson.description",
        topic: "planning.topic",
        planning_id: "planning.id",
        has_finished: raw("COALESCE(lesson_course.has_finished, 0)"),
        has_downloaded_content: raw(
          "COALESCE(lesson_course.has_downloaded_content, 0)",
        ),
      })
      .from(ref("user").as("teacher"))
      .innerJoin("course", "course.teacher_id", "teacher.id")
      .innerJoin("unit", "unit.grade_id", "course.grade_id")
      .innerJoin("lesson", "lesson.unit_id", "unit.id")
      .innerJoin("planning", "planning.lesson_id", "lesson.id")
      .leftJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
      .where("teacher.uuid", teacherUUID)
      .where("unit.id", unitId);
  }

  findEventLessonCompletionByTeacherCourse(teacherUUID, eventTypeId) {
    const ref = this.connection.ref.bind(this.connection);
    const raw = this.connection.raw.bind(this.connection);

    return this.connection
      .with(
        "t1",
        this.connection
          .select({
            id: "lesson.id",
            number: "lesson.number",
            title: "event.title",
            objective: "lesson.description",
            event_date: "event.date",
            planning_id: "planning.id",
            topic: "planning.topic",
            has_finished: raw("COALESCE(lesson_course.has_finished, 0)"),
            has_downloaded_content: raw(
              "COALESCE(lesson_course.has_downloaded_content, 0)",
            ),
          })
          .from(ref("user").as("teacher"))
          .innerJoin("course", "course.teacher_id", "teacher.id")
          .innerJoin("event", "event.grade_id", "course.grade_id")
          .innerJoin("lesson", "lesson.event_id", "event.id")
          .innerJoin("planning", "planning.lesson_id", "lesson.id")
          .leftJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
          .where("teacher.uuid", teacherUUID)
          .where("event.event_type_id", eventTypeId),
      )
      .select("*")
      .from("t1")
      .orderBy("has_finished", "desc");
  }
}

module.exports = LessonRepository;
