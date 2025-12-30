const Knex = require('knex');
const knexfile = require('./knexfile');
const knex = Knex(knexfile['production']);

async function checkQuery() {
    try {
        const eventTypeId = 1;
        const establishmentId = 2;
        const gradeId = 6;

        console.log(`Checking query for Type: ${eventTypeId}, Est: ${establishmentId}, Grade: ${gradeId}`);

        const builder = knex
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
                has_finished_lesson: "lesson_course.has_finished",
            })
            .from("lesson")
            .innerJoin("planning", "planning.lesson_id", "lesson.id")
            .innerJoin("event", "lesson.event_id", "event.id")
            .innerJoin("lesson_course", "lesson_course.lesson_id", "lesson.id")
            .innerJoin("course", "lesson_course.course_id", "course.id")
            .where("event.event_type_id", eventTypeId)
            .where("course.establishment_id", establishmentId);

        if (gradeId) {
            builder.where("event.grade_id", gradeId);
        }

        const result = await builder.orderBy("event.date", "desc");
        console.log(`Query returned ${result.length} rows.`);
        if (result.length > 0) {
            console.log(result[0]);
        } else {
            console.log('No results found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        knex.destroy();
    }
}

checkQuery();
