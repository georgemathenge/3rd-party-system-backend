/**
 * @swagger
 * /fetch:
 *   get:
 *     summary: the list of requests
 *     responses:
 *       200:
 *         description: Retrieve the list of requests in accordance to your role. */


const express = require('express');
const requestController = require('../controllers/requestController');
const router = express.Router();
const checkRole = require('../middlewares/role-middleware');
const authenticate = require('../middlewares/auth-middleware')


router.get('/fetch',
    // checkRole('user'),
    //authenticate
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
router.post('/resolve/:id',
    //  checkRole('user'),
    requestController.resolveRequest);


module.exports = router ; 