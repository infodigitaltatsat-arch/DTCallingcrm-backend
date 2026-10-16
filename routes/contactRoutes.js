const express = require('express');

const {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
} = require('../controllers/contactController')

const {protect, authorizeRoles} = require('../middleware/authMiddleware')

const router = express.Router();
router.use(protect)
// defining routes
router.get('/',getContacts);
router.get('/:id',getContactById);
router.post('/',createContact);
router.patch('/:id',updateContact);
router.delete('/:id',authorizeRoles('admin','manager'),deleteContact);

module.exports = router;
