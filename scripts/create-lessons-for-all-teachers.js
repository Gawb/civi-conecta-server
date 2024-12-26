const repositories = require("../repositories");
const registerLessons = require("../tasks/registerLessons");

async function main() {
  const teachers = await repositories.user.findByRole("User");

  for (const teacher of teachers) {
    console.log("creating classes for teacher ", teacher.name);
    await registerLessons(teacher.id);
  }

  console.log("are all the teachers done ?");
  process.exit(0);
}

main();
