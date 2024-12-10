const { EventTypes } = require("../../constants/entities");
const dateHelper = require("../../helpers/date");

const mapEvent = (data) => {
  return {
    id: data.id,
    lessonId: data.lesson_id,
    title: data.title,
    description: data.description,
    date: data.date,
    files: data.files,
    keywords: data.keywords.split(","),
    hasEnteredIntoLesson: Boolean(data.has_entered_into_lesson),
  };
};

const mapDocument = (document) => ({
  uuid: document.alias,
  filename: document.filename,
});

const mapEventWithPlanning = (data, documents = []) => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    eventType: data.eventType,
    grade: data.grade,
    date: data.date,
    documents: documents.map(mapDocument),
    lessonId: data.lesson_id,
    planning: {
      topic: data.topic,
      keywords: data.keywords,
      startActivity: data.start_activity,
      mainActivity: data.main_activity,
      endActivity: data.end_activity,
      materials: {
        teacher: data.teacher_material.split(","),
        student: data.student_material.split(","),
      },
    },
  };
};

const getEvent = (eventTypeId, data) => {
  eventTypeId = Number.parseInt(eventTypeId);

  const event = {
    title: data.title,
    description: data.description,
    grade: data.grade,
    date: null,
    eventTypeId,
    get isEphemeris() {
      return this.eventTypeId === EventTypes.EPHEMERIS;
    },
  };

  if (event.isEphemeris) {
    event.date = dateHelper.dateToMonthDay(data.date);
  }

  return event;
};

const getPlanning = (body) => {
  return {
    topic: body.planning.topic,
    startActivity: body.planning.startActivity,
    mainActivity: body.planning.mainActivity,
    endActivity: body.planning.endActivity,
    keywords: body.planning.keywords ?? [],
    materials: {
      teacher: body.planning.materials.teacher,
      student: body.planning.materials.student,
    },
  };
};

module.exports = {
  mapEvent,
  getEvent,
  getPlanning,
  mapEventWithPlanning,
};
