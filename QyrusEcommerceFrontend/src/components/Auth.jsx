// src/components/Auth.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useUser } from '../context/UserContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                terms and conditions
              </Link>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center space-y-2">
          <Link to="/forgot-password" className="text-blue-600 hover:underline block">
            Forgot Password?
          </Link>
          <Link to="/signup" className="text-blue-600 hover:underline block">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        
        {!showOtpForm ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
        
        <div className="text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">
          {!showOtpForm ? 'Forgot Password' : 'Reset Password'}
        </h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        
        {!showOtpForm ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <div className="text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back-to-Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export { Login, Signup, ForgotPassword };