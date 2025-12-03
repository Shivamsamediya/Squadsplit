import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getGroup, 
  subscribeToGroup, 
  getGroupExpenses, 
  calculateBalances,
  leaveGroup 
} from '../../services/groupService';
import { 
  Users, 
  Plus, 
  Share2, 
  Copy, 
  Check,
  ArrowLeft,
  LogOut,
  AlertTriangle
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

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const groupData = await getGroup(groupId);
        setGroup(groupData);
      } catch (error) {
        setError('Failed to load group');
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();

    // Subscribe to real-time updates
    const unsubscribeGroup = subscribeToGroup(groupId, (groupData) => {
      if (groupData) {
        setGroup(groupData);
      }
    });

    // Subscribe to expenses
    const unsubscribeExpenses = getGroupExpenses(groupId, (expensesData) => {
      setExpenses(expensesData);
    });

    return () => {
      unsubscribeGroup();
      unsubscribeExpenses();
    };
  }, [groupId]);

  useEffect(() => {
    if (group && expenses.length > 0) {
      const calculatedBalances = calculateBalances(expenses, group.memberDetails || []);
      setBalances(calculatedBalances);
    }
  }, [group, expenses]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId, currentUser.uid);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  const getMemberBalance = (memberId) => {
    return balances[memberId] || 0;
  };

  const formatBalance = (balance) => {
    const amount = parseFloat(balance);
    if (amount > 0) {
      return <span className="text-success-600">+₹{amount.toFixed(2)}</span>;
    } else if (amount < 0) {
      return <span className="text-danger-600">-₹{Math.abs(amount).toFixed(2)}</span>;
    } else {
      return <span className="text-gray-600">$0.00</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-danger-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The group you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              {group.description && (
                <p className="text-gray-600 mb-4">{group.description}</p>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.members?.length || 0} members
                </div>
                <div className="flex items-center">
                  ₹{getTotalExpenses().toFixed(2)} total
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
              
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(group.groupCode)}
                  className="btn-secondary flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Code
                </button>
                {copied && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Group Code Display */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Group Code</h3>
              <p className="text-sm text-gray-600">Share this code with friends to invite them</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="font-mono text-lg font-semibold tracking-wider">
                  {group.groupCode}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(group.groupCode)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-success-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balances */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Balances</h3>
              <div className="space-y-3">
                {(group.memberDetails || []).map((member) => (
                  <div
                    key={member.uid}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {member.displayName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.displayName}
                          {member.uid === currentUser.uid && ' (You)'}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatBalance(getMemberBalance(member.uid))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Add Expense
                </button>
              </div>
              
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your first expense to start tracking shared costs.
                  </p>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="btn-primary"
                  >
                    Add First Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{expense.title}</h4>
                        <p className="text-sm text-gray-500">
                          Paid by {expense.payerName} • {expense.createdAt?.toDate?.() ? 
                            expense.createdAt.toDate().toLocaleDateString() : 'Recently'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{parseFloat(expense.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{(parseFloat(expense.amount) / (group.members?.length || 1)).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leave Group Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="btn-danger flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Group
          </button>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Leave Group?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave "{group.name}"? You won't be able to see expenses or balances for this group anymore.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                className="btn-danger flex-1"
              >
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
