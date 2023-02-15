const { Router } = require('express');
const handlers = require('../domain/events/controller');
const router = Router();

router.get('/', handlers.getEventsByGrade);
router.post('/', handlers.createEphemeris);

module.exports = router;
