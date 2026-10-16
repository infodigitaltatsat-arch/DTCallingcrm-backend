const express = require('express')
const {
     getFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
} = require('../controllers/followUpController');

const {protect, authorizeRoles} = require('../middleware/authMiddleware')

const router = express.Router();
router.use(protect);

router.get('/',getFollowUps);
router.get('/:id',getFollowUpById);
router.post('/',createFollowUp);
router.patch('/:id',updateFollowUp);
router.delete('/:id',authorizeRoles('admin','manager'),deleteFollowUp);


module.exports = router
