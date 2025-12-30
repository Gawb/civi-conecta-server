const repositories = require("../../repositories");
const { wrapRequests } = require("../../helpers/controller");
const dto = require("./dto");
const { RoleTypes } = require("../../constants/entities");

const resolveEstablishment = async (managerUUID, req) => {
  let establishment =
    await repositories.establishment.findByManager(managerUUID);
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

const getEventsByType = async (req, res) => {
  const eventType = req.params.eventType;
  const gradeId = req.params.gradeId;
  const uuid = req.headers.uuid;

  console.log(`[getEventsByType] Type: ${eventType}, Grade: ${gradeId}, User: ${req.user.role}, UUID: ${uuid}`);

  let events = [];
  const establishment = await resolveEstablishment(uuid, req);
  console.log(`[getEventsByType] Resolved Establishment:`, establishment);

  if (establishment) {
    console.log(`[getEventsByType] Fetching by Establishment ${establishment.establishment_id}`);
    events = await repositories.event.findByEventTypeIdAndEstablishment(
      eventType,
      establishment.establishment_id,
      gradeId,
    );
  } else {
    console.log(`[getEventsByType] Fetching by Teacher UUID`);
    events = await repositories.event.findByEventTypeId(
      eventType,
      uuid,
      gradeId,
    );
  }

  console.log(`[getEventsByType] Found ${events.length} events`);
  const results = [];

  for (const event of events) {
    const files = await repositories.document.findByEvent(event.id);
    results.push({ ...event, files });
  }

  res.json({ ok: true, events: results.map(dto.mapEvent) });
};

const getEventById = async (req, res) => {
  const eventId = req.params.eventId;
  const event = await repositories.event.findById(eventId);
  const files = await repositories.document.findByLesson(event.lesson_id);

  res.json({ ok: true, event: dto.mapEventWithPlanning(event, files) });
};

const createEvent = async (req, res) => {
  const eventTypeId = req.params.eventType;
  const eventPayload = dto.getEvent(eventTypeId, req.body);
  const planningPayload = dto.getPlanning(req.body);
  const newEvent = await repositories.event.create(eventPayload);
  const lesson = await repositories.lesson.create({
    description: newEvent.description,
    eventId: newEvent.id,
  });
  await repositories.planning.create(planningPayload, lesson.id);
  const eventWithPlanning = await repositories.event.findById(newEvent.id);

  res.json({ ok: true, event: dto.mapEventWithPlanning(eventWithPlanning) });
};

const deleteEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const { planning_id, lesson_id } =
    await repositories.planning.findRelatedDataByEventId(eventId);

  if (planning_id) {
    await repositories.planning.deleteById(planning_id);
  }

  if (lesson_id) {
    // TODO: remove documents from FTP
    await repositories.document.deleteByLessonId(lesson_id);
    await repositories.lesson.deleteById(lesson_id);
  }

  await repositories.event.deleteById(eventId);

  res.json({ ok: true });
};

module.exports = wrapRequests({
  getEventsByType,
  createEvent,
  deleteEvent,
  getEventById,
});
