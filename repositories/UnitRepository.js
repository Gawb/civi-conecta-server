class UnitRepository {
  constructor(connection) {
    this.connection = connection;
  }

  findById(id) {
    return this.connection.select().from("unit").where("id", id).first();
  }

  findByIdWithData(id) {
    return this.connection
      .column({
        id: "unit.id",
        number: "unit.number",
        title: "unit.title",
        description: "unit.description",
        objective: "unit.objective",
        lesson_id: "lesson.id",
        lesson_number: "lesson.number",
        lesson_objective: "lesson.objective",
        lesson_description: "lesson.description",
        planning_id: "planning.id",
        planning_topic: "planning.topic",
        planning_keywords: "planning.keywords",
        planning_start_activity: "planning.start_activity",
        planning_main_activity: "planning.main_activity",
        planning_end_activity: "planning.end_activity",
        planning_teacher_material: "planning.teacher_material",
        planning_student_material: "planning.student_material",
      })
      .from("unit")
      .leftJoin("lesson", "lesson.unit_id", "unit.id")
      .leftJoin("planning", "planning.lesson_id", "lesson.id")
      .where("unit.id", id);
  }

  findByGradeId(gradeId) {
    return this.connection
      .select()
      .from("unit")
      .where("grade_id", gradeId)
      .orderBy("id");
  }

  findOneByNumberAndGradeId(number, gradeId) {
    return this.connection
      .select()
      .from("unit")
      .where("grade_id", gradeId)
      .where("number", number)
      .first();
  }

  async findByTeacherAlias(uuid) {
    return this.connection
      .select("unit.*")
      .from("course")
      .innerJoin("user", "course.teacher_id", "user.id")
      .innerJoin("grade", "course.grade_id", "grade.id")
      .innerJoin("unit", "grade.id", "unit.grade_id")
      .where("user.uuid", uuid);
  }

  async create({ number, title, description, gradeId, objective }) {
    const fields = {
      number,
      title,
      description,
      grade_id: gradeId,
      objective,
    };

    const [result] = await this.connection.insert(fields, ["*"]).into("unit");

    await this._createUnitCourse(result.id);

    return result;
  }

  async _createUnitCourse(unitId) {
    const units = await this.connection
      .select()
      .from("unit")
      .where("id", unitId)
      .orderBy("id");

    for (const unit of units) {
      const courses = await this.connection
        .select()
        .from("course")
        .where("grade_id", unit.grade_id)
        .orderBy("id");

      for (const course of courses) {
        await this._findOrCreate(course.id, unit.id);
      }
    }
  }

  async _findOrCreate(courseId, unitId) {
    const result = await this.connection
      .select()
      .from("course_unit")
      .where("course_id", courseId)
      .where("unit_id", unitId)
      .first();

    if (result) {
      return;
    }

    return this.connection
      .insert({
        unit_id: unitId,
        course_id: courseId,
      })
      .into("course_unit");
  }

  async update(title, description, unitId) {
    const fields = { title, description };

    const [entity] = await this.connection("unit")
      .where("id", unitId)
      .update(fields, ["*"]);

    return entity;
  }

  remove(unitId) {
    return this.connection("unit").where("id", unitId).del();
  }

  findUnitCompletionByTeacherCourse(uuid) {
    const ref = this.connection.ref.bind(this.connection);
    const raw = this.connection.raw.bind(this.connection);

    return this.connection
      .column({
        id: "unit.id",
        number: "unit.number",
        title: "unit.title",
        lessons_finished: raw("COUNT(lesson_course.has_finished)"),
        total_lessons: raw("COUNT(lesson.id)"),
      })
      .from(ref("user").as("teacher"))
      .innerJoin("course", "course.teacher_id", "teacher.id")
      .innerJoin("unit", "unit.grade_id", "course.grade_id")
      .innerJoin("lesson", "lesson.unit_id", "unit.id")
      .leftJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
      .where("teacher.uuid", uuid)
      .groupBy("unit.id")
      .orderBy("unit.id");
  }
}

module.exports = UnitRepository;
