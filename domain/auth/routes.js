const express = require("express");
const handlers = require("./controller");
const middlewares = require("../../middlewares/authentication");
const router = express.Router();


router.post("/signIn", handlers.signIn);
router.get("/signOut", handlers.signOut);
router.get("/validateRecovery/:token", handlers.validateRecoveryToken);
router.post("/password", handlers.sendRecoverPassword);
router.post("/student", handlers.verifyStudent);
router.post("/resetPassword", handlers.sendPasswordRecoveryLink);
router.post("/updatePassword", handlers.updatePassword);


const middlewareCreation = [
  middlewares.verifyLoginToken,
  middlewares.verifyActiveState,
  middlewares.verifyAdminRole,
];

router.post("/signup/admin", middlewareCreation, handlers.signUpAdmin);
router.post("/signup/user", middlewareCreation, handlers.signUpUser);

module.exports = router;
