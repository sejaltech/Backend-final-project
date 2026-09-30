const mongoose = require('mongoose');
const RideRequest = require('../models/RideRequest');
const Ride = require('../models/Ride');

/**
 * @desc    Get all requests for a specific ride
 * @route   GET /api/rides/:id/requests
 * @access  Private (Driver only)
 */
const getRideRequests = async (req, res, next) => {
  try {
    const rideId = req.params.rideId || req.params.id;

    const requests = await RideRequest.find({ ride: rideId })
      .populate('student', 'name email phone')
      .sort({ requestedAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Ride requests retrieved successfully',
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of a ride request (Accept / Reject)
 * @route   PATCH /api/rides/:rideId/requests/:requestId
 * @access  Private (Driver only)
 */
const updateRideRequestStatus = async (req, res, next) => {
  try {
    const { rideId, requestId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new status (ACCEPTED, REJECTED, or PENDING)'
      });
    }

    const upperStatus = status.toUpperCase();
    if (!['ACCEPTED', 'REJECTED', 'PENDING'].includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: ACCEPTED, REJECTED, PENDING'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Request ID format'
      });
    }

    const request = await RideRequest.findOne({
      _id: requestId,
      ride: rideId
    }).populate('student', 'name email phone');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found for this ride'
      });
    }

    const previousStatus = request.status;

    // Handle seat adjustments based on status transitions
    if (previousStatus !== upperStatus) {
      // Transition from ACCEPTED -> REJECTED or PENDING (free up a seat)
      if (previousStatus === 'ACCEPTED' && (upperStatus === 'REJECTED' || upperStatus === 'PENDING')) {
        await Ride.findOneAndUpdate(
          { _id: rideId, seatsFilled: { $gt: 0 } },
          { $inc: { seatsFilled: -1 } }
        );
      }

      // Transition from REJECTED or PENDING -> ACCEPTED (claim a seat if available)
      if ((previousStatus === 'REJECTED' || previousStatus === 'PENDING') && upperStatus === 'ACCEPTED') {
        const updatedRide = await Ride.findOneAndUpdate(
          {
            _id: rideId,
            status: 'ACTIVE',
            $expr: { $lt: ['$seatsFilled', '$seatLimit'] }
          },
          { $inc: { seatsFilled: 1 } },
          { new: true }
        );

        if (!updatedRide) {
          return res.status(400).json({
            success: false,
            message: 'Cannot accept request. Ride has reached its maximum seat capacity.'
          });
        }
      }

      request.status = upperStatus;
      await request.save();
    }

    const latestRide = await Ride.findById(rideId);

    return res.status(200).json({
      success: true,
      message: `Ride request status updated to ${upperStatus}`,
      data: {
        request,
        rideSeats: {
          seatLimit: latestRide.seatLimit,
          seatsFilled: latestRide.seatsFilled,
          seatsAvailable: Math.max(0, latestRide.seatLimit - latestRide.seatsFilled)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRideRequests,
  updateRideRequestStatus
};
