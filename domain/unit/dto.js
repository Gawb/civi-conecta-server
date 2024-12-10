const mapUnit = (unit) => {
  return {
    id: unit.id,
    number: unit.number,
    description: unit.description,
    title: unit.title,
    objective: unit.objective,
  };
};

const mapDocument = (data) => {
  return {
    uuid: data.alias,
    filename: data.filename,
  };
};

const mapUnitWithData = (data, documents) => {
  const toArray = (x) => (x ? x.split(",") : []);
  const getDocumentsByLesson = (lessonId) =>
    documents.filter((d) => d.lesson_id === lessonId).map(mapDocument);

  const lessons = data
    .map((item) => {
      return {
        id: item.lesson_id,
        number: item.lesson_number,
        title: item.lesson_title,
        objective: item.lesson_objective,
        description: item.lesson_description,
        date: item.lesson_date,
        files: getDocumentsByLesson(item.lesson_id),
        planning: {
          id: item.planning_id,
          topic: item.planning_topic,
          keywords: toArray(item.planning_keywords),
          startActivity: item.planning_start_activity,
          mainActivity: item.planning_main_activity,
          endActivity: item.planning_end_activity,
          teacherMaterial: toArray(item.planning_teacher_material),
          studentMaterial: toArray(item.planning_student_material),
        },
      };
    })
    .filter((c) => c.id);

  return {
    id: data[0].id,
    number: data[0].number,
    title: data[0].title,
    description: data[0].description,
    objective: data[0].objective,
    lessons,
  };
};

const mapUnitDashboard = (unit, lessons) => {
  const mappedLessons = lessons.map((lesson) => {
    return {
      id: lesson.id,
      number: lesson.number,
      objective: lesson.objective,
      description: lesson.description,
      hasEnteredIntoLesson: Boolean(lesson.has_entered_into_lesson),
    };
  });

  return {
    id: unit.id,
    number: unit.number,
    title: unit.title,
    description: unit.description,
    objective: unit.objective,
    lessons: mappedLessons,
  };
};

module.exports = {
  mapUnit,
  mapUnitWithData,
  mapUnitDashboard,
};
