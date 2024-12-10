const repositories = require('../../repositories');
const { wrapRequests } = require('../../helpers/controller');
const { SurveyTypes } = require('../../constants/entities');
const dto = require('./dto');


const getAll = async (_, res) => {
  const surveys = await repositories.survey.findAll();
  res.json({ ok : true, surveys: dto.mapSurveys(surveys) });
};

const saveSurvey = async (req, res) => {
  const topicId = req.params.topicId;
  const survey = dto.getSurvey(req.body);

  req.logger.info('saving topic with questions %s', survey.title);

  const topic = await repositories.topic.findById(topicId);

  const question = await repositories.question.create({
    description: survey.title,
    topicId: topic.id
  });

  for (const alternative of survey.alternatives) {
    await repositories.alternative.create({
      letter: alternative.label,
      description: alternative.description,
      value: alternative.value,
      questionId: question.id
    });
  }

  res.json({ ok: true, question: dto.mapQuestion(question) });
};

const findById = async (req, res) => {
  const surveyId = req.params.surveyId;
  const survey = await repositories.survey.findOne(surveyId);
  res.json({ ok: true, survey: dto.mapSurvey(survey) });
};

const findByStudentType = async (req, res) => {
  const surveys = await repositories.survey.findByType(SurveyTypes.STUDENT);
  res.json({ ok: true, surveys: dto.mapSurveys(surveys) });
};

const getReport = async (req, res) => {
  const uuid = req.params.uuid;
  const teacher = await repositories.user.findByAlias(uuid);
  const course = await repositories.course.findByTeacher(teacher.id);
  const results = await repositories.survey.getStudentCompletionReport(course.id);

  req.logger.info('getting the student completion report for teacher %s', teacher.name);

  res.json({ ok: true, report: dto.mapStudentAnswerReport(results) });
};

const createStudentsSurvey = async (req, res) => {
  const teacherUUID = req.params.uuid;
  const teacher = await repositories.user.findByAlias(teacherUUID);
  const course = await repositories.course.findByTeacher(teacher.id);
  const students = await repositories.student.findByCourse(course.id);

  await repositories.survey.findOrCreateCourseFeedback(course.id);

  const proms = students.map(student =>
    repositories.survey.createByType(SurveyTypes.STUDENT, student.uuid));

  await Promise.all(proms);

  res.json({ok: true});
};

const createTeacherSurvey = async (req, res) => {
  const teacherUUID = req.params.uuid;
  await repositories.survey.createByType(SurveyTypes.TEACHER, teacherUUID);
  res.json({ ok: true });
};

const updateGeneratedLink = async(req, res) => {
  const teacherUUID = req.params.uuid;
  const feedbackCourseUUUID = await repositories.feedback.findUUIDByTeacher(teacherUUID)
  await repositories.feedback.updateGeneratedLink(feedbackCourseUUUID.uuid);
  res.json({ ok: true })
};

const updateDownloadedReport = async(req, res) => {
  const teacherUUID = req.params.uuid;
  const feedbackCourseUUUID = await repositories.feedback.findUUIDByTeacher(teacherUUID)
  await repositories.feedback.updateDownloadedReport(feedbackCourseUUUID.uuid);
  res.json({ ok: true })
}

module.exports = wrapRequests({
  getAll,
  saveSurvey,
  findById,
  findByStudentType,
  getReport,
  createStudentsSurvey,
  createTeacherSurvey,
  updateGeneratedLink,
  updateDownloadedReport
});
