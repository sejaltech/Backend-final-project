const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride reference is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'ACCEPTED', 'REJECTED'],
        message: '{VALUE} is not a valid request status'
      },
      default: 'ACCEPTED'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent a student from sending multiple join requests for the same ride
rideRequestSchema.index({ ride: 1, student: 1 }, { unique: true });

const RideRequest = mongoose.model('RideRequest', rideRequestSchema);

module.exports = RideRequest;
