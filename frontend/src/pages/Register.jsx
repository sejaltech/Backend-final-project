import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap, Compass, Car } from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/rides');
    }
  }, [isAuthenticated, navigate]);

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
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim()
      });

      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        setFieldErrors(resp.errors);
      } else {
        setError(resp?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left side: Brand Showcase */}
      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="auth-brand-pill">
            <Car size={14} />
            <span>Campus Mobility Network</span>
          </div>

          <h1 className="auth-brand-headline">
            Your campus.<br />Your route.<br />Your ride.
          </h1>

          <p className="auth-brand-text">
            Join thousands of verified classmates carpooling to campus daily. Cut your travel costs, reduce local emissions, and travel with peers you can trust.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <ShieldCheck size={16} />
              </div>
              <span>Strictly verified college email domains</span>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Compass size={16} />
              </div>
              <span>Flexible door-to-campus commuting routes</span>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Zap size={16} />
              </div>
              <span>Instant ride coordination & zero commission</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <CheckCircle2 size={16} color="var(--primary)" />
          <span>Sustainable & safe student mobility</span>
        </div>
      </div>

      {/* Right side: Registration Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-subtitle">Register with your college credentials to start sharing rides.</p>
          </div>

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <ErrorMessage message={error} errors={fieldErrors} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <div className="input-with-icon-wrapper">
                <User size={18} className="input-icon-left" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                College Email
              </label>
              <div className="input-with-icon-wrapper">
                <Mail size={18} className="input-icon-left" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-with-icon-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control has-toggle"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <div className="input-with-icon-wrapper">
                <Phone size={18} className="input-icon-left" />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Student Account...' : 'Register'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
