import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { MapPin, User, Mail, Phone, Calendar, Clock, Users, ArrowLeft, CheckCircle2, AlertCircle, Edit3, Trash2, ShieldCheck } from 'lucide-react';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isJoining, setIsJoining] = useState(false);

  const fetchRide = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rideService.getRideById(id);
      setRide(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ride not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  const handleJoinRide = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setFeedback({ type: '', message: '' });
    setIsJoining(true);
    try {
      const res = await rideService.joinRide(id);
      setFeedback({
        type: 'success',
        message: res.message || 'You have successfully requested to join this ride!'
      });
      // Refresh ride details to update seats
      fetchRide();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join ride.';
      setFeedback({
        type: 'error',
        message: msg
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelRide = async () => {
    const confirm = window.confirm('Are you sure you want to cancel this ride?');
    if (!confirm) return;

    try {
      await rideService.cancelRide(id);
      navigate('/my-rides', {
        state: { message: 'Ride cancelled successfully.' }
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel ride.'
      });
    }
  };

  if (loading) return <Loading message="Loading carpool details..." />;
  if (error || !ride) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <ErrorMessage message={error || 'Ride not found'} />
        <Link to="/rides" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Back to All Rides</span>
        </Link>
      </div>
    );
  }

  const isDriver = user && ride.driver && (ride.driver._id === user._id || ride.driver === user._id);
  const isCancelled = ride.status === 'CANCELLED';
  const availableSeats = Math.max(0, ride.seatLimit - ride.seatsFilled);
  const isFull = availableSeats === 0;

  const formattedDate = new Date(ride.departureTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(ride.departureTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getInitials = (name) => {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0.5rem auto' }}>
      <Link
        to="/rides"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Rides</span>
      </Link>

      {/* Feedback Banner */}
      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2.25rem' }}>
        {/* Header: Route & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--primary-border)'
                }}
              >
                <MapPin size={20} strokeWidth={2.4} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{ride.route}</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '2.9rem' }}>
              Campus Carpool Route
            </p>
          </div>
          <span className={`badge ${isCancelled ? 'badge-cancelled' : 'badge-active'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            {ride.status}
          </span>
        </div>

        {/* Departure & Timing Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Calendar size={15} color="var(--primary)" />
              <span>Departure Date</span>
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{formattedDate}</p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Clock size={15} color="var(--primary)" />
              <span>Departure Time</span>
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{formattedTime}</p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Users size={15} color="var(--primary)" />
              <span>Seat Availability</span>
            </div>
            <p style={{ fontWeight: 800, color: isFull ? 'var(--terracotta)' : 'var(--primary)', fontSize: '1rem' }}>
              {isFull ? '0 Seats Left (Full)' : `${availableSeats} of ${ride.seatLimit} Available`}
            </p>
          </div>
        </div>

        {/* Driver Information Card */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.35rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Driver Profile
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>
              <ShieldCheck size={16} />
              <span>Verified Student</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                border: '1px solid var(--primary-border)'
              }}
            >
              {getInitials(ride.driver?.name)}
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {ride.driver?.name || 'Driver'}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Offers safe & verified student commutes
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span>Email: <strong style={{ color: 'var(--text-main)' }}>{ride.driver?.email || 'N/A'}</strong></span>
            </div>
            {ride.driver?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Phone size={16} color="var(--text-muted)" />
                <span>Phone: <strong style={{ color: 'var(--text-main)' }}>{ride.driver?.phone}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isDriver ? (
            <>
              <Link to={`/rides/${ride._id}/requests`} className="btn btn-primary" style={{ gap: '0.45rem' }}>
                <Users size={16} />
                <span>View Join Requests</span>
              </Link>
              {!isCancelled && (
                <>
                  <Link to={`/rides/${ride._id}/edit`} className="btn btn-secondary" style={{ gap: '0.45rem' }}>
                    <Edit3 size={16} />
                    <span>Edit Ride</span>
                  </Link>
                  <button onClick={handleCancelRide} className="btn btn-danger-outline" style={{ gap: '0.45rem' }}>
                    <Trash2 size={16} />
                    <span>Cancel Ride</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {!isCancelled && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleJoinRide}
                  disabled={isJoining || isFull}
                  style={{ flex: 1 }}
                >
                  {isJoining ? (
                    <span>Sending Join Request...</span>
                  ) : isFull ? (
                    <span>Ride is Full (0 Seats Left)</span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Request / Join Ride</span>
                    </>
                  )}
                </button>
              )}
              {isCancelled && (
                <div className="alert alert-error" style={{ width: '100%', marginBottom: 0 }}>
                  <span>This ride has been cancelled by the driver and cannot be joined.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetails;
