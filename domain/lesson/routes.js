const { Router } = require("express");
const handlers = require("./controller");
const router = Router();

router.get("/:lessonId", handlers.getLessonById);
router.get("/event/:eventId", handlers.getLessonByEventId);
router.post("/", handlers.createLesson);
router.delete("/:lessonId", handlers.deleteLesson);
router.put("/:lessonId/action/:action", handlers.notifyLessonAction);
router.put("/:lessonId", handlers.updateLesson);
router.post("/:lessonId/files", handlers.createDocument);
router.put("/:lessonId/files/:id", handlers.editDocument);
router.delete("/:lessonId/files/:id", handlers.removeDocument);

module.exports = router;
