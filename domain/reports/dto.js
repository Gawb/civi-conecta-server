const {
  PonderationTypes,
  PlanificationTypes,
  CompletionType,
} = require("../../constants/entities");
const { decimalToRoman } = require("../../helpers/number");

const studentCompletionReport = (students) => {
  const results = students.map((student) => {
    const answers = Number.parseInt(student.answers);
    const questions = Number.parseInt(student.question_count);
    const percentage = Number(((answers / questions) * 100).toFixed(2));

    function checkStatus(percentage) {
      if (percentage == 100) {
        return CompletionType.FINISHED;
      }

      if (percentage > 0) {
        return CompletionType.IN_PROGRESS;
      }

      return CompletionType.PENDING;
    }

    return {
      run: student.run,
      name: student.name,
      lastname: student.lastname,
      questions,
      answers,
      updatedAt: student.updated_at,
      percentage: percentage,
      surveyStatus: checkStatus(percentage),
    };
  });

  return results;
};

const getStudentAnswers = (data) => {
  const groupedResults = data.reduce((obj, row) => {
    if (!obj[row.topic_name]) {
      obj[row.topic_name] = {
        questions: {},
      };
    }

    const topic = obj[row.topic_name];

    if (!topic.questions[row.question_description]) {
      topic.questions[row.question_description] = {
        total: 0,
        alternatives: {},
      };
    }

    const group = topic.questions[row.question_description];
    const quantity = Number.parseInt(row.quantity);
    group.alternatives[row.answer_description] = quantity;
    group.total += quantity;

    return obj;
  }, {});

  const toArray = (groups) => {
    return Object.entries(groups).map((topicEntry) => {
      const [title, topicResult] = topicEntry;

      return {
        topic: title,
        questions: Object.entries(topicResult.questions).map(
          (questionEntry) => {
            const [question, results] = questionEntry;
            const total = Number.parseInt(results.total);

            return {
              question,
              answers: Object.entries(results.alternatives).map(
                (answerEntry) => {
                  const label = answerEntry[0];
                  const quantity = Number.parseInt(answerEntry[1]);
                  return {
                    label,
                    quantity,
                    percentage: Number(((quantity / total) * 100).toFixed(2)),
                  };
                },
              ),
            };
          },
        ),
      };
    });
  };

  return toArray(groupedResults);
};

const getMostCriticalAnswers = (data) => {
  return data.map((row) => {
    return {
      questionId: row.question_id,
      description: row.question_description,
      average: Number(Number.parseFloat(row.average).toFixed(2)),
    };
  });
};

const getUnitsOrder = (data) => {
  const arr = [];

  for (let i = 0; i < data.teacherResults.length; i++) {
    let ponderation = 0;

    if (data.teacherResults[i] && data.studentResults[i]) {
      const teacherPonderation =
        Number.parseFloat(data.teacherResults[i].unit_order) *
        PonderationTypes.TEACHER;
      const studentsPonderation =
        Number.parseFloat(data.studentResults[i].unit_order) *
        PonderationTypes.STUDENT;
      ponderation = teacherPonderation + studentsPonderation;
    } else {
      ponderation = Number.parseFloat(data.teacherResults[i].unit_order);
    }

    arr.push({
      title: data.teacherResults[i].title,
      unitId: data.teacherResults[i].unit_id,
      ponderation,
      description: data.teacherResults[i].description,
    });
  }

  arr.sort((a, b) => (a.ponderation >= b.ponderation ? -1 : 1));
  return arr;
};

const getPlanificationsType = (data) => {
  return data.map(({ name, is_custom_planification }) => ({
    name,
    planificationType:
      is_custom_planification == 1
        ? PlanificationTypes.CUSTOM
        : PlanificationTypes.STANDARD,
  }));
};

const mapSurvey = (survey) => {
  let status;

  if (survey.is_course_survey_finished && survey.is_teacher_survey_finished) {
    status = CompletionType.FINISHED;
  } else if (
    survey.is_course_survey_finished ||
    survey.is_teacher_survey_finished
  ) {
    status = CompletionType.IN_PROGRESS;
  } else {
    status = CompletionType.PENDING;
  }

  return {
    course: `${survey.grade} ${survey.letter}`,
    status,
    teacher: survey.teacher_name,
    teacher_uuid: survey.teacher_uuid,
    survey_teacher: Boolean(survey.is_teacher_survey_finished),
    students_link: Boolean(survey.is_link_generated),
    resume_downloaded: Boolean(survey.is_report_downloaded),
  };
};

const mapUnitCompletion = (results) => {
  return results.map((result) => {
    const finished = Number.parseInt(result.lessons_finished);
    const total = Number.parseInt(result.total_lessons);
    let status;

    if (finished === total) {
      status = CompletionType.FINISHED;
    } else if (finished > 0) {
      status = CompletionType.IN_PROGRESS;
    } else {
      status = CompletionType.PENDING;
    }

    return {
      id: result.id,
      title: result.title,
      number: decimalToRoman(Number.parseInt(result.number)),
      lessonsFinished: finished,
      totalLessons: total,
      status,
    };
  });
};

const mapLessonCompletion = (results) => {
  return results.map((result) => {
    return {
      id: result.id,
      number: result.number,
      objective: result.objective,
      eventDate: result.event_date,
      title: result.title,
      number: result.number,
      hasFinished: result.has_finished,
      hasDownloadedContent: result.has_downloaded_content,
      planning: {
        id: result.planning_id,
        topic: result.topic,
      },
    };
  });
};

const mapEvents = (results, type) => {
  return results.map((r) => {
    return {
      establishment: {
        id: r.id,
        name: r.establishment_name,
      },
      course: {
        gradeId: r.grade_id,
        gradeLevel: r.grade_level,
        gradeLetter: r.letter_character,
      },
      teacher: {
        name: r.teacher_name,
        uuid: r.teacher_uuid,
        isCustom: r.is_custom_planification
          ? PlanificationTypes.CUSTOM
          : PlanificationTypes.STANDARD,
      },
      [type]: {
        working: Number.parseInt(r[`working_${type}`]),
        lessonsFinished: Number.parseInt(r.lessons_finished),
        lessonsDownloaded: Number.parseInt(r.lessons_downloaded),
      },
    };
  });
};
const planningUnitsReport = (results) => {
  return results.map((data) => ({
    establishment_name: data.establishment_name,
    grade: data.grade,
    letter: data.letter,
    teacher_name: data.teacher_name,
    teacher_uuid: data.teacher_uuid,
    planification: data.is_custom_planification
      ? PlanificationTypes.CUSTOM
      : PlanificationTypes.STANDARD,
    working_units: data.working_units,
    downloaded_lessons: Number(data.lessons_downloaded),
    lessons_finished: Number(data.lessons_finished),
  }));
};

module.exports = {
  studentCompletionReport,
  getStudentAnswers,
  getMostCriticalAnswers,
  getUnitsOrder,
  getPlanificationsType,
  mapSurvey,
  mapUnitCompletion,
  mapLessonCompletion,
  mapEvents,
  planningUnitsReport,
};
