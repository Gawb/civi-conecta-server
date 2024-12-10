const express = require("express");
const handlers = require("./controller");
const middlewares = require("../../middlewares/authentication");
const router = express.Router();

router.get("/", middlewares.verifyAdminRole, handlers.getEstablishments);
router.post("/", middlewares.verifyAdminRole, handlers.createEstablishment);
router.get(
  "/:establishmentId/courses",
  middlewares.verifyManagerRole,
  handlers.getCoursesFromEstablishment,
);
router.get(
  "/manager/:managerId/courses",
  middlewares.verifyManagerRole,
  handlers.getCoursesByManager,
);
router.post(
  "/:establishmentId/courses",
  middlewares.verifyAdminRole,
  handlers.createCourse,
);
router.post(
  "/:establishmentId/managers",
  middlewares.verifyAdminRole,
  handlers.createManager,
);
router.get(
  "/:establishmentId/teachers",
  middlewares.verifyAdminRole,
  handlers.getTeachersFromEstablishment,
);
router.get(
  "/:establishmentId/managers",
  middlewares.verifyAdminRole,
  handlers.getManagerFromEstablishment,
);
router.delete(
  "/student/:studentId",
  middlewares.verifyAdminRole,
  handlers.removeStudent,
);
router.put(
  "/student/:studentId",
  middlewares.verifyAdminRole,
  handlers.updateStudent,
);

router.get(
  "/:establishmentId/grades/:gradeId",
  handlers.getEstablishmentGrades,
);
router.put(
  "/:number/courses/teacher",
  middlewares.verifyAdminRole,
  handlers.updateTeacherToCourse,
);
router.put(
  "/:number/courses",
  middlewares.verifyAdminRole,
  handlers.updateCoursesEstablishment,
);
router.put(
  "/:id/status/:status",
  middlewares.verifyAdminRole,
  handlers.updateEstablishmentStatus,
);
router.get("/info/:uuid", handlers.getProfile);
router.get(
  "/:establishmentId/course/:courseId/teachers",
  handlers.getTeacherInfo,
);

module.exports = router;
