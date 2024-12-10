const { Router } = require("express");
const handlers = require("./controller");
const router = Router();

router.get("/student-completion/:teacherUUID", handlers.checkStudentCompletion);
router.get(
  "/student-answers/:teacherUUID/critical-answers",
  handlers.checkMostCriticalAnswers,
);
router.get(
  "/student-answers/:teacherUUID/:questionId",
  handlers.checkStudentAnswersByQuestion,
);
router.get("/student-answers/:teacherUUID", handlers.checkStudentAnswers);
router.get("/units-order/:teacherUUID", handlers.getUnitsOrder);
router.get(
  "/teachers-surveys/:managerUUID/:gradeId",
  handlers.getSurveysReports,
);
router.get(
  "/teachers-planning-units/:gradeId",
  handlers.getPlanningUnitsReports,
);
router.get("/course/:teacherUUID/completion", handlers.checkCourseCompletion);
router.get(
  "/course/:teacherUUID/unit-completion",
  handlers.checkUnitsCompletion,
);
router.get(
  "/course/:teacherUUID/unit-completion/:unitId",
  handlers.checkLessonsCompletion,
);

router.get(
  "/course/:gradeId/:eventType/event-completion",
  handlers.checkEventsCompletion,
);
router.get(
  "/course/:teacherUUID/:eventType/completion/lessons",
  handlers.checkLessonsEventsCompletion,
);

module.exports = router;
