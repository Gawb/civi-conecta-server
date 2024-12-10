/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createView('teachers_reports', (view) => {
    view.as(
      knex
      .select({
        teacher_name: 'u.name',
        establishment_id: 'establishment.id',
        establishment_name: 'establishment.name',
        is_custom_planification: 'u.is_custom_planification',
        is_survey_finished: 'feedback.is_finished',
      })
      .from('establishment')
      .innerJoin('course', 'course.establishment_id', 'establishment.id')
      .rightJoin('user as u', 'course.teacher_id', 'u.id')
      .leftJoin('feedback', 'feedback.teacher_id', 'course.teacher_id')
      .where('u.role', 'User')
    )
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropViewIfExists('teachers_reports');
};
