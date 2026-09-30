const mongoose = require('mongoose');
const Ride = require('../models/Ride');

/**
 * Middleware to ensure the authenticated student owns (is the driver of) the target ride.
 */
const verifyRideOwnership = async (req, res, next) => {
  const rideId = req.params.rideId || req.params.id;

  if (!rideId) {
    return res.status(400).json({
      success: false,
      message: 'Ride ID parameter is required.'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Ride ID format.'
    });
  }

  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.'
      });
    }

    // Compare ride driver with authenticated student ID
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to manage this ride. Only the driver has permission.'
      });
    }

    // Attach ride to request object for use in controller
    req.ride = ride;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyRideOwnership };
