class CourseRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findByEstablishmentId(establishmentId) {
    return this.connection
      .select(
        'course.*',
        'grade.level',
        'letter.character'
      )
      .from('course')
      .innerJoin('grade', 'course.grade_id', 'grade.id')
      .innerJoin('letter', 'course.letter_id', 'letter.id')
      .where('course.establishment_id', establishmentId)
      .orderBy(['grade.id', 'letter.id']);
  }


  async findGradesByEstablishment(establishmentId) {
    return this.connection
      .select('grade.id', 'grade.level')
      .from('course')
      .innerJoin('grade', 'course.grade_id', 'grade.id')
      .innerJoin('letter', 'course.letter_id', 'letter.id')
      .where('course.establishment_id', establishmentId)
      .groupBy('grade.level', 'grade.id');
  }

  async findCourseGradeByTeacher(teacherUUID) {
    return this.connection
      .select(
        'grade.level',
        'letter.character',
        'public.user.name'
      )
      .from('course')
      .innerJoin('grade', 'course.grade_id', 'grade.id')
      .innerJoin('letter', 'course.letter_id', 'letter.id')
      .leftJoin('public.user', 'course.teacher_id', 'public.user.id')
      .where('public.user.uuid', teacherUUID)
      .first();
  }

  async findById(pk) {
    return this.connection
      .select(
        'course.*',
        'grade.level',
        'letter.character'
      )
      .from('course')
      .innerJoin('grade', 'course.grade_id', 'grade.id')
      .innerJoin('letter', 'course.letter_id', 'letter.id')
      .where('course.id', pk)
      .first();
  }

  async findOrCreate(establishmentId, gradeId, letterId) {
    const result = await this.findOneByEstablishmentAndGradeAndLetter(
      establishmentId,
      gradeId,
      letterId
    );

    if (result) {
      return result;
    }

    return this.create(establishmentId, gradeId, letterId);
  }

  findOneByEstablishmentAndGradeAndLetter(establishmentId, gradeId, letterId) {
    return this.connection
      .select()
      .from('course')
      .where('establishment_id', establishmentId)
      .where('grade_id', gradeId)
      .where('letter_id', letterId)
      .first();
  }

  findByGradeLetterEstablishment(grade, letter, establishmentId) {
    return this.connection
      .select('course.*')
      .from('course')
      .innerJoin('grade', 'course.grade_id', 'grade.id')
      .innerJoin('letter', 'course.letter_id', 'letter.id')
      .where('course.establishment_id', establishmentId)
      .where('grade.level', grade)
      .where('letter.character', letter)
      .first();
  }

  findByEstablishmentAndGrade(establishmentId, gradeId) {
    return this.connection
      .column({
        id: 'course.id',
        label: 'grade.level',
        letter: 'letter.character'
      })
      .from('course')
      .innerJoin('grade', 'course.grade_id', 'grade.id')
      .innerJoin('letter', 'course.letter_id', 'letter.id')
      .where('course.establishment_id', establishmentId)
      .where('course.grade_id', gradeId)
      .orderBy(['grade.id', 'letter.id']);
  }

  async create(establishmentId, gradeId, letterId) {
    const fields = {
      establishment_id: establishmentId,
      grade_id: gradeId,
      letter_id: letterId
    };

    const [result] = await this.connection
      .insert(fields, ['*'])
      .into('course');

    await this._createCourseUnits(result.id, gradeId);

    return result;
  }

  async _createCourseUnits(courseId, gradeId) {
    const units = await this.connection
      .select()
      .from('unit')
      .where('grade_id', gradeId);

    for (const unit of units) {
      await this._linkCourseWithUnit(unit.id, courseId);
    }
  }

  async _linkCourseWithUnit(unitId, courseId) {
    const record = await this.connection
      .select()
      .from('course_unit')
      .where('course_id', courseId)
      .where('unit_id', unitId)
      .first();

    if (record) {
      return;
    }

    const fields = {
      course_id: courseId,
      unit_id: unitId
    };

    return this.connection.insert(fields).into('course_unit');
  }

  updateTeacher(teacherId, courseId) {
    return this.connection('course')
      .where('id', courseId)
      .update('teacher_id', teacherId);
  }

  findByTeacher(teacherId) {
    return this.connection
      .select()
      .from('course')
      .where('teacher_id', teacherId)
      .first();
  }

  findByStudent(studentId) {
    return this.connection
      .select('course.*')
      .from('course')
      .innerJoin('course_student', 'course_student.course_id', 'course.id')
      .where('course_student.student_id', studentId)
      .first();
  }
}

module.exports = CourseRepository;
