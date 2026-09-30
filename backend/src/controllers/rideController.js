const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');

/**
 * @desc    Create a new ride posting
 * @route   POST /api/rides
 * @access  Private (Authenticated student becomes driver)
 */
const createRide = async (req, res, next) => {
  try {
    const { route, departureTime, seatLimit } = req.body;

    if (!route || !departureTime || seatLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide route, departureTime, and seatLimit'
      });
    }

    const parsedDeparture = new Date(departureTime);
    if (isNaN(parsedDeparture.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid departureTime format. Please provide a valid ISO date/timestamp.'
      });
    }

    const numSeatLimit = Number(seatLimit);
    if (isNaN(numSeatLimit) || numSeatLimit <= 0 || !Number.isInteger(numSeatLimit)) {
      return res.status(400).json({
        success: false,
        message: 'seatLimit must be a positive integer greater than 0'
      });
    }

    const ride = await Ride.create({
      driver: req.user._id,
      route: route.trim(),
      departureTime: parsedDeparture,
      seatLimit: numSeatLimit,
      seatsFilled: 0,
      status: 'ACTIVE'
    });

    const populatedRide = await Ride.findById(ride._id).populate(
      'driver',
      'name email phone'
    );

    return res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: populatedRide
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available rides with optional route & time filtering
 * @route   GET /api/rides
 * @access  Public / Private
 */
const getRides = async (req, res, next) => {
  try {
    const { route, time, status, driver } = req.query;
    const filter = {};

    // Filter by status (default to ACTIVE unless ALL is requested)
    if (status) {
      if (status.toUpperCase() !== 'ALL') {
        filter.status = status.toUpperCase();
      }
    } else {
      filter.status = 'ACTIVE';
    }

    // Filter by driver
    if (driver) {
      filter.driver = driver;
    }

    // Filter by route (case-insensitive substring)
    if (route) {
      filter.route = { $regex: route.trim(), $options: 'i' };
    }

    // Filter by time (e.g. specific date or departure from that date)
    if (time) {
      const parsedDate = new Date(time);
      if (!isNaN(parsedDate.getTime())) {
        // If query specifies a full date without time or standard date string
        const startOfDay = new Date(parsedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(parsedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // If time string had no hours specified, match rides within that whole day,
        // or >= the provided time
        if (time.length <= 10) {
          filter.departureTime = {
            $gte: startOfDay,
            $lte: endOfDay
          };
        } else {
          filter.departureTime = {
            $gte: parsedDate
          };
        }
      }
    }

    const rides = await Ride.find(filter)
      .populate('driver', 'name email phone')
      .sort({ departureTime: 1 });

    return res.status(200).json({
      success: true,
      message: 'Rides retrieved successfully',
      count: rides.length,
      data: rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single ride by ID
 * @route   GET /api/rides/:id
 * @access  Public / Private
 */
const getRideById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ride ID format'
      });
    }

    const ride = await Ride.findById(id).populate(
      'driver',
      'name email phone'
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ride retrieved successfully',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a ride (Owner only)
 * @route   PUT /api/rides/:id
 * @access  Private (Ride driver only)
 */
const updateRide = async (req, res, next) => {
  try {
    // req.ride is already attached by verifyRideOwnership middleware
    const ride = req.ride;
    const { route, departureTime, seatLimit, status } = req.body;

    if (route !== undefined) {
      if (typeof route !== 'string' || route.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Route must be at least 2 characters long'
        });
      }
      ride.route = route.trim();
    }

    if (departureTime !== undefined) {
      const parsedDeparture = new Date(departureTime);
      if (isNaN(parsedDeparture.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid departureTime format'
        });
      }
      ride.departureTime = parsedDeparture;
    }

    if (seatLimit !== undefined) {
      const numSeatLimit = Number(seatLimit);
      if (isNaN(numSeatLimit) || numSeatLimit <= 0 || !Number.isInteger(numSeatLimit)) {
        return res.status(400).json({
          success: false,
          message: 'seatLimit must be a positive integer greater than 0'
        });
      }

      // Ensure new seat limit is not lower than already filled seats
      if (numSeatLimit < ride.seatsFilled) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce seatLimit to ${numSeatLimit} because ${ride.seatsFilled} seats are already filled.`
        });
      }

      ride.seatLimit = numSeatLimit;
    }

    if (status !== undefined) {
      const upperStatus = status.toUpperCase();
      if (!['ACTIVE', 'CANCELLED'].includes(upperStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either ACTIVE or CANCELLED'
        });
      }
      ride.status = upperStatus;
    }

    // Explicitly prevent manual modification of seatsFilled by client
    // (seatsFilled changes only via join requests and approvals/rejections)

    await ride.save();

    const updatedRide = await Ride.findById(ride._id).populate(
      'driver',
      'name email phone'
    );

    return res.status(200).json({
      success: true,
      message: 'Ride updated successfully',
      data: updatedRide
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a ride (Owner only)
 * @route   DELETE /api/rides/:id
 * @access  Private (Ride driver only)
 */
const cancelRide = async (req, res, next) => {
  try {
    // req.ride attached by verifyRideOwnership middleware
    const ride = req.ride;

    ride.status = 'CANCELLED';
    await ride.save();

    return res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join a ride (Request to join and claim seat if available)
 * @route   POST /api/rides/:id/join
 * @access  Private (Authenticated passenger)
 */
const joinRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ride ID format'
      });
    }

    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // 1. Check if student is the driver
    if (ride.driver.toString() === studentId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own ride as a passenger'
      });
    }

    // 2. Check if ride is ACTIVE
    if (ride.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join a ride that is not active'
      });
    }

    // 3. Prevent duplicate join requests
    const existingRequest = await RideRequest.findOne({
      ride: id,
      student: studentId
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You have already sent a join request for this ride'
      });
    }

    // 4. Check seat capacity & perform atomic increment to prevent race conditions
    // Atomically find the ride where seatsFilled < seatLimit and increment seatsFilled
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: id,
        status: 'ACTIVE',
        $expr: { $lt: ['$seatsFilled', '$seatLimit'] }
      },
      {
        $inc: { seatsFilled: 1 }
      },
      {
        new: true
      }
    );

    // If update failed, seats are full or ride became inactive
    if (!updatedRide) {
      const latestRide = await Ride.findById(id);
      if (latestRide && latestRide.seatsFilled >= latestRide.seatLimit) {
        return res.status(400).json({
          success: false,
          message: 'Ride is already full. No seats available.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Unable to join ride. Ride may no longer be active.'
      });
    }

    // 5. Create the RideRequest with status ACCEPTED
    let rideRequest;
    try {
      rideRequest = await RideRequest.create({
        ride: id,
        student: studentId,
        status: 'ACCEPTED'
      });
    } catch (createErr) {
      // Rollback atomic seat increment if request creation fails (e.g. race on duplicate index)
      await Ride.findByIdAndUpdate(id, { $inc: { seatsFilled: -1 } });
      throw createErr;
    }

    const populatedRequest = await RideRequest.findById(rideRequest._id)
      .populate('ride', 'route departureTime seatLimit seatsFilled status')
      .populate('student', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Successfully joined the ride',
      data: {
        request: populatedRequest,
        ride: updatedRide
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  getRides,
  getRideById,
  updateRide,
  cancelRide,
  joinRide
};
