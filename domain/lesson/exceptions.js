class ActionNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "ActionNotFoundError";
    this.isCustomException = true;
  }
}

module.exports = { ActionNotFoundError };
