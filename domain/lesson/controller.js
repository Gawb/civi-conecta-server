const repositories = require("../../repositories");
const { wrapRequests } = require("../../helpers/controller");
const exceptions = require("../../repositories/exceptions");
const { ActionNotFoundError } = require("./exceptions");
const dto = require("./dto");

const getLessonById = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const [lesson, documents] = await Promise.all([
    repositories.lesson.findById(lessonId),
    repositories.document.findByLesson(lessonId),
  ]);

  if (!lesson) {
    throw new exceptions.EntityNotFoundError("La clase no existe");
  }

  const uuid = req.headers.uuid;
  await repositories.lessonCourse.createLessonIfNotExists(uuid, lessonId);

  res.json({ ok: true, lesson: dto.mapLesson(lesson, documents) });
};

const getLessonByEventId = async (req, res) => {
  const eventId = req.params.eventId;
  const lesson = await repositories.lesson.findByEventId(eventId);
  const documents = await repositories.document.findByLesson(lesson.id);

  if (!lesson) {
    throw new exceptions.EntityNotFoundError("La clase no existe");
  }

  res.json({ ok: true, lesson: dto.mapLesson(lesson, documents) });
};

const createLesson = async (req, res) => {
  const lessonPayload = dto.getLesson(req.body, req.query);
  const planningPayload = dto.getPlanning(req.body);
  const newLesson = await repositories.lesson.create(lessonPayload);
  await repositories.planning.create(planningPayload, newLesson.id);
  const lesson = await repositories.lesson.findById(newLesson.id);
  res.json({ ok: true, lesson: dto.mapLesson(lesson) });
};

const deleteLesson = async (req, res) => {
  const lessonId = req.params.lessonId;
  await repositories.planning.deleteByLessonId(lessonId);
  await repositories.lesson.deleteById(lessonId);
  res.json({ ok: true });
};

const updateLesson = async (req, res) => {
  const lessonId = req.params.lessonId;
  const lesson = await repositories.lesson.findById(lessonId);
  const payload = dto.getPlanningToUpdate(req.body);
  await repositories.lesson.updatePlanning(payload, lesson.id);
  res.json({ ok: true });
};

const createDocument = async (req, res) => {
  const lessonId = req.params.lessonId;
  const { filename, filepath } = req.body;
  const documentId = await repositories.document.createLink(lessonId, {
    filename,
    filepath,
  });

  res.json({ ok: true, documentId });
};

const editDocument = async (req, res) => {
  const id = req.params.id;
  const { filename, filepath } = req.body;
  await repositories.document.editLink(id, { filename, filepath });

  res.json({ ok: true });
};

const removeDocument = async (req, res) => {
  const id = req.params.id;
  await repositories.document.removeLink(id);

  res.json({ ok: true });
};

const notifyLessonAction = async (req, res) => {
  const uuid = req.headers.uuid;
  const lessonId = req.params.lessonId;
  const action = req.params.action;
  let task;

  if (action === "download-content") {
    task = repositories.lessonCourse.updateDownloadContent(uuid, lessonId);
  } else if (action === "finish") {
    task = repositories.lessonCourse.updateFinishLesson(uuid, lessonId);
  } else {
    throw new ActionNotFoundError(
      "action not declared, it must be download-content | finish",
    );
  }

  await task;
  res.json({ ok: true });
};

module.exports = wrapRequests({
  getLessonById,
  createLesson,
  deleteLesson,
  updateLesson,
  getLessonByEventId,
  createDocument,
  editDocument,
  removeDocument,
  notifyLessonAction,
});
