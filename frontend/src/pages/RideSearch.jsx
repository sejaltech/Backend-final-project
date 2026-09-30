import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { useAuth } from '../context/AuthContext';
import RideCard from '../components/RideCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Search, RotateCcw, PlusCircle, Car, AlertCircle, CheckCircle2, MapPin, Calendar, Sparkles } from 'lucide-react';

const RideSearch = () => {
  const { isAuthenticated } = useAuth();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [joiningId, setJoiningId] = useState(null);

  const [routeQuery, setRouteQuery] = useState('');
  const [timeQuery, setTimeQuery] = useState('');

  // Fetch rides from backend API
  const fetchRides = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await rideService.getRides(filters);
      setRides(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rides from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    const filters = {};
    if (routeQuery.trim()) filters.route = routeQuery.trim();
    if (timeQuery.trim()) filters.time = timeQuery.trim();
    fetchRides(filters);
  };

  const handleClear = () => {
    setRouteQuery('');
    setTimeQuery('');
    setFeedback({ type: '', message: '' });
    fetchRides();
  };

  const handleJoinRide = async (rideId) => {
    if (!isAuthenticated) return;
    setFeedback({ type: '', message: '' });
    setJoiningId(rideId);
    try {
      const res = await rideService.joinRide(rideId);
      setFeedback({
        type: 'success',
        message: res.message || 'Successfully joined the ride!'
      });
      // Refresh rides from backend to update seats
      fetchRides({
        ...(routeQuery.trim() && { route: routeQuery.trim() }),
        ...(timeQuery.trim() && { time: timeQuery.trim() })
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join ride.';
      setFeedback({
        type: 'error',
        message: msg
      });
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sage)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <Sparkles size={14} />
            <span>Campus Mobility Hub</span>
          </div>
          <h1 className="page-title">Find your next campus ride</h1>
          <p className="page-subtitle">Search daily routes, share rides with verified students, and cut commute emissions.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/rides/create" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <PlusCircle size={18} strokeWidth={2.2} />
            <span>Post a Ride</span>
          </Link>
        </div>
      </div>

      {/* Notifications / Feedback */}
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

      {/* Search and Filter Section */}
      <div className="search-banner">
        <form onSubmit={handleSearch} className="search-form-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="routeFilter">
              Route or Location
            </label>
            <div className="input-with-icon-wrapper">
              <MapPin size={17} className="input-icon-left" />
              <input
                id="routeFilter"
                type="text"
                className="form-control"
                placeholder="e.g. Station, Hostel, Main Gate..."
                value={routeQuery}
                onChange={(e) => setRouteQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="timeFilter">
              Departure Date
            </label>
            <div className="input-with-icon-wrapper">
              <Calendar size={17} className="input-icon-left" />
              <input
                id="timeFilter"
                type="date"
                className="form-control"
                value={timeQuery}
                onChange={(e) => setTimeQuery(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '42px', gap: '0.45rem', padding: '0 1.25rem' }}>
            <Search size={16} strokeWidth={2.2} />
            <span>Search</span>
          </button>

          {(routeQuery || timeQuery) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              style={{ height: '42px', gap: '0.45rem', padding: '0 1rem' }}
              title="Reset search filters"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Error state */}
      <ErrorMessage message={error} />

      {/* Rides List Content */}
      {loading ? (
        <Loading message="Fetching active campus rides..." isSkeleton={true} />
      ) : rides.length === 0 ? (
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

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.015em' }}>
            No rides available yet
          </h3>

          <p style={{ maxWidth: '440px', margin: '0 auto 1.75rem', fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {routeQuery || timeQuery
              ? 'No active rides match your search criteria. Try adjusting your route query or departure date.'
              : 'There are currently no active rides published. Be the first student to offer empty seats on your route!'}
          </p>

          <Link to="/rides/create" className="btn btn-primary btn-lg">
            <PlusCircle size={18} strokeWidth={2.2} />
            <span>Offer a Ride Now</span>
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{rides.length}</strong> active carpool{rides.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid-rides">
            {rides.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                onJoin={handleJoinRide}
                joiningId={joiningId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RideSearch;
