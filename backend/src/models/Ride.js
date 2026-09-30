const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Driver is required']
    },
    route: {
      type: String,
      required: [true, 'Route is required'],
      trim: true,
      minlength: [2, 'Route must be at least 2 characters long'],
      maxlength: [200, 'Route cannot exceed 200 characters']
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required']
    },
    seatLimit: {
      type: Number,
      required: [true, 'Seat limit is required'],
      min: [1, 'Seat limit must be at least 1']
    },
    seatsFilled: {
      type: Number,
      default: 0,
      min: [0, 'Seats filled cannot be negative'],
      validate: {
        validator: function (val) {
          // 'this.seatLimit' is accessible on new docs or when seatLimit is also set
          if (this.seatLimit !== undefined) {
            return val <= this.seatLimit;
          }
          return true;
        },
        message: 'Seats filled cannot exceed seat limit'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'CANCELLED'],
        message: '{VALUE} is not a valid status. Allowed: ACTIVE, CANCELLED'
      },
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
rideSchema.index({ route: 'text', status: 1 });
rideSchema.index({ departureTime: 1, status: 1 });
rideSchema.index({ driver: 1 });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
