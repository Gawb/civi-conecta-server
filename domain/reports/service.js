const repositories = require("../../repositories");
const dto = require("./dto");

class ReportService {
  async checkStudentCompletionByTeacherUUID(teacherUUID) {
    const teacher = await repositories.user.findByAlias(teacherUUID);
    const course = await repositories.course.findByTeacher(teacher.id);
    return this.checkStudentCompletionByCourseId(course.id);
  }

  async checkStudentCompletionByCourseId(courseId) {
    const students =
      await repositories.report.getStudentCompletionReport(courseId);
    return dto.studentCompletionReport(students);
  }

  async findPlanningAndUnitsReport(managerUUID, gradeId) {
    const report = await repositories.report.getPlanningAndUnits(
      managerUUID,
      gradeId,
    );

    return dto.planningUnitsReport(report);
  }
}

module.exports = ReportService;
