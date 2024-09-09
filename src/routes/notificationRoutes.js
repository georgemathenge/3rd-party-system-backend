const express = require('express');
const notificationController = require('../controllers/notificationController');
const router = express.Router();
const checkRole = require('../middlewares/role-middleware');


router.get('/',
    //  checkRole('user'),
      notificationController.getAllNotifications);

module.exports = router; 