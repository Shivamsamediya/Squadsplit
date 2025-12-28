import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createGroup } from '../../services/groupService';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';

const CreateGroup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.name.trim()) {
        return setError('Group name is required');
      }

      try {
        setError('');
        setLoading(true);

        const group = await createGroup(
          formData.name.trim(),
          formData.description.trim(),
          currentUser
        );

        navigate(`/groups/${group.id}`);
      } catch (err) {
        console.error('Error creating group:', err);

        if (err.code === 'permission-denied') {
          setError('Permission denied. Please check Firestore rules.');
        } else if (err.code === 'unavailable') {
          setError('Firebase service unavailable. Please check your connection.');
        } else {
          setError(`Failed to create group: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, currentUser, navigate]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Group
              </h1>
              <p className="text-gray-600">
                Start splitting expenses with friends and family
              </p>
            </div>
          </div>
        </header>

        {/* Form Card */}
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

            {/* Group Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Group Name *
              </label>
              <input
                type="text"
                name="name"
                maxLength={50}
                required
                className="input-field"
                placeholder="e.g., Roommates, Trip to Paris, Family Dinner"
                value={formData.name}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Choose a descriptive name for your group
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={3}
                maxLength={200}
                className="input-field resize-none"
                placeholder="Add a brief description of what this group is for..."
                value={formData.description}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <p className="mb-2 font-medium text-blue-900">
                What happens next?
              </p>
              <ul className="space-y-1 text-blue-800">
                <li>• A unique group code will be generated</li>
                <li>• Share the code to invite friends</li>
                <li>• Start adding expenses instantly</li>
              </ul>
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
                    <span className="ml-2">Creating...</span>
                  </span>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
