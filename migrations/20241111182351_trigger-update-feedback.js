/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      return NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await knex.raw(`
    CREATE TRIGGER feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at()
  `);
  await knex.raw(`
    CREATE TRIGGER feedback_course_updated_at
    BEFORE UPDATE ON feedback_course
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at()
  `);
  await knex.raw(`
    CREATE TRIGGER lesson_course_updated_at
    BEFORE UPDATE ON lesson_course
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at()
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const statements = [
    "DROP TRIGGER IF EXISTS feedback_updated_at ON feedback",
    "DROP TRIGGER IF EXISTS feedback_course_updated_at ON feedback_course",
    "DROP TRIGGER IF EXISTS update_lesson_course_updated_at ON lesson_course",
    "DROP FUNCTION IF EXISTS update_feedback_course_timestamp()",
    "DROP FUNCTION IF EXISTS update_feedback_timestamp()",
    "DROP FUNCTION IF EXISTS update_lesson_course_timestamp()",
    "DROP FUNCTION IF EXISTS update_updated_at()",
  ];

  for (const statement of statements) {
    await knex.raw(statement);
  }
};
