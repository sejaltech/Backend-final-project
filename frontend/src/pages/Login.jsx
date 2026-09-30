import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Car, Compass, Users } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/rides';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email.trim(), formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      setError(resp?.message || 'Invalid email or password.');
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
            <span>Welcome Back</span>
          </div>

          <h1 className="auth-brand-headline">
            Smart, shared rides<br />for campus life.
          </h1>

          <p className="auth-brand-text">
            Log in to manage your rides, check incoming passenger requests, and connect with peers along your daily campus route.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Users size={16} />
              </div>
              <span>Peer-to-peer campus ride sharing</span>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Compass size={16} />
              </div>
              <span>Real-time seat tracking and request alerts</span>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <ShieldCheck size={16} />
              </div>
              <span>Trusted student community</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <CheckCircle2 size={16} color="var(--primary)" />
          <span>Carbon-conscious campus mobility</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Student Sign In</h2>
            <p className="auth-form-subtitle">Enter your college credentials to access campus rides.</p>
          </div>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit}>
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
