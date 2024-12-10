require("dotenv").config();
const config = require("./config");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandlers = require("./middlewares/handleErrors");
const logger = require("./helpers/logger");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true }));

app.use(require("./middlewares/addLogger")(logger));
app.use(require("./middlewares/logRoute"));
app.use(require("./routes"));

app.use(errorHandlers.handleNotFound);
app.use(errorHandlers.handleServerError);

app.listen(config.env.port, config.env.host, () => {
  logger.info(
    "server running at http://%s:%s",
    config.env.host,
    config.env.port,
  );
});
