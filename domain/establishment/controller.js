const repositories = require("../../repositories");
const messages = require("../../config/messages");
const exceptions = require("../../repositories/exceptions");
const { wrapRequests } = require("../../helpers/controller");
const { RoleTypes } = require("../../constants/entities");
const dto = require("./dto.js");

const getEstablishments = async (_, res) => {
  const establishments = await repositories.establishment.findAll();

  res.json({
    ok: true,
    establishments: establishments.map(dto.mapEstablishment),
  });
};

const createEstablishment = async (req, res) => {
  const { number, name } = req.body;
  const establishment = await repositories.establishment.create({
    number,
    name,
  });
  res.json({ ok: true, establishment });
};

const getCoursesFromEstablishment = async (req, res) => {
  const establishmentId = Number.parseInt(req.params.establishmentId);
  const courses =
    await repositories.course.findByEstablishmentId(establishmentId);
  res.json({ ok: true, courses: courses.map(dto.mapCourse) });
};

const getCoursesByManager = async (req, res) => {
  const managerId = req.params.managerId;
  const establishment =
    await repositories.establishment.findByManager(managerId);
  const courses = await repositories.course.findGradesByEstablishment(
    establishment.establishment_id,
  );
  res.json({
    ok: true,
    courses: courses.map(dto.mapCourse),
    establishment: establishment.establishment_name,
  });
};

const createCourse = async (req, res) => {
  const establishmentId = Number.parseInt(req.params.establishmentId);
  const gradeId = Number.parseInt(req.body.gradeId);
  const letterId = Number.parseInt(req.body.letterId);
  const courseRecord = await repositories.course.create(
    establishmentId,
    gradeId,
    letterId,
  );
  const course = await repositories.course.findById(courseRecord.id);

  res.json({ ok: true, course: dto.mapCourse(course) });
};

const updateCoursesEstablishment = async (req, res) => {
  const number = req.params.number;
  const courses = req.body.courses;
  const establishment = await repositories.establishment.update(
    number,
    courses,
  );

  req.logger.info("updating number %s", number);
  req.logger.info("updating courses %s", courses);

  res.json({ ok: true, establishment });
};

const updateTeacherToCourse = async (req, res) => {
  const user = await repositories.user.findOrCreateUser({
    name: req.body.name,
    email: req.body.email,
  });

  const coursesTakenByTeacher = await repositories.course.findByTeacher(
    user.id,
  );

  if (coursesTakenByTeacher) {
    throw new exceptions.TeacherAlreadyAssignedError(
      messages.establishment.teacherAlreadyAssigned,
    );
  }

  const gradeToSearch = req.body.grade;
  const letterToSearch = req.body.letter;
  const establishmentId = req.body.institution;

  const course = await repositories.course.findByGradeLetterEstablishment(
    gradeToSearch,
    letterToSearch,
    establishmentId,
  );

  await repositories.course.updateTeacher(user.id, course.id);

  res.json({ ok: true, user: dto.mapTeacher(user) });
};

const getProfile = async (req, res) => {
  const uuid = req.params.uuid;
  const result = await repositories.establishment.getInfoByTeacher(uuid);
  req.logger.info("Getting profile for teacher with uuid %s", uuid);

  res.json({ ok: true, info: dto.mapProfileInfo(result) });
};

const updateEstablishmentStatus = async (req, res) => {
  const establishmentId = req.params.id;
  const isActive = req.params.status === "active" ? 1 : 0;
  await repositories.establishment.updateActiveStatus(
    establishmentId,
    isActive,
  );
  res.json({ ok: true });
};

const getEstablishmentGrades = async (req, res) => {
  const establishmentId = req.params.establishmentId;
  const gradeId = req.params.gradeId;
  const results = await repositories.course.findByEstablishmentAndGrade(
    establishmentId,
    gradeId,
  );
  res.json({ ok: true, courses: results });
};

const getTeacherInfo = async (req, res) => {
  const establishmentId = req.params.establishmentId;
  const courseId = req.params.courseId;
  const result =
    await repositories.establishment.findTeachersByEstablishmentAndCourse(
      establishmentId,
      courseId,
    );

  if (!result.length) {
    throw new exceptions.EntityNotFoundError(
      "No hay profesor asociado a este curso aun",
    );
  }

  res.json({ ok: true, teacher: dto.mapTeacherInfo(result[0]) });
};

const getTeachersFromEstablishment = async (req, res) => {
  const establishmentId = Number.parseInt(req.params.establishmentId);
  const result =
    await repositories.establishment.findTeachersByEstablishment(
      establishmentId,
    );
  res.json({ ok: true, teachers: result.map(dto.mapTeacherInfo) });
};

const removeStudent = async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId);
  req.logger.info("Removing student %s", studentId);
  await repositories.establishment.removeStudent(studentId);
  res.json({ ok: true });
};

const updateStudent = async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId);
  const firstName = req.body.name;
  const lastName = req.body.lastname;
  const run = req.body.run;
  await repositories.establishment.updateStudent(
    firstName,
    lastName,
    run,
    studentId,
  );
  res.json({ ok: true });
};

const createManager = async (req, res) => {
  const establishmentId = req.params.establishmentId;
  const name = req.body.name;
  const email = req.body.email;

  const user = await repositories.user.findOrCreateUser({
    name,
    email,
    type: RoleTypes.MANAGER,
  });

  req.logger.info(
    "assigning manager %s to establishment %s",
    name,
    establishmentId,
  );

  await repositories.establishment.addManager(establishmentId, user.id);

  res.json({
    ok: true,
    manager: {
      id: user.id,
      name: user.name,
      email: user.email,
      uuid: user.user_uuid ?? user.uuid,
    },
  });
};

const getManagerFromEstablishment = async (req, res) => {
  const establishmentId = req.params.establishmentId;
  const managers =
    await repositories.establishment.findManagers(establishmentId);

  if (!managers) {
    throw new exceptions.EntityNotFoundError(
      "El establecimiento no tiene managers asociados",
    );
  }

  const mappedManagers = managers.map(dto.mapManager);

  res.json({ ok: true, managers: mappedManagers });
};

module.exports = wrapRequests({
  getEstablishments,
  createEstablishment,
  getCoursesFromEstablishment,
  createCourse,
  updateCoursesEstablishment,
  updateTeacherToCourse,
  getProfile,
  updateEstablishmentStatus,
  getEstablishmentGrades,
  getTeacherInfo,
  getTeachersFromEstablishment,
  removeStudent,
  updateStudent,
  createManager,
  getManagerFromEstablishment,
  getCoursesByManager,
});
