const { RoleTypes } = require("../constants/entities");

class EstablishmentRepository {
  constructor(
    connection,
    {
      courseRepository,
      courseStudentRepository,
      studentRepository,
      userRepository,
      courseUnitRepository,
    },
  ) {
    this.connection = connection;
    this.courseRepository = courseRepository;
    this.courseStudentRepository = courseStudentRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.courseUnitRepository = courseUnitRepository;
  }

  findAll() {
    return this.connection.select().from("establishment").orderBy("id");
  }

  async create({ name }) {
    const [result] = await this.connection
      .insert({ name }, ["*"])
      .into("establishment");

    return result;
  }

  async update(number, courses) {
    const [resultGrades, resultLetters] = await Promise.all([
      this.connection.select().from("grade").orderBy("id"),
      this.connection.select().from("letter").orderBy("id"),
    ]);
    const grades = new Map();
    const letters = new Map();

    resultGrades.forEach((g) => grades.set(g.level, g.id));
    resultLetters.forEach((l) => letters.set(l.character, l.id));

    for (const course of courses) {
      const courseGrade = course.grade;

      for (const letter of course.letters) {
        const course = await this.courseRepository.findOrCreate(
          number,
          grades.get(courseGrade),
          letters.get(letter.character),
        );
        await this.courseUnitRepository.findOrCreateByCourseId(course.id);
        await this.courseStudentRepository.deleteByCourseId(course.id);

        for (const student of letter.students) {
          const _student = await this.studentRepository.findOrCreate(student);

          await this.courseStudentRepository.create({
            courseId: course.id,
            studentId: _student.id,
          });
        }
      }
    }
  }

  async findByManager(uuid) {
    return this.connection
      .column({
        establishment_name: "establishment.name",
        establishment_id: "establishment.id",
      })
      .from("establishment_manager")
      .innerJoin(
        "public.user",
        "establishment_manager.manager_id",
        "public.user.id",
      )
      .innerJoin(
        "establishment",
        "establishment_manager.establishment_id",
        "establishment.id",
      )
      .where("public.user.uuid", uuid)
      .first();
  }

  getInfoByTeacher(uuid) {
    return this.connection
      .column({
        establishment_name: "establishment.name",
        grade: "grade.level",
        letter: "letter.character",
        grade_id: "grade.id",
      })
      .from("user")
      .innerJoin("course", "course.teacher_id", "user.id")
      .innerJoin("grade", "course.grade_id", "grade.id")
      .innerJoin("letter", "course.letter_id", "letter.id")
      .innerJoin("establishment", "course.establishment_id", "establishment.id")
      .where("user.uuid", uuid)
      .first();
  }

  updateActiveStatus(id, status) {
    return this.connection("establishment")
      .where("id", id)
      .update("active", status);
  }

  findTeachersByEstablishment(establishmentId) {
    // eslint-disable-next-line quotes
    const innerQuery =
      "CASE public.user.encrypted_password WHEN 0 THEN public.user.password ELSE '*******' END";

    return this.connection
      .column({
        establishment_name: "establishment.name",
        teacher_name: "public.user.name",
        teacher_email: "public.user.email",
        passwd: this.connection.raw(innerQuery),
        grade: "grade.level",
        letter: "letter.character",
      })
      .from("establishment")
      .innerJoin("course", "course.establishment_id", "establishment.id")
      .innerJoin("public.user", "course.teacher_id", "public.user.id")
      .innerJoin("grade", "course.grade_id", "grade.id")
      .innerJoin("letter", "course.letter_id", "letter.id")
      .where("establishment.id", establishmentId)
      .where("public.user.role", RoleTypes.USER)
      .where("public.user.active", 1)
      .orderBy("public.user.name");
  }

  findTeachersByEstablishmentAndCourse(establishmentId, courseId) {
    // eslint-disable-next-line quotes
    const innerQuery =
      "CASE public.user.encrypted_password WHEN 0 THEN public.user.password ELSE '*******' END";

    return this.connection
      .column({
        establishment_name: "establishment.name",
        teacher_name: "public.user.name",
        teacher_email: "public.user.email",
        passwd: this.connection.raw(innerQuery),
      })
      .from("establishment")
      .innerJoin("course", "course.establishment_id", "establishment.id")
      .innerJoin("public.user", "course.teacher_id", "public.user.id")
      .where("establishment.id", establishmentId)
      .where("public.user.role", RoleTypes.USER)
      .where("course.id", courseId)
      .where("public.user.active", 1)
      .orderBy("public.user.name");
  }

  async removeStudent(studentId) {
    const feedback = await this.connection
      .select()
      .from("feedback")
      .where("student_id", studentId)
      .first();

    if (feedback) {
      await this.connection("answer").where("feedback_id", feedback.id).del();
      await this.connection("feedback").where("student_id", studentId).del();
    }

    await this.connection("course_student")
      .where("student_id", studentId)
      .del();

    return this.connection("student").where("id", studentId).del();
  }

  updateStudent(firstName, lastName, run, studentId) {
    const fields = {
      name: firstName,
      lastname: lastName,
      run,
    };

    return this.connection("student").where("id", studentId).update(fields);
  }

  addManager(establishmentId, managerId) {
    const fields = {
      manager_id: managerId,
      establishment_id: establishmentId,
    };

    return this.connection.insert(fields).into("establishment_manager");
  }

  findManagers(establishmentId) {
    const ref = this.connection.ref.bind(this.connection);

    return this.connection
      .select("manager.*")
      .from("establishment")
      .innerJoin(
        "establishment_manager",
        "establishment_manager.establishment_id",
        "establishment.id",
      )
      .innerJoin(
        ref("user").as("manager"),
        "establishment_manager.manager_id",
        "manager.id",
      )
      .where("establishment.id", establishmentId)
      .where("manager.role", RoleTypes.MANAGER);
  }
}

module.exports = EstablishmentRepository;
