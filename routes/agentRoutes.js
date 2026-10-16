const express = require('express');
const router = express.Router();

const {getAgents} = require('../controllers/agentController');

const {protect, authorizeRoles} = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('admin','manager'), getAgents);

module.exports = router;
