import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { PlusCircle, Eye, Edit3, Trash2, Users, CheckCircle2, Clock, MapPin, Car } from 'lucide-react';

const MyRides = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMyRides = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const data = await rideService.getRides({
        driver: user._id,
        status: 'ALL'
      });
      setMyRides(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your rides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRides();
  }, [user]);

  const handleCancelRide = async (rideId) => {
    const confirm = window.confirm('Are you sure you want to cancel this ride? This action cannot be undone.');
    if (!confirm) return;

    setActionLoading(rideId);
    setError('');
    try {
      await rideService.cancelRide(rideId);
      setSuccessMsg('Ride has been marked as CANCELLED.');
      await fetchMyRides();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel ride.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 className="page-title">My Posted Rides</h1>
          <p className="page-subtitle">Track your offered carpools, check passenger requests, and manage active journeys</p>
        </div>

        <Link to="/rides/create" className="btn btn-primary" style={{ gap: '0.45rem' }}>
          <PlusCircle size={18} strokeWidth={2.2} />
          <span>Post New Ride</span>
        </Link>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <ErrorMessage message={error} />

      {loading ? (
        <Loading message="Loading your campus rides..." isSkeleton={true} />
      ) : myRides.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4.5rem 2rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '1px solid var(--primary-border)'
            }}
          >
            <Car size={30} strokeWidth={2.2} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No rides posted yet
          </h3>

          <p style={{ maxWidth: '420px', margin: '0 auto 1.75rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            You haven't offered any carpool rides yet. Share your daily commute to help peers reach campus sustainably.
          </p>

          <Link to="/rides/create" className="btn btn-primary btn-lg">
            <PlusCircle size={18} strokeWidth={2.2} />
            <span>Create Your First Ride</span>
          </Link>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Departure Time</th>
                <th>Seat Capacity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRides.map((ride) => {
                const isCancelled = ride.status === 'CANCELLED';
                const formattedDate = new Date(ride.departureTime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={ride._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <MapPin size={15} strokeWidth={2.4} />
                        </div>
                        <span>{ride.route}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-seats">
                        {ride.seatsFilled} / {ride.seatLimit} seats
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isCancelled ? 'badge-cancelled' : 'badge-active'}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Link
                          to={`/rides/${ride._id}/requests`}
                          className="btn btn-secondary btn-sm"
                          title="View Join Requests"
                          style={{ gap: '0.35rem' }}
                        >
                          <Users size={14} />
                          <span>Requests</span>
                        </Link>

                        <Link
                          to={`/rides/${ride._id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Public Details"
                        >
                          <Eye size={14} />
                        </Link>

                        {!isCancelled && (
                          <>
                            <Link
                              to={`/rides/${ride._id}/edit`}
                              className="btn btn-secondary btn-sm"
                              title="Edit Ride"
                            >
                              <Edit3 size={14} />
                            </Link>

                            <button
                              className="btn btn-danger-outline btn-sm"
                              onClick={() => handleCancelRide(ride._id)}
                              disabled={actionLoading === ride._id}
                              title="Cancel Ride"
                            >
                              <Trash2 size={14} />
                              <span>Cancel</span>
                            </button>
                          </>
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

export default MyRides;
