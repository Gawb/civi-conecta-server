/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  function createLessonCourseTrigger() {
    return knex.raw(`
      CREATE OR REPLACE FUNCTION update_lesson_course_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        return NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  function createTrigger() {
    return knex.raw(`
      CREATE TRIGGER update_lesson_course_updated_at
      BEFORE UPDATE ON lesson_course
      FOR EACH ROW
      EXECUTE FUNCTION update_lesson_course_timestamp();
    `);
  }

  await knex.schema.createTable("lesson_course", (t) => {
    t.integer("lesson_id").unsigned();
    t.integer("course_id").unsigned();
    t.integer("has_downloaded_content").unsigned().defaultTo(0);
    t.integer("has_finished").unsigned().defaultTo(0);
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.foreign("course_id").references("course.id");
    t.foreign("lesson_id").references("lesson.id");
    t.primary(["lesson_id", "course_id"]);
  });

  await createLessonCourseTrigger();
  await createTrigger();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(
    "DROP TRIGGER IF EXISTS update_lesson_course_updated_at ON lesson_course",
  );
  await knex.raw("DROP FUNCTION IF EXISTS update_lesson_course_timestamp()");
  await knex.schema.dropTable("lesson_course");
};
