const EventTypes = {
  SITUATION: 1,
  EPHEMERIS: 2,
  SITUATION_TEXT: "situation",
  EPHEMERIS_TEXT: "ephemeris",
};

const SurveyTypes = {
  TEACHER: "teacher",
  STUDENT: "student",
};

const RoleTypes = {
  ADMIN: "Administrator",
  USER: "User",
  MANAGER: "Manager",
};

const FeedbackStatus = {
  FINISHED: 1,
  NOT_FINISHED: 0,
};

const PonderationTypes = {
  TEACHER: 0.3,
  STUDENT: 0.7,
};

const PlanificationTypes = {
  STANDARD: "Estandarizada",
  CUSTOM: "Personalizada",
};

const CompletionType = {
  FINISHED: "Completada",
  IN_PROGRESS: "En Desarrollo",
  PENDING: "Pendiente",
};

module.exports = {
  EventTypes,
  SurveyTypes,
  RoleTypes,
  FeedbackStatus,
  PonderationTypes,
  PlanificationTypes,
  CompletionType,
};
