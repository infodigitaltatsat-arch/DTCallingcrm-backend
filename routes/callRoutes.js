const express = require('express');

const {
    getCalls,
    getCallById,
    createCall,
} = require('../controllers/callController');

const {protect} = require('../middleware/authMiddleware')

const router = express.Router();
router.use(protect)


router.get('/',getCalls);
router.get('/:id',getCallById);
router.post('/',createCall);

module.exports = router
