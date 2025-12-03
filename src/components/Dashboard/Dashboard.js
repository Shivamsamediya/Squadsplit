import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserGroups } from '../../services/groupService';
import { 
  Plus, 
  Users, 
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const userGroups = await getUserGroups(currentUser.uid);
        setGroups(userGroups);
      } catch (error) {
        setError('Failed to load groups');
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchGroups();
    }
  }, [currentUser]);

  const getUserBalance = () => {
  if (!currentUser) return 0;
  return groups.reduce((total, group) => {
    const userBalance = group.balances?.[currentUser.uid] || 0;
    return total + userBalance;
  }, 0);
};

  const getRecentGroups = () => {
    return groups.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.displayName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your expense groups and track balances
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Groups</p>
                <p className="text-2xl font-semibold text-gray-900">{groups.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                  Rs
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">You Owe</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{getUserBalance().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Groups</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {groups.filter(group => group.members?.length > 1).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/groups/create"
              className="btn-primary flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Group
            </Link>
            <Link
              to="/groups/join"
              className="btn-secondary flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Group
            </Link>
          </div>
        </div>

        {/* Recent Groups */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Groups</h2>
            <Link
              to="/groups"
              className="text-primary-600 hover:text-primary-500 font-medium flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <p className="text-danger-800">{error}</p>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No groups yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first group to start splitting expenses with friends and family.
              </p>
              <Link to="/groups/create" className="btn-primary">
                Create Your First Group
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecentGroups().map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="card-hover block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {group.createdAt?.toDate?.() ? 
                        group.createdAt.toDate().toLocaleDateString() : 
                        'Recently'
                      }
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• Create a group and share the code with friends to invite them</li>
            <li>• Add expenses and let SquadSplit automatically calculate who owes what</li>
            <li>• All updates happen in real-time, so everyone stays in sync</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
