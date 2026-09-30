const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { verifyRideOwnership } = require('../middleware/ownershipMiddleware');
const {
  createRide,
  getRides,
  getRideById,
  updateRide,
  cancelRide,
  joinRide
} = require('../controllers/rideController');
const {
  getRideRequests,
  updateRideRequestStatus
} = require('../controllers/rideRequestController');

// Ride CRUD endpoints
router.route('/')
  .post(protect, createRide)
  .get(getRides);

router.route('/:id')
  .get(getRideById)
  .put(protect, verifyRideOwnership, updateRide)
  .delete(protect, verifyRideOwnership, cancelRide);

// Ride Join endpoint
router.post('/:id/join', protect, joinRide);

// Ride Request management endpoints (Driver only)
router.get('/:id/requests', protect, verifyRideOwnership, getRideRequests);
router.patch('/:rideId/requests/:requestId', protect, verifyRideOwnership, updateRideRequestStatus);

module.exports = router;
