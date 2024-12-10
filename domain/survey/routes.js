const { Router } = require('express');
const middlewares = require('../../middlewares/authentication');
const handlers = require('./controller');
const router = Router();

router.get('/', handlers.getAll);
router.get('/type/student', handlers.findByStudentType);
router.get('/:surveyId', handlers.findById);
router.get('/report/:uuid', handlers.getReport);
router.put('/teacher/:uuid/generated-link', handlers.updateGeneratedLink);
router.put('/teacher/:uuid/downloaded-report', handlers.updateDownloadedReport);
router.post('/:topicId', middlewares.verifyAdminRole, handlers.saveSurvey);
router.post('/students/:uuid', handlers.createStudentsSurvey);
router.post('/teacher/:uuid', handlers.createTeacherSurvey);

module.exports = router;
