class EntityNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecordNotFoundError';
    this.isCustomException = true;
  }
}

class EntityAlreadyExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EntityAlreadyExistsError';
    this.isCustomException = true;
  }
}

class EntityWithDependenciesError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EntityWithDependenciesError';
    this.isCustomException = true;
  }
}

class TeacherAlreadyAssignedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TeacherAlreadyAssignedError';
    this.isCustomException = true;
  }
}

module.exports = {
  EntityNotFoundError,
  EntityAlreadyExistsError,
  EntityWithDependenciesError,
  TeacherAlreadyAssignedError
};
