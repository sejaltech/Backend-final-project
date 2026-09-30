import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RideCard = ({ ride, onJoin, joiningId }) => {
  const { user, isAuthenticated } = useAuth();

  const availableSeats = Math.max(0, ride.seatLimit - ride.seatsFilled);
  const isFull = availableSeats === 0;
  const isDriver = user && ride.driver && (ride.driver._id === user._id || ride.driver === user._id);
  const isCancelled = ride.status === 'CANCELLED';

  const formattedDate = new Date(ride.departureTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Route & Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <div className="ride-card-route-icon">
            <MapPin size={17} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="ride-card-title">
              {ride.route}
            </h3>
          </div>
        </div>
        <span className={`badge ${isCancelled ? 'badge-cancelled' : 'badge-active'}`}>
          {ride.status}
        </span>
      </div>

      {/* Ride Details Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', flex: 1 }}>
        <div className="ride-meta-row">
          <User size={15} color="var(--text-muted)" strokeWidth={2.2} />
          <span>Driver: <strong>{ride.driver?.name || 'Verified Student'}</strong></span>
        </div>

        <div className="ride-meta-row">
          <Clock size={15} color="var(--text-muted)" strokeWidth={2.2} />
          <span>{formattedDate}</span>
        </div>

        <div className="ride-meta-row">
          <Users size={15} color="var(--text-muted)" strokeWidth={2.2} />
          <span>
            Capacity: <strong>{ride.seatsFilled}</strong> / {ride.seatLimit} seats filled
          </span>
        </div>

        <div style={{ marginTop: '0.35rem' }}>
          <span className={`badge ${isFull ? 'badge-seats-full' : 'badge-seats'}`}>
            {isFull ? 'Full (0 Seats Left)' : `${availableSeats} Seat${availableSeats !== 1 ? 's' : ''} Available`}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
        <Link to={`/rides/${ride._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          <span>Details</span>
          <ArrowRight size={14} />
        </Link>

        {isAuthenticated && !isDriver && !isCancelled && !isFull && onJoin && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onJoin(ride._id)}
            disabled={joiningId === ride._id}
            style={{ flex: 1 }}
          >
            {joiningId === ride._id ? (
              <span>Joining...</span>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Join Ride</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default RideCard;
