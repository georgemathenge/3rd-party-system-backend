const express = require('express');
const requestController = require('../controllers/requestController');
const router = express.Router();
const checkRole = require('../middlewares/role-middleware');


router.get('/fetch',
    // checkRole('user'),
     requestController.getAllRequests);
router.get('/:id',
    //  checkRole('user'),
      requestController.getRequestById);
router.post('/review/:id',
    //  checkRole('user'),
    requestController.reviewRequest);
router.post('/allocate/:id',
    //  checkRole('user'),
    requestController.allocateRequest);


module.exports = router ; 