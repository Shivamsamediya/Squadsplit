import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createGroup } from '../../services/groupService';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';

const CreateGroup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    setError('Group name is required');
    return;
  }

  try {
    setError('');
    setLoading(true);
    
    console.log('Creating group with data:', {
      name: formData.name.trim(),
      description: formData.description.trim(),
      user: currentUser
    });
    
    const group = await createGroup(
      formData.name.trim(),
      formData.description.trim(),
      currentUser
    );
    
    console.log('Group created successfully:', group);
    navigate(`/groups/${group.id}`);
  } catch (error) {
    console.error('Error creating group:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'permission-denied') {
      setError('Permission denied. Please check Firestore rules.');
    } else if (error.code === 'unavailable') {
      setError('Firebase service unavailable. Please check your connection.');
    } else {
      setError(`Failed to create group: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
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
              <h1 className="text-2xl font-bold text-gray-900">Create New Group</h1>
              <p className="text-gray-600">Start splitting expenses with friends and family</p>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
                placeholder="e.g., Roommates, Trip to Paris, Family Dinner"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
              />
              <p className="mt-1 text-sm text-gray-500">
                Choose a descriptive name for your group
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input-field resize-none"
                placeholder="Add a brief description of what this group is for..."
                value={formData.description}
                onChange={handleChange}
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/200 characters
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• A unique group code will be generated</li>
                <li>• You can share this code with friends to invite them</li>
                <li>• Start adding expenses and let SquadSplit handle the math</li>
              </ul>
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
                    <span className="ml-2">Creating...</span>
                  </div>
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
