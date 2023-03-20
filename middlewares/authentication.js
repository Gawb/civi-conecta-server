const config = require('../config');
const jwt = require('jsonwebtoken');

const _verifyToken = (isByCookiesOrHeaders) => (seed) => (req, res, next) => {
  const loginToken = req.headers.token;
  const token = isByCookiesOrHeaders ? loginToken : req.query.token;

  jwt.verify(token, seed, (err, decoded) => {
    if (err) {
      return res.status(401).json({ ok: false, error: err });
    }
    req.user = decoded.user;
    next();
  });
};

const verifyByHeaders = _verifyToken(true);
const verifyByQuery = _verifyToken(false);

const verifyLoginToken = verifyByHeaders(config.seed.userLogin);
const verifyLoginTokenByQuery = verifyByQuery(config.seed.userLogin);
const verifyRecoveryPasswordToken = verifyByQuery(config.seed.recoverPassword);
const verifySurveyStudentsToken = verifyByQuery(config.seed.surveyStudents);
const verifyAutoLoginToken = verifyByQuery(config.seed.userLogin);

const RoleTypes = {
  ADMINISTRATOR: 'Administrator',
  USER: 'User'
};

const verifyActiveState = (req, res, next) => {
  if (!req.user.active) {
    return res.status(400).json({ ok: false, error: 'This user it not active' });
  }

  next();
};

const verifyRole = (roleType, message) => (req, res, next) => {
  if (req.user.role !== roleType) {
    return res.status(400).json({ ok: false, error: message });
  }

  next();
};

const verifyAdminRole = verifyRole(RoleTypes.ADMINISTRATOR, `This user is not ${RoleTypes.ADMINISTRATOR}`);
const verifyUserRole = verifyRole(RoleTypes.USER, `This user is not ${RoleTypes.USER}`);

module.exports = {
  verifyLoginToken,
  verifyLoginTokenByQuery,
  verifyRecoveryPasswordToken,
  verifySurveyStudentsToken,
  verifyAutoLoginToken,
  verifyActiveState,
  verifyAdminRole,
  verifyUserRole,
};
