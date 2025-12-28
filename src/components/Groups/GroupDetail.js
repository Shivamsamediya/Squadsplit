import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getGroup,
  subscribeToGroup,
  getGroupExpenses,
  calculateBalances,
  leaveGroup,
} from '../../services/groupService';
import {
  Users,
  Plus,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';

const GroupDetail = () => {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  /* =========================
     Fetch + Subscriptions
     ========================= */

  useEffect(() => {
    let mounted = true;

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const data = await getGroup(groupId);
        if (mounted) setGroup(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();

    const unsubscribeGroup = subscribeToGroup(groupId, setGroup);
    const unsubscribeExpenses = getGroupExpenses(groupId, setExpenses);

    return () => {
      mounted = false;
      unsubscribeGroup();
      unsubscribeExpenses();
    };
  }, [groupId]);

  /* =========================
     Derived Data
     ========================= */

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );
  }, [expenses]);

  useEffect(() => {
    if (!group) return;
    const result = calculateBalances(
      expenses,
      group.memberDetails || []
    );
    setBalances(result);
  }, [group, expenses]);

  /* =========================
     Handlers
     ========================= */

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleLeaveGroup = useCallback(async () => {
    try {
      await leaveGroup(groupId, currentUser.uid);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  }, [groupId, currentUser.uid, navigate]);

  const formatBalance = (amount) => {
    const value = parseFloat(amount || 0);
    if (value > 0)
      return <span className="text-success-600">+₹{value.toFixed(2)}</span>;
    if (value < 0)
      return <span className="text-danger-600">-₹{Math.abs(value).toFixed(2)}</span>;
    return <span className="text-gray-600">₹0.00</span>;
  };

  /* ========================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-danger-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Group not found
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {group.name}
              </h1>
              {group.description && (
                <p className="mb-4 text-gray-600">{group.description}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {group.members?.length || 0} members
                </span>
                <span>₹{totalExpenses.toFixed(2)} total</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </button>

              <button
                onClick={() => copyToClipboard(group.groupCode)}
                className="btn-secondary flex items-center"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Code
              </button>
            </div>
          </div>
        </header>

        {/* Group Code */}
        <div className="card mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Group Code</h3>
            <p className="text-sm text-gray-600">
              Share this code to invite members
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-gray-100 px-4 py-2 font-mono text-lg">
              {group.groupCode}
            </span>
            <button onClick={() => copyToClipboard(group.groupCode)}>
              {copied ? (
                <Check className="h-5 w-5 text-success-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Balances */}
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold">Balances</h3>
            <div className="space-y-3">
              {group.memberDetails?.map(member => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.displayName}
                      {member.uid === currentUser.uid && ' (You)'}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  {formatBalance(balances[member.uid])}
                </div>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div className="card lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Recent Expenses</h3>

            {expenses.length === 0 ? (
              <div className="py-10 text-center">
                <p className="mb-4 text-gray-600">
                  No expenses yet. Add the first one!
                </p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="btn-primary"
                >
                  Add Expense
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-gray-500">
                        Paid by {expense.payerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{parseFloat(expense.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{(
                          parseFloat(expense.amount) /
                          (group.members?.length || 1)
                        ).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leave */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="btn-danger flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Group
          </button>
        </div>
      </div>

      {showAddExpense && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmLeave
          groupName={group.name}
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeaveGroup}
        />
      )}
    </div>
  );
};

/* ========================= */

const ConfirmLeave = ({ groupName, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-lg bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Leave Group?</h3>
      <p className="mb-6 text-gray-600">
        Are you sure you want to leave "{groupName}"?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger flex-1">
          Leave
        </button>
      </div>
    </div>
  </div>
);

export default GroupDetail;
