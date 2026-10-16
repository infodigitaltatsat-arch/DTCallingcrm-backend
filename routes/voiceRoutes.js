const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const trialCallLimit = require('../middleware/trialCallLimit');

const {
    startTrialCall,
} = require('../controllers/voiceController');

const router = express.Router();

router.use(protect);

router.post('/trial-call', trialCallLimit, startTrialCall);

module.exports = router;
