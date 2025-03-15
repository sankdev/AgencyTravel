const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const {upload}=require('../middleware/uploadMiddleware')
// Protection de toutes les routes
// router.use(authMiddleware.protect);

// Routes pour tous les utilisateurs authentifiés
router.get('/stats', reservationController.getReservationStats);

// Routes spécifiques aux clients
router.post('/', authMiddleware.authenticate,authMiddleware.restrictTo('customer','agency','admin'),   upload.any(), reservationController.createReservation);
router.post('/confirm',authMiddleware.authenticate,authMiddleware.restrictTo('agency','admin'),reservationController.confirmReservation)
// Routes pour les clients et les agences
router.get('/', authMiddleware.authenticate, authMiddleware.restrictTo('customer','agency','admin'),reservationController.getReservations);
router.get('/list',authMiddleware.authenticate,authMiddleware.restrictTo('customer','agency','admin'),  reservationController.listReservations);

router.get('/agency', authMiddleware.authenticate,authMiddleware.restrictTo('customer','agency','admin'),reservationController.getReservationsByAgencyUser); 
 
router.get('/:id', authMiddleware.authenticate, authMiddleware.restrictTo('customer','agency','admin'),reservationController.getReservation);
router.put('/:id', reservationController.updateReservation);
router.put('/:id/cancel',authMiddleware.restrictTo('customer','agency','admin'), reservationController.cancelReservation);


router.get('/agency/:agencyId', authMiddleware.authenticate,authMiddleware.restrictTo('customer','agency','admin'), reservationController.getReservationsByAgency);
router.get('/customer/:customerId', authMiddleware.authenticate, authMiddleware.restrictTo('customer','agency','admin'), reservationController.getReservationsByCustomer);

module.exports = router;
