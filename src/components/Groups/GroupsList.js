import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserGroups } from '../../services/groupService';

const GroupsList = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getUserGroups(currentUser.uid);
        if (mounted) setGroups(data);
      } catch (err) {
        console.error('Failed to load groups:', err);
        if (mounted) setError('Failed to load groups.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
            <p className="mt-1 text-gray-600">All groups you are a member of.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/groups/create" className="btn-secondary">Create</Link>
            <Link to="/groups/join" className="btn-primary">Join</Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-800">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="card text-center py-14">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-6">Create or join a group to get started.</p>
            <div className="flex justify-center gap-3">
              <Link to="/groups/create" className="btn-primary">Create Group</Link>
              <Link to="/groups/join" className="btn-secondary">Join Group</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`} className="card-hover block">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.members?.length || 0} members</p>
                  </div>
                  <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="font-medium text-primary-600">G</span>
                  </div>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <span>{group.createdAt?.toDate?.() ? group.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsList;