import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Users, Check, X, Clock, Mail, Phone, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

const RideRequests = () => {
  const { id } = useParams();

  const [requests, setRequests] = useState([]);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRideAndRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const [rideRes, reqRes] = await Promise.all([
        rideService.getRideById(id),
        rideService.getRideRequests(id)
      ]);
      setRide(rideRes.data);
      setRequests(reqRes.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('403 Forbidden: You are not authorized to view requests for this ride. Only the driver has permission.');
      } else {
        setError(err.response?.data?.message || 'Failed to load join requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideAndRequests();
  }, [id]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    setActionLoading(requestId);
    setFeedback({ type: '', message: '' });
    try {
      const res = await rideService.updateRideRequestStatus(id, requestId, newStatus);
      setFeedback({
        type: 'success',
        message: res.message || `Request updated to ${newStatus}`
      });

      // Update the request in state
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );

      // Update seat counts on ride
      if (res.data?.rideSeats && ride) {
        setRide((prev) => ({
          ...prev,
          seatsFilled: res.data.rideSeats.seatsFilled,
          seatLimit: res.data.rideSeats.seatLimit
        }));
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || `Failed to update request to ${newStatus}.`
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loading message="Loading ride requests..." />;

  const availableSeats = ride ? Math.max(0, ride.seatLimit - ride.seatsFilled) : 0;

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0.5rem auto' }}>
      <Link
        to="/my-rides"
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
        <span>Back to My Rides</span>
      </Link>

      {/* Ride Summary Card */}
      {ride && (
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                <MapPin size={18} strokeWidth={2.4} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ride Request Management
                </p>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{ride.route}</h1>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span className="badge badge-seats" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                Filled: {ride.seatsFilled} / {ride.seatLimit}
              </span>
              <span className={`badge ${availableSeats > 0 ? 'badge-active' : 'badge-seats-full'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                {availableSeats} Seat{availableSeats !== 1 ? 's' : ''} Remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action feedback */}
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

      <ErrorMessage message={error} />

      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#ffffff' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid var(--border)'
            }}
          >
            <Users size={26} strokeWidth={2} />
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            No join requests yet
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            When students request to join this route, their profile and contact details will appear here for you to accept or decline.
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Passenger</th>
                <th>Contact Info</th>
                <th>Requested On</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const requestedTimeFormatted = new Date(req.requestedAt || req.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const isAccepted = req.status === 'ACCEPTED';
                const isRejected = req.status === 'REJECTED';

                return (
                  <tr key={req._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: '1px solid var(--primary-border)'
                          }}
                        >
                          {getInitials(req.student?.name)}
                        </div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.925rem' }}>
                          {req.student?.name || 'Student'}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={13} color="var(--text-muted)" /> {req.student?.email}
                        </span>
                        {req.student?.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={13} color="var(--text-muted)" /> {req.student?.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        <span>{requestedTimeFormatted}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isAccepted
                            ? 'badge-accepted'
                            : isRejected
                            ? 'badge-rejected'
                            : 'badge-pending'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {isAccepted ? (
                          <button
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => handleUpdateStatus(req._id, 'REJECTED')}
                            disabled={actionLoading === req._id}
                            title="Reject request and free seat"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(req._id, 'ACCEPTED')}
                            disabled={actionLoading === req._id || availableSeats <= 0}
                            title={availableSeats <= 0 ? 'Ride is full' : 'Accept request and claim seat'}
                          >
                            <Check size={14} />
                            <span>Accept</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RideRequests;
