const pubsub = require("radiojs");
const registerLessons = require("./registerLessons");
const Channels = require("./channels");

const registerListeners = () => {
  pubsub.subscribe(Channels.TEACHER_REGISTER_LESSONS, registerLessons);
};

module.exports = registerListeners;
