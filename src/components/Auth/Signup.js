import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }

      if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters');
      }

      try {
        setError('');
        setLoading(true);
        await signup(formData.email, formData.password, formData.displayName);
        navigate('/dashboard');
      } catch (err) {
        console.error('Signup error:', err);
        setError(
          err.code === 'auth/email-already-in-use'
            ? 'An account with this email already exists'
            : 'Failed to create an account'
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, signup, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <header className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </header>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>

          {error && (
            <div className="rounded-md border border-danger-200 bg-danger-50 p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-danger-500 mt-0.5" />
                <p className="ml-3 text-sm font-medium text-danger-800">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">

            {/* Name */}
            <Input
              label="Full Name"
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              icon={User}
              value={formData.displayName}
              onChange={handleChange}
            />

            {/* Email */}
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
            />

            {/* Password */}
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="ml-2">Creating account...</span>
              </span>
            ) : (
              'Create account'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

/* =========================
   Reusable Input (UI only)
   ========================= */

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        {...props}
        required
        className="input-field pl-10"
      />
    </div>
  </div>
);

export default Signup;
