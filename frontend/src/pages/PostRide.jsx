import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import ErrorMessage from '../components/ErrorMessage';
import { PlusCircle, MapPin, Calendar, Clock, Users, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';

const PostRide = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    route: '',
    departureDate: '',
    departureTime: '',
    seatLimit: 3
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!departureDate || !departureTime) {
      setError('Both departure date and time are required.');
      return;
    }
    const numSeats = Number(seatLimit);
    if (!numSeats || numSeats < 1) {
      setError('Seat limit must be at least 1.');
      return;
    }

    const fullDepartureDate = new Date(`${departureDate}T${departureTime}`);
    if (isNaN(fullDepartureDate.getTime())) {
      setError('Invalid departure date or time provided.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rideService.createRide({
        route: route.trim(),
        departureTime: fullDepartureDate.toISOString(),
        seatLimit: numSeats
      });

      navigate('/my-rides', {
        state: { message: 'Ride published successfully! Other students can now find and request to join.' }
      });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        setFieldErrors(resp.errors);
      } else {
        setError(resp?.message || 'Failed to create ride. Please check your inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '620px', margin: '0.5rem auto' }}>
      <Link
        to="/rides"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          transition: 'color 0.15s ease'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to All Rides</span>
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
            <PlusCircle size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Publish a Campus Ride
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
              Offer empty seats in your vehicle to fellow college students
            </p>
          </div>
        </div>

        <ErrorMessage message={error} errors={fieldErrors} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="route">
              Route Details (Pickup & Drop) <span style={{ color: 'var(--terracotta)' }}>*</span>
            </label>
            <div className="input-with-icon-wrapper">
              <MapPin size={18} className="input-icon-left" />
              <input
                id="route"
                type="text"
                name="route"
                className="form-control"
                placeholder="e.g. Sector 15 Metro Station → Engineering Campus"
                value={formData.route}
                onChange={handleChange}
                required
              />
            </div>
            <p className="form-helper">Specify key pickup stops and college entrance</p>
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
              Available Seat Capacity <span style={{ color: 'var(--terracotta)' }}>*</span>
            </label>
            <div className="input-with-icon-wrapper">
              <Users size={18} className="input-icon-left" />
              <input
                id="seatLimit"
                type="number"
                name="seatLimit"
                className="form-control"
                min="1"
                max="20"
                placeholder="3"
                value={formData.seatLimit}
                onChange={handleChange}
                required
              />
            </div>
            <p className="form-helper">Total passenger seats you are offering</p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Only verified students from your campus will be able to request seats.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing Ride...' : 'Publish Ride'}
            </button>
            <Link to="/rides" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRide;
