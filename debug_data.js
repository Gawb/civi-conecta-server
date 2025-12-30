const Knex = require('knex');
const knexfile = require('./knexfile');
// Use production config as we are passing the Railway env vars
const knex = Knex(knexfile['production']);

async function inspectData() {
    try {
        const gradeId = 6;
        console.log(`\n--- Inspecting Data for Grade ${gradeId} ---`);

        // Check for potential data issues (e.g. null description)
        console.log('\n--- Checking for null descriptions in Grade 6 events ---');
        // We only check events that are linked to lessons/courses in establishment 2, as that's what the query returns
        const riskyEvents = await knex('event')
            .join('lesson', 'lesson.event_id', 'event.id')
            .join('lesson_course', 'lesson_course.lesson_id', 'lesson.id')
            .join('course', 'lesson_course.course_id', 'course.id')
            .where('event.grade_id', gradeId)
            .where('event.event_type_id', 1)
            .where('course.establishment_id', 2)
            .select('event.id', 'event.description', 'event.title');

        console.log(`Checking ${riskyEvents.length} events for null description...`);
        const badEvents = riskyEvents.filter(e => !e.description);
        if (badEvents.length > 0) {
            console.log('FOUND EVENTS WITH NULL DESCRIPTION:', badEvents.map(e => e.id));
        } else {
            console.log('No events with null description found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        knex.destroy();
    }
}

inspectData();
