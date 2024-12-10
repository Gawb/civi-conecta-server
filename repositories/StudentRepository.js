const { randomUUID } = require("node:crypto");

class StudentRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findOrCreate(student) {
    const result = await this.findByRun(student.run);

    if (result) {
      return result;
    }

    return this.create(student);
  }

  findByRun(run) {
    return this.connection.select().from("student").where("run", run).first();
  }

  async create(student) {
    const fields = {
      name: student.name,
      lastname: student.lastname,
      run: student.run,
      uuid: randomUUID(),
    };

    const [result] = await this.connection
      .insert(fields, ["*"])
      .into("student");

    return result;
  }

  async findByCourse(courseId) {
    return this.connection
      .select("student.*")
      .from("student")
      .innerJoin("course_student", "course_student.student_id", "student.id")
      .innerJoin("course", "course_student.course_id", "course.id")
      .where("course.id", courseId);
  }

  async findGradeByRun(run) {
    const result = await this.connection
      .select("course.grade_id")
      .from("student")
      .innerJoin("course_student", "course_student.student_id", "student.id")
      .innerJoin("course", "course_student.course_id", "course.id")
      .where("student.run", run)
      .first();

    return result?.grade_id;
  }
}

module.exports = StudentRepository;
