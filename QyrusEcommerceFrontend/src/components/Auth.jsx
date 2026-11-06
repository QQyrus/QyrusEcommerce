// src/components/Auth.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useUser } from '../context/UserContext';
import Logo from './Logo';

const AuthShell = ({ title, subtitle, children }) => (
  <div className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 overflow-hidden">
    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
    <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
    <div className="relative max-w-md w-full">
      <div className="flex justify-center mb-6">
        <Logo size="lg" />
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-violet-900/5 border border-gray-100 p-8">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500 text-center">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  </div>
);

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow';

const primaryButtonClass =
  'w-full py-2.5 px-4 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser(); // Get login method from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure the terms checkbox is checked
    if (!termsChecked) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      login(email); // Update global login state
      navigate('/products'); // Redirect to products page
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Qart">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center py-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          className={inputClass}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          className={inputClass}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            checked={termsChecked}
            onChange={(e) => setTermsChecked(e.target.checked)}
            className="mr-2 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{' '}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline font-medium"
            >
              terms and conditions
            </Link>
          </label>
        </div>
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>
      <div className="text-center space-y-2 mt-5 text-sm">
        <Link to="/forgot-password" className="text-violet-600 hover:underline block font-medium">
          Forgot Password?
        </Link>
        <Link to="/signup" className="text-gray-500 hover:text-violet-600 block">
          Don't have an account? <span className="font-medium">Sign up</span>
        </Link>
      </div>
    </AuthShell>
  );
};


// src/components/Signup.jsx
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.signup(email, password);
      setTempToken(data.token);
      setShowOtpForm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.verifyEmail(otp, tempToken);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Qart and start shopping">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center py-2">
          {error}
        </div>
      )}

      {!showOtpForm ? (
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            required
            className={inputClass}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            className={inputClass}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            required
            className={inputClass}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      <div className="text-center mt-5 text-sm">
        <Link to="/login" className="text-gray-500 hover:text-violet-600">
          Already have an account? <span className="font-medium text-violet-600">Login</span>
        </Link>
      </div>
    </AuthShell>
  );
};

// src/components/ForgotPassword.jsx
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.forgotPassword(email);
      setResetToken(data.token);
      setShowOtpForm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.resetPassword(newPassword, otp, resetToken);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={!showOtpForm ? 'Forgot Password' : 'Reset Password'}>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center py-2">
          {error}
        </div>
      )}

      {!showOtpForm ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            required
            className={inputClass}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Sending...' : 'Send Reset OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="text"
            required
            className={inputClass}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            required
            className={inputClass}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <div className="text-center mt-5 text-sm">
        <Link to="/login" className="text-violet-600 hover:underline font-medium">
          Back to Login
        </Link>
      </div>
    </AuthShell>
  );
};

export { Login, Signup, ForgotPassword };
