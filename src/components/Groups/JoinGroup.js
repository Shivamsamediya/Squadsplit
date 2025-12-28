import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { joinGroup } from '../../services/groupService';
import { Users, ArrowLeft, AlertCircle, Copy, Check } from 'lucide-react';

const JoinGroup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!groupCode.trim()) {
        return setError('Please enter a group code');
      }

      try {
        setError('');
        setLoading(true);

        const group = await joinGroup(
          groupCode.trim().toUpperCase(),
          currentUser
        );

        navigate(`/groups/${group.id}`);
      } catch (err) {
        console.error('Error joining group:', err);

        if (err.message === 'Invalid group code') {
          setError('Invalid group code. Please check and try again.');
        } else if (err.message === 'You are already a member of this group') {
          setError('You are already a member of this group.');
        } else {
          setError('Failed to join group. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [groupCode, currentUser, navigate]
  );

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Join a Group</h1>
              <p className="text-gray-600">
                Enter the group code to join an existing group
              </p>
            </div>
          </div>
        </header>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="rounded-md border border-danger-200 bg-danger-50 p-4">
                <div className="flex items-start">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-danger-500" />
                  <p className="ml-3 text-sm font-medium text-danger-800">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Group Code */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Group Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoComplete="off"
                placeholder="ABC123"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                className="input-field text-center font-mono text-lg tracking-wider"
              />
              <p className="mt-1 text-center text-sm text-gray-500">
                Enter the 6-character code shared by the group creator
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <p className="mb-2 font-medium text-blue-900">
                Don't have a group code?
              </p>
              <p className="mb-3 text-blue-800">
                Ask the group creator to share the code with you.
              </p>

              <div className="flex items-center justify-between rounded border bg-white p-3">
                <span className="font-mono text-sm text-gray-600">
                  Example: ABC123
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('ABC123')}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="ml-2">Joining...</span>
                  </span>
                ) : (
                  'Join Group'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help */}
        <div className="card mt-8 bg-gray-50">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            How to get a group code?
          </h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li>1️⃣ Ask the group creator for the code</li>
            <li>2️⃣ The code is a 6-character alphanumeric value</li>
            <li>3️⃣ Enter it above and click “Join Group”</li>
          </ol>
        </div>

      </div>
    </div>
  );
};

export default JoinGroup;
