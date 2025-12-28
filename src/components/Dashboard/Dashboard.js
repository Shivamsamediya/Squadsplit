import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserGroups } from '../../services/groupService';
import {
  Plus,
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const userGroups = await getUserGroups(currentUser.uid);
        setGroups(userGroups);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  /* =========================
     Derived Data (Optimized)
     ========================= */

  const userBalance = useMemo(() => {
    if (!currentUser) return 0;
    return groups.reduce((total, group) => {
      return total + (group.balances?.[currentUser.uid] || 0);
    }, 0);
  }, [groups, currentUser]);

  const activeGroupsCount = useMemo(() => {
    return groups.filter(g => g.members?.length > 1).length;
  }, [groups]);

  const recentGroups = useMemo(() => {
    return groups.slice(0, 3);
  }, [groups]);

  /* ========================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.displayName} 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your expense groups and track balances
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<Users className="h-5 w-5 text-primary-600" />}
            title="Total Groups"
            value={groups.length}
            bg="bg-primary-100"
          />

          <StatCard
            icon={<span className="font-semibold text-success-600">₹</span>}
            title="You Owe"
            value={`₹${userBalance.toFixed(2)}`}
            bg="bg-success-100"
          />

          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            title="Active Groups"
            value={activeGroupsCount}
            bg="bg-blue-100"
          />
        </section>

        {/* Quick Actions */}
        <section className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link to="/groups/create" className="btn-primary flex items-center justify-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Group
          </Link>

          <Link to="/groups/join" className="btn-secondary flex items-center justify-center">
            <Users className="h-5 w-5 mr-2" />
            Join Group
          </Link>
        </section>

        {/* Recent Groups */}
        <section className="mb-10">
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
            <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-800">
              {error}
            </div>
          )}

          {groups.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• Create a group and share the code with friends</li>
            <li>• Add expenses and let calculations happen automatically</li>
            <li>• Real-time updates keep everyone in sync</li>
          </ul>
        </section>

      </div>
    </div>
  );
};

/* =========================
   Small UI Components
   ========================= */

const StatCard = ({ icon, title, value, bg }) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const GroupCard = ({ group }) => (
  <Link to={`/groups/${group.id}`} className="card-hover block">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
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

    <div className="flex items-center text-sm text-gray-500">
      <Calendar className="h-4 w-4 mr-1" />
      {group.createdAt?.toDate?.()
        ? group.createdAt.toDate().toLocaleDateString()
        : 'Recently'}
    </div>
  </Link>
);

const EmptyState = () => (
  <div className="card text-center py-14">
    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No groups yet
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Create your first group to start splitting expenses with friends and family.
    </p>
    <Link to="/groups/create" className="btn-primary">
      Create Your First Group
    </Link>
  </div>
);

export default Dashboard;
