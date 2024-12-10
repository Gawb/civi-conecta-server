const { randomUUID } = require("node:crypto");
const { SurveyTypes, FeedbackStatus } = require("../constants/entities");

class SurveyRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findAll() {
    return this.connection
      .column({
        id: "survey.id",
        questionId: "question.id",
        question: "question.description",
        letter: "alternative.letter",
        alternative: "alternative.description",
        value: "alternative.value",
      })
      .from("survey")
      .innerJoin("question", "question.survey_id", "survey.id")
      .innerJoin("alternative", "alternative.question_id", "question.id");
  }

  async findOne(id) {
    return this.connection
      .column({
        id: "survey.id",
        questionId: "question.id",
        question: "question.description",
        letter: "alternative.letter",
        alternative: "alternative.description",
        value: "alternative.value",
      })
      .from("survey")
      .innerJoin("question", "question.survey_id", "survey.id")
      .innerJoin("alternative", "alternative.question_id", "question.id")
      .where("survey.id", id)
      .first();
  }

  async findWithDataByTypeAndCourse(type, courseId) {
    const isForStudent = type === "teacher" ? 0 : 1;

    return this.connection
      .column({
        topic_number: "unit.number",
        topic_title: "unit.title",
        question_id: "question.id",
        question_description: "question.description",
        alternative_letter: "alternative.letter",
        alternative_description: "alternative.description",
        alternative_value: "alternative.value",
        alternative_id: "alternative.id",
      })
      .from("course")
      .innerJoin("course_unit", "course_unit.course_id", "course.id")
      .innerJoin("unit", "course_unit.unit_id", "unit.id")
      .innerJoin("question", "question.unit_id", "unit.id")
      .innerJoin("alternative", "alternative.question_id", "question.id")
      .where("course.id", courseId)
      .where("question.is_for_student", isForStudent)
      .orderBy(["question.id", "alternative.id"]);
  }

  async findOrCreate(type, topicId) {
    const entity = await this.findById(type, topicId);

    if (entity) {
      return entity;
    }

    return this.create(type, topicId);
  }

  findById(type, topicId) {
    return this.connection
      .select()
      .from("survey")
      .where("type", type)
      .where("topic_id", topicId)
      .first();
  }

  findByType(type) {
    return this.connection.select().from("survey").where("type", type).first();
  }

  async create(type, topicId) {
    const fields = {
      type,
      topic_id: topicId,
    };

    const [entity] = await this.connection.insert(fields, ["*"]).into("survey");

    return entity;
  }

  deleteByTopicId(topicId) {
    return this.connection("survey").where("topic_id", topicId).del();
  }

  async getStudentCompletionReport(courseId) {
    const subquery = this.connection
      .count("question.id")
      .from("question")
      .where("is_for_student", 1)
      .as("question_count");

    return this.connection
      .select("student.run", "student.name", "student.lastname", subquery)
      .count({ answers: "answer.id" })
      .from("student")
      .innerJoin("feedback", "feedback.student_id", "student.id")
      .innerJoin(
        "feedback_course",
        "feedback.feedback_course_id",
        "feedback_course.id",
      )
      .leftJoin("answer", "answer.feedback_id", "feedback.id")
      .where("feedback_course.course_id", courseId)
      .groupBy("student.run", "student.name")
      .orderBy("student.run");
  }

  createByType(type, alias) {
    if (type === SurveyTypes.STUDENT) {
      return this._createStudentFeedback(alias);
    }

    return this._createTeacherFeedback(alias);
  }

  async _createStudentFeedback(alias) {
    const studentCourse = await this.connection
      .select("course_student.*")
      .from("course_student")
      .innerJoin("student", "course_student.student_id", "student.id")
      .where("student.uuid", alias)
      .first();

    const feedbackCourse = await this.findOrCreateCourseFeedback(
      studentCourse.course_id,
    );
    const feedback = await this._findOrCreateStudentFeedback(
      feedbackCourse.id,
      studentCourse.student_id,
    );

    return feedback;
  }

  async _createTeacherFeedback(alias) {
    const teacher = await this.connection
      .select("id")
      .from("user")
      .where("uuid", alias)
      .first();

    const course = await this.connection
      .select("course.*")
      .from("course")
      .innerJoin("user", "course.teacher_id", "user.id")
      .where("user.uuid", alias)
      .first();

    const courseFeedback = await this.findOrCreateCourseFeedback(course.id);
    const feedback = await this._findOrCreateTeacherFeedback(
      courseFeedback.id,
      teacher.id,
    );

    return feedback;
  }

  async findOrCreateCourseFeedback(courseId) {
    let courseFeedback = await this.connection
      .select()
      .from("feedback_course")
      .where("course_id", courseId)
      .first();

    if (courseFeedback) {
      return courseFeedback;
    }

    const fields = {
      uuid: randomUUID(),
      is_finished: FeedbackStatus.NOT_FINISHED,
      course_id: courseId,
      is_link_generated: 0,
    };

    [courseFeedback] = await this.connection
      .insert(fields, ["*"])
      .into("feedback_course");

    return courseFeedback;
  }

  async _findOrCreateStudentFeedback(feedbackCourseId, studentId) {
    let feedback = await this.connection
      .select()
      .from("feedback")
      .where("student_id", studentId)
      .where("feedback_course_id", feedbackCourseId)
      .first();

    if (feedback) {
      return feedback;
    }

    const fields = {
      student_id: studentId,
      is_finished: FeedbackStatus.NOT_FINISHED,
      feedback_course_id: feedbackCourseId,
    };

    [feedback] = await this.connection.insert(fields, ["*"]).into("feedback");

    return feedback;
  }

  async _findOrCreateTeacherFeedback(courseFeedbackId, teacherId) {
    let feedback = await this.connection
      .select()
      .from("feedback")
      .where("teacher_id", teacherId)
      .where("is_finished", FeedbackStatus.NOT_FINISHED)
      .first();

    if (feedback) {
      return feedback;
    }

    const fields = {
      feedback_course_id: courseFeedbackId,
      teacher_id: teacherId,
      is_finished: FeedbackStatus.NOT_FINISHED,
    };

    [feedback] = await this.connection.insert(fields, ["*"]).into("feedback");

    return feedback;
  }
}

module.exports = SurveyRepository;
