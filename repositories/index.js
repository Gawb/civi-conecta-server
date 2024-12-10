const knex = require("knex");
const knexConfig = require("../knexfile");
const config = require("../config");
const path = require("path");
const fs = require("fs");

const traverseDir = (dir) => {
  const files = fs.readdirSync(dir);
  const cls = {};

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && filePath.includes("Repository")) {
      const match = /\/(?<filename>\w+).js/.exec(filePath);
      cls[match.groups.filename] = require(`./${match.groups.filename}`);
    }
  });

  return cls;
};

const classes = traverseDir("./repositories");
const connection = knex(knexConfig[config.env.nodeEnv]);
const answerRepository = new classes.AnswerRepository(connection);
const eventRepository = new classes.EventRepository(connection);
const courseRepository = new classes.CourseRepository(connection);
const studentRepository = new classes.StudentRepository(connection);
const courseStudentRepository = new classes.CourseStudentRepository(connection);
const userRepository = new classes.UserRepository(connection);
const gradeRepository = new classes.GradeRepository(connection);
const unitRepository = new classes.UnitRepository(connection);
const topicRepository = new classes.TopicRepository(connection);
const planningRepository = new classes.PlanningRepository(connection);
const surveyRepository = new classes.SurveyRepository(connection);
const questionRepository = new classes.QuestionRepository(connection);
const alternativeRepository = new classes.AlternativeRepository(connection);
const documentRepository = new classes.DocumentRepository(connection);
const lessonRepository = new classes.LessonRepository(connection);
const feedbackRepository = new classes.FeedbackRepository(connection);
const reportRepository = new classes.ReportRepository(connection);
const profileRepository = new classes.ProfileRepository(connection);
const courseUnitRepository = new classes.CourseUnitRepository(connection);
const establishmentRepository = new classes.EstablishmentRepository(
  connection,
  {
    courseRepository,
    studentRepository,
    courseStudentRepository,
    userRepository,
    courseUnitRepository,
  },
);
const lessonCourseRepository = new classes.LessonCourseRepository(connection);

const unitOfWork = {
  startTransaction() {},
};

const handler = {
  get: function (obj, prop) {
    let repoName = prop.includes("Repository") ? prop : `${prop}Repository`;
    repoName = repoName.charAt(0).toUpperCase() + repoName.substring(1);

    if (repoName === "EstablishmentRepository") {
      return establishmentRepository;
    }

    return new classes[repoName](connection);
  },
};

const proxy = new Proxy(unitOfWork, handler);

module.exports = {
  uow: proxy,
  user: userRepository,
  grade: gradeRepository,
  unit: unitRepository,
  topic: topicRepository,
  student: studentRepository,
  course: courseRepository,
  courseStudent: courseStudentRepository,
  establishment: establishmentRepository,
  event: eventRepository,
  planning: planningRepository,
  survey: surveyRepository,
  question: questionRepository,
  alternative: alternativeRepository,
  document: documentRepository,
  lesson: lessonRepository,
  feedback: feedbackRepository,
  answer: answerRepository,
  report: reportRepository,
  profile: profileRepository,
  courseUnit: courseUnitRepository,
  lessonCourse: lessonCourseRepository,
};
