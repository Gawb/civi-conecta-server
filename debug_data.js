const Knex = require('knex');
const knexfile = require('./knexfile');
// Use production config as we are passing the Railway env vars
const knex = Knex(knexfile['production']);

async function inspectData() {
    try {
        const gradeId = 6;
        console.log(`\n--- Inspecting Establishment Table Schema ---`);

        const columnInfo = await knex('establishment').columnInfo();
        console.log('Columns:', Object.keys(columnInfo));

        const hasName = Object.keys(columnInfo).includes('name');
        const hasUniqueId = Object.keys(columnInfo).includes('unique_id');

        console.log(`Has 'name': ${hasName}, Has 'unique_id': ${hasUniqueId}`);

        if (hasName) {
            console.log(`\n--- Inspecting Establishments (id, name only) ---`);
            const establishments = await knex('establishment').select('id', 'name', 'active');
            console.log('All Establishments:', establishments);

            for (const est of establishments) {
                const count = await knex('event')
                    .join('lesson', 'lesson.event_id', 'event.id')
                    .join('lesson_course', 'lesson_course.lesson_id', 'lesson.id')
                    .join('course', 'lesson_course.course_id', 'course.id')
                    .where('event.grade_id', gradeId)
                    .where('event.event_type_id', 1)
                    .where('course.establishment_id', est.id)
                    .count('event.id as total');

                console.log(`Establishment ${est.id} (${est.name}): ${count[0].total} events for Grade ${gradeId}`);
            }
        }

        // Check finding by manager for the specific Admin UUID from logs
        // UUID: ea03b6fa-ab73-44c1-973a-acf64e64d397
        const adminUUID = 'ea03b6fa-ab73-44c1-973a-acf64e64d397';
        if (hasUniqueId) {
            console.log(`\n--- Checking Manager Link for Admin UUID: ${adminUUID} ---`);
            const estByUUID = await knex('establishment').where('unique_id', adminUUID).first();
            if (estByUUID) {
                console.log(`Admin linked to Establishment via unique_id: ${estByUUID.id} (${estByUUID.name})`);
            } else {
                console.log('Admin NOT linked to any establishment via unique_id');
            }
        } else {
            console.log('Establishment table does not have unique_id column. Cannot check manager link via unique_id.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        knex.destroy();
    }
}

inspectData();
