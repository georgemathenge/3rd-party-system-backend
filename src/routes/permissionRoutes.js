const express = require('express');
const authenticate = require('../middlewares/auth-middleware.js');
const checkRole = require('../middlewares/role-middleware.js');
const permissionController = require('../controllers/permissionController');
const router = express.Router();
router.get('/fetch',
    //Authorization
    // authenticate,
    // checkRole('view_roles'), 
    permissionController.getAllPermissions);

module.exports = router;