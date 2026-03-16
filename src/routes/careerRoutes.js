const router = require('express').Router();
const { skillRoi } = require('../controllers/careerController');

router.get('/skill-roi', skillRoi);

module.exports = router;
