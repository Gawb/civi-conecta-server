const { SurveyTypes, FeedbackStatus } = require('../constants/entities');

class FeedbackRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findProgressByTeacher(uuid) {
    return this.connection
      .with('teacher_answers', (qb) => {
        qb
          .select('user.name')
          .count({ quantity: 'answers_by_person.id' })
          .from('answers_by_person')
          .innerJoin('user', 'answers_by_person.teacher_id', 'user.id')
          .where('answers_by_person.uuid', uuid);
      })
      .column({
        total: 'questions_quantity.quantity',
        completed_by_teacher: 'teacher_answers.quantity',
        name: 'teacher_answers.name'
      })
      .from('questions_quantity')
      .innerJoin('teacher_answers')
      .where('questions_quantity.type', SurveyTypes.TEACHER)
      .first();
  }

  async findProgressByStudent(uuid) {
    return this.connection
      .select(
        'student.name',
        'student.lastname',
        'student.run'
      )
      .count({ quantity: 'answers_by_person.id' })
      .column({ total: 'questions_quantity.quantity' })
      .from('feedback_course')
      .innerJoin('feedback', 'feedback.feedback_course_id', 'feedback_course.id')
      .innerJoin('student', 'feedback.student_id', 'student.id')
      .leftJoin('answers_by_person', 'answers_by_person.student_id', 'student.id')
      .innerJoin('questions_quantity')
      .where('feedback_course.uuid', uuid)
      .where('questions_quantity.type', SurveyTypes.STUDENT)
      .groupBy('student.run')
      .orderBy('student.run');
  }

  checkStatusByTeacherAlias(aliasId) {
    return this.connection
      .column({
        uuid: 'feedback_course.uuid',
        is_finished: 'feedback_course.is_finished',
        created_at: 'feedback_course.created_at',
        teacher_finished: 'feedback.is_finished'
      })
      .from('feedback_course')
      .innerJoin('feedback', 'feedback.feedback_course_id', 'feedback_course.id')
      .innerJoin('user', 'feedback.teacher_id', 'user.id')
      .where('user.uuid', aliasId)
      .first();
  }

  async checkStudentStatusByTeacherAlias(aliasId) {
    const _this = this;
    const no = "'no'"; // eslint-disable-line quotes
    const yes = "'yes'"; // eslint-disable-line quotes

    const results = await this.connection
      .count({ quantity: 'feedback.id' })
      .column({ completed: this.connection.raw(no) })
      .from('feedback')
      .innerJoin('feedback_course', 'feedback.feedback_course_id', 'feedback_course.id')
      .innerJoin('course', 'feedback_course.course_id', 'course.id')
      .innerJoin('public.user', 'course.teacher_id', 'public.user.id')
      .where('public.user.uuid', aliasId)
      .whereNotNull('feedback.student_id')
      .where('feedback.is_finished', FeedbackStatus.NOT_FINISHED)
      .union(function() {
        this
          .count({ quantity: 'feedback.id' })
          .column({ completed: _this.connection.raw(yes) })
          .from('feedback')
          .innerJoin('feedback_course', 'feedback.feedback_course_id', 'feedback_course.id')
          .innerJoin('course', 'feedback_course.course_id', 'course.id')
          .innerJoin('public.user', 'course.teacher_id', 'public.user.id')
          .where('public.user.uuid', aliasId)
          .whereNotNull('feedback.student_id')
          .where('feedback.is_finished', FeedbackStatus.FINISHED);
      });

    return results;
  }

  findByTypeAndAlias(type, alias) {
    const builder = this.connection
      .select('feedback.*', 'feedback_course.uuid')
      .from('feedback')
      .innerJoin('feedback_course', 'feedback.feedback_course_id', 'feedback_course.id');

    if (type === SurveyTypes.STUDENT) {
      builder.innerJoin('student', 'feedback.student_id', 'student.id');
      builder.where('student.uuid', alias);
    } else {
      builder.innerJoin('user', 'feedback.teacher_id', 'user.id');
      builder.where('user.uuid', alias);
    }

    return builder.first();
  }

  findBySurveyAliasAndTypeAndAlias(surveyAlias, type, userAlias) {
    const builder = this.connection
      .select('feedback.*')
      .from('feedback_course')
      .innerJoin('feedback', 'feedback.feedback_course_id', 'feedback_course.id');

    if (type === SurveyTypes.TEACHER) {
      builder.innerJoin('user', 'feedback.teacher_id', 'user.id');
      builder.where('user.uuid', userAlias);
    } else {
      builder.innerJoin('student', 'feedback.student_id', 'student.id');
      builder.where('student.uuid', userAlias);
    }

    return builder
      .where('feedback_course.uuid', surveyAlias)
      .first();
  }

  async finishSurvey(surveyType, uuid) {
    const personId = await this._getPersonId(surveyType, uuid);
    const lookupField = surveyType === SurveyTypes.TEACHER ? 'teacher_id' : 'student_id';
    const isForStudent = surveyType === SurveyTypes.STUDENT ? 1 : 0;

    const questionCount = await this.connection
      .count({ 'qty': 'question.id' })
      .from('feedback')
      .innerJoin('feedback_course', 'feedback.feedback_course_id', 'feedback_course.id')
      .innerJoin('course', 'feedback_course.course_id', 'course.id')
      .innerJoin('unit', 'unit.grade_id', 'course.grade_id')
      .innerJoin('question', 'question.unit_id', 'unit.id')
      .where(`feedback.${lookupField}`, personId)
      .where('question.is_for_student', isForStudent)
      .first();

    const answerCount = await this.connection
      .count({ 'qty': 'answer.id' })
      .from('feedback')
      .innerJoin('answer', 'answer.feedback_id', 'feedback.id')
      .where(`feedback.${lookupField}`, personId)
      .first();

    const questionQuantity = Number.parseInt(questionCount.qty);
    const answerQuantity = Number.parseInt(answerCount.qty);

    if (answerQuantity < questionQuantity) {
      return;
    }

    return this.connection('feedback')
      .where(lookupField, personId)
      .update('is_finished', FeedbackStatus.FINISHED);
  }

  async checkCurrentSurveyCompletion(uuid) {
    // eslint-disable-next-line quotes
    const raw = "CASE feedback.is_finished WHEN 1 THEN 'yes' ELSE 'no' END";

    return this.connection
      .column({
        quantity: this.connection.raw('COUNT(feedback.id)'),
        is_finished: this.connection.raw(raw)
      })
      .from('feedback_course')
      .leftJoin('feedback', 'feedback_course.id', 'feedback.feedback_course_id')
      .where('feedback_course.uuid', uuid)
      .groupBy('feedback.is_finished');
  }

  async finishSurveyCompletely(uuid) {
    const feedbackCourse = await this.connection
      .select('id')
      .from('feedback_course')
      .where('uuid', uuid)
      .first();

    return this._closeSurvey(feedbackCourse.id);
  }

  async _closeSurvey(id) {
    await this.connection('feedback')
      .where('feedback_course_id', id)
      .update('is_finished', FeedbackStatus.FINISHED);

    return this.connection('feedback_course')
      .where('id', id)
      .update('is_finished', FeedbackStatus.FINISHED);
  }

  async _getPersonId(surveyType, uuid) {
    const tableName = surveyType === SurveyTypes.TEACHER ? 'user' : 'student';
    const result = await this.connection
      .select()
      .from(tableName)
      .where('uuid', uuid)
      .first();

    return result.id;
  }

  checkStudentStatusByRut(rut) {
    return this.connection
      .select('feedback.*')
      .from('student')
      .innerJoin('feedback', 'feedback.student_id', 'student.id')
      .where('student.run', rut)
      .orderBy('feedback.id', 'desc')
      .first();
  }
}

module.exports = FeedbackRepository;
