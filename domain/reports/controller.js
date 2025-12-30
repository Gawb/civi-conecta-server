const { wrapRequests } = require("../../helpers/controller");
const { EventTypes, RoleTypes } = require("../../constants/entities");
const ReportService = require("./service");

const resolveEstablishment = async (managerUUID, req) => {
  let establishment = await repositories.establishment.findByManager(managerUUID);
  if (!establishment && req.user.role === RoleTypes.ADMIN) {
    const establishments = await repositories.establishment.findAll();
    if (establishments.length) {
      establishment = {
        establishment_id: establishments[0].id,
        establishment_name: establishments[0].name,
      };
    }
  }
  return establishment;
};
const repositories = require("../../repositories");
const dto = require("./dto");

const checkStudentCompletion = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const reportService = new ReportService();
  const report =
    await reportService.checkStudentCompletionByTeacherUUID(teacherUUID);
  res.json({ ok: true, report });
};

const checkStudentAnswers = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const results = await repositories.report.getStudentAnswers(teacherUUID);

  res.json({ ok: true, results: dto.getStudentAnswers(results) });
};

const checkStudentAnswersByQuestion = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const questionId = req.params.questionId;
  const results = await repositories.report.getStudentAnswers(
    teacherUUID,
    questionId,
  );

  res.json({ ok: true, results: dto.getStudentAnswers(results) });
};

const checkMostCriticalAnswers = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const results =
    await repositories.report.getMostCriticalStudentAnswers(teacherUUID);
  res.json({ ok: true, results: dto.getMostCriticalAnswers(results) });
};

const getUnitsOrder = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const teacher = await repositories.user.findByAlias(teacherUUID);
  const course = await repositories.course.findByTeacher(teacher.id);
  const results = await repositories.report.getUnitOrder(course.id);
  res.json({ ok: true, results: dto.getUnitsOrder(results) });
};

const getSurveysReports = async (req, res) => {
  const uuid = req.params.managerUUID;
  const gradeId = req.params.gradeId;
  const establishment = await resolveEstablishment(uuid, req);

  if (!establishment) {
    return res.json({ ok: true, results: [] });
  }

  const surveyResults = await repositories.report.getSurveyResults(
    establishment.establishment_id,
    gradeId,
  );

  res.json({ ok: true, results: surveyResults.map(dto.mapSurvey) });
};

const checkCourseCompletion = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const courseResume =
    await repositories.course.findCourseGradeByTeacher(teacherUUID);
  const reportService = new ReportService();
  const report =
    await reportService.checkStudentCompletionByTeacherUUID(teacherUUID);
  res.json({ ok: true, report, courseResume });
};

const checkUnitsCompletion = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const results =
    await repositories.unit.findUnitCompletionByTeacherCourse(teacherUUID);
  const courseResume =
    await repositories.course.findCourseGradeByTeacher(teacherUUID);
  res.json({
    ok: true,
    results: dto.mapUnitCompletion(results),
    courseResume,
  });
};

const checkLessonsCompletion = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const unitId = req.params.unitId;
  const results = await repositories.lesson.findLessonCompletionByTeacherCourse(
    teacherUUID,
    unitId,
  );
  res.json({ ok: true, results: dto.mapLessonCompletion(results) });
};

const checkEventsCompletion = async (req, res) => {
  const managerUUID = req.params.managerUUID;
  const eventType = req.params.eventType;
  const gradeId = req.params.gradeId;
  const establishment = await resolveEstablishment(managerUUID, req);
  let results = [];

  if (establishment) {
    if (eventType === EventTypes.SITUATION_TEXT) {
      results = await repositories.report.getReportsSituationByEstablishment(
        establishment.establishment_id,
        gradeId,
      );
    } else if (eventType === EventTypes.EPHEMERIS_TEXT) {
      results = await repositories.report.getReportsEphemerisByEstablishment(
        establishment.establishment_id,
        gradeId,
      );
    }
  }

  res.json({ ok: true, eventType, results: dto.mapEvents(results, eventType) });
};

const getPlanningUnitsReports = async (req, res) => {
  const managerUUID = req.user.uuid;
  const gradeId = req.params.gradeId;
  const establishment = await resolveEstablishment(managerUUID, req);
  let report = null;

  if (establishment) {
    const reportService = new ReportService();
    report = await reportService.findPlanningAndUnitsReportByEstablishment(
      establishment.establishment_id,
      gradeId,
    );
  }

  res.json({ ok: true, report });
};

const checkLessonsEventsCompletion = async (req, res) => {
  const teacherUUID = req.params.teacherUUID;
  const eventType = req.params.eventType;
  const eventTypeId =
    eventType === EventTypes.SITUATION_TEXT
      ? EventTypes.SITUATION
      : EventTypes.EPHEMERIS;

  const courseSummary =
    await repositories.course.findCourseGradeByTeacher(teacherUUID);

  const results =
    await repositories.lesson.findEventLessonCompletionByTeacherCourse(
      teacherUUID,
      eventTypeId,
    );

  res.json({
    ok: true,
    results: dto.mapLessonCompletion(results),
    courseSummary,
  });
};

module.exports = wrapRequests({
  checkStudentCompletion,
  checkStudentAnswers,
  checkStudentAnswersByQuestion,
  checkMostCriticalAnswers,
  getUnitsOrder,
  getSurveysReports,
  checkCourseCompletion,
  checkUnitsCompletion,
  checkLessonsCompletion,
  checkEventsCompletion,
  getPlanningUnitsReports,
  checkLessonsEventsCompletion,
});
