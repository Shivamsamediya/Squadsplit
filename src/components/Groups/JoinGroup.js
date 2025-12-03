import React, { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupCode.trim()) {
      setError('Please enter a group code');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const group = await joinGroup(groupCode.trim().toUpperCase(), currentUser);
      navigate(`/groups/${group.id}`);
    } catch (error) {
      if (error.message === 'Invalid group code') {
        setError('Invalid group code. Please check and try again.');
      } else if (error.message === 'You are already a member of this group') {
        setError('You are already a member of this group.');
      } else {
        setError('Failed to join group. Please try again.');
      }
      console.error('Error joining group:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Join a Group</h1>
              <p className="text-gray-600">Enter the group code to join an existing group</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-danger-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-danger-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-danger-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700 mb-2">
                Group Code *
              </label>
              <input
                type="text"
                id="groupCode"
                name="groupCode"
                required
                className="input-field text-center text-lg font-mono tracking-wider"
                placeholder="ABCD12"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
              />
              <p className="mt-1 text-sm text-gray-500 text-center">
                Enter the 6-character code shared by the group creator
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Don't have a group code?
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Ask the group creator to share the group code with you. It's a 6-character code like "ABC123".
              </p>
              <div className="flex items-center justify-between bg-white rounded border border-blue-200 p-3">
                <span className="text-sm text-gray-600">Example: ABC123</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('ABC123')}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Joining...</span>
                  </div>
                ) : (
                  'Join Group'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 card bg-gray-50 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How to get a group code?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">1</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Ask the person who created the group to share the group code with you
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">2</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  The group code is a 6-character combination of letters and numbers
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">3</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Enter the code above and click "Join Group" to become a member
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;
