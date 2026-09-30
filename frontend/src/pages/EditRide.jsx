import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Edit3, ArrowLeft, MapPin, Calendar, Clock, Users } from 'lucide-react';

const EditRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    route: '',
    departureDate: '',
    departureTime: '',
    seatLimit: 1
  });

  const [currentSeatsFilled, setCurrentSeatsFilled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await rideService.getRideById(id);
        const ride = res.data;

        // Check driver ownership on frontend for UX
        const driverId = ride.driver?._id || ride.driver;
        if (driverId && user?._id && driverId !== user._id) {
          setError('You are not authorized to modify this ride.');
          setLoading(false);
          return;
        }

        const dep = new Date(ride.departureTime);
        const dateStr = dep.toISOString().split('T')[0];
        const timeStr = dep.toTimeString().split(' ')[0].substring(0, 5);

        setFormData({
          route: ride.route,
          departureDate: dateStr,
          departureTime: timeStr,
          seatLimit: ride.seatLimit
        });
        setCurrentSeatsFilled(ride.seatsFilled || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch ride details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setFieldErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    const { route, departureDate, departureTime, seatLimit } = formData;
    if (!route.trim()) {
      setError('Route is required.');
      return;
    }

    const numSeats = Number(seatLimit);
    if (!numSeats || numSeats < 1) {
      setError('Seat limit must be at least 1.');
      return;
    }

    if (numSeats < currentSeatsFilled) {
      setError(`Cannot reduce seat limit to ${numSeats} because ${currentSeatsFilled} seats are already filled.`);
      return;
    }

    const fullDepartureDate = new Date(`${departureDate}T${departureTime}`);
    if (isNaN(fullDepartureDate.getTime())) {
      setError('Invalid departure date or time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rideService.updateRide(id, {
        route: route.trim(),
        departureTime: fullDepartureDate.toISOString(),
        seatLimit: numSeats
      });

      navigate('/my-rides', {
        state: { message: 'Ride details updated successfully!' }
      });
    } catch (err) {
      const resp = err.response?.data;
      if (err.response?.status === 403) {
        setError('403 Forbidden: You are not authorized to edit this ride.');
      } else if (resp?.errors && Array.isArray(resp.errors)) {
        setFieldErrors(resp.errors);
      } else {
        setError(resp?.message || 'Failed to update ride.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading ride details..." />;

  return (
    <div style={{ maxWidth: '620px', margin: '0.5rem auto' }}>
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

      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
          <div
            style={{
              padding: '0.7rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)'
            }}
          >
            <Edit3 size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Edit Ride Details
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
              Update route, schedule or seat capacity for this journey
            </p>
          </div>
        </div>

        <ErrorMessage message={error} errors={fieldErrors} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="route">
              Route Details <span style={{ color: 'var(--terracotta)' }}>*</span>
            </label>
            <div className="input-with-icon-wrapper">
              <MapPin size={18} className="input-icon-left" />
              <input
                id="route"
                type="text"
                name="route"
                className="form-control"
                value={formData.route}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="departureDate">
                Departure Date <span style={{ color: 'var(--terracotta)' }}>*</span>
              </label>
              <div className="input-with-icon-wrapper">
                <Calendar size={18} className="input-icon-left" />
                <input
                  id="departureDate"
                  type="date"
                  name="departureDate"
                  className="form-control"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="departureTime">
                Departure Time <span style={{ color: 'var(--terracotta)' }}>*</span>
              </label>
              <div className="input-with-icon-wrapper">
                <Clock size={18} className="input-icon-left" />
                <input
                  id="departureTime"
                  type="time"
                  name="departureTime"
                  className="form-control"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="seatLimit">
              Seat Limit (Currently {currentSeatsFilled} filled) <span style={{ color: 'var(--terracotta)' }}>*</span>
            </label>
            <div className="input-with-icon-wrapper">
              <Users size={18} className="input-icon-left" />
              <input
                id="seatLimit"
                type="number"
                name="seatLimit"
                className="form-control"
                min={Math.max(1, currentSeatsFilled)}
                value={formData.seatLimit}
                onChange={handleChange}
                required
              />
            </div>
            <p className="form-helper">Seat limit cannot be lower than the {currentSeatsFilled} seats currently claimed</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <Link to="/my-rides" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRide;
