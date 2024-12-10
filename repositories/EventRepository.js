const { EntityNotFoundError } = require("./exceptions");

class EventRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async findById(eventId) {
    const entity = await this.connection
      .column({
        id: "event.id",
        title: "event.title",
        description: "event.description",
        date: "event.date",
        grade: "grade.level",
        topic: "planning.topic",
        start_activity: "planning.start_activity",
        main_activity: "planning.main_activity",
        end_activity: "planning.end_activity",
        teacher_material: "planning.teacher_material",
        student_material: "planning.student_material",
        keywords: "planning.keywords",
        eventType: "event_type.name",
        lesson_id: "lesson.id",
      })
      .from("event")
      .innerJoin("event_type", "event.event_type_id", "event_type.id")
      .innerJoin("lesson", "lesson.event_id", "event.id")
      .innerJoin("planning", "planning.lesson_id", "lesson.id")
      .leftJoin("grade", "event.grade_id", "grade.id")
      .where("event.id", eventId)
      .first();

    if (!entity) {
      throw new EntityNotFoundError(`no existe el evento con el id ${eventId}`);
    }

    return entity;
  }

  async create(payload) {
    const fields = {
      title: payload.title,
      description: payload.description,
      event_type_id: payload.eventTypeId,
      date: payload.date,
      grade_id: payload.grade,
    };

    const [entity] = await this.connection.insert(fields, ["*"]).into("event");

    return entity;
  }

  findByEventTypeId(eventTypeId, uuid, gradeId = null) {
    console.log("eventTypeId", eventTypeId);
    console.log("uuid", uuid);

    const ref = this.connection.ref.bind(this.connection);
    const exp = this.connection.raw(
      "CASE WHEN lesson_course.lesson_id IS NULL THEN 0 ELSE 1 END",
    );

    const builder = this.connection
      .column({
        id: "event.id",
        title: "event.title",
        description: "event.description",
        date: "event.date",
        event_type_id: "event.event_type_id",
        grade_id: "event.grade_id",
        created_at: "event.created_at",
        updated_at: "event.updated_at",
        lesson_id: "lesson.id",
        keywords: "planning.keywords",
        has_entered_into_lesson: exp,
      })
      .from("event")
      .innerJoin("lesson", "lesson.event_id", "event.id")
      .innerJoin("planning", "planning.lesson_id", "lesson.id")
      .leftJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
      .leftJoin("course", "lesson_course.course_id", "course.id")
      .leftJoin(ref("user").as("teacher"), "course.teacher_id", "teacher.id")
      .where("event_type_id", eventTypeId)
      .whereRaw("(teacher.uuid = ? OR teacher.uuid IS NULL)", [uuid]);

    if (gradeId) {
      builder.where("event.grade_id", gradeId);
    }

    return builder.orderBy("event.date", "desc");
  }

  deleteById(eventId) {
    return this.connection("event").where("id", eventId).del();
  }
}

module.exports = EventRepository;
