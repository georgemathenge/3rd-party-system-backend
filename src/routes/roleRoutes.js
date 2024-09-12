const express = require('express');
const authenticate = require('../middlewares/auth-middleware.js');
const checkRole = require('../middlewares/role-middleware.js');
const roleController = require('../controllers/roleController');
const router = express.Router();
router.get('/fetch',
    //Authorization
    // authenticate,
    // checkRole('view_roles'), 
    roleController.getAllRoles);
router.post('/update',
    // authenticate,
    // checkRole('edit_roles'), 
    roleController.editRole);

    module.exports = router;