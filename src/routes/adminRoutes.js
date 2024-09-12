const express = require('express');
const adminController = require('../controllers/adminController');
const authenticate = require('../middlewares/auth-middleware.js');
const checkRole = require('../middlewares/role-middleware.js');
const router = express.Router();
router.get('/fetch',
    //Authorization
    authenticate,
    checkRole('view_admin'),
    adminController.getAllAdmins);
router.get('/:id',
    authenticate,
     checkRole('view_admin'),
    adminController.getAdminsById);
router.post('/create',
    authenticate,
     checkRole('create_admin'),
    adminController.createAdmin);
router.post('/update/:id',
    authenticate,
     checkRole('update_admin'),
    adminController.updateUpdateAdminDetails);
module.exports = router;