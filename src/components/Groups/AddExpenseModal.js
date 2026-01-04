import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addExpense } from '../../services/groupService';
import { X, IndianRupee, User, FileText, AlertCircle } from 'lucide-react';

const AddExpenseModal = ({ group, onClose }) => {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    payerId: currentUser.uid,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =========================
     Derived Values (Optimized)
     ========================= */

  const payer = useMemo(
    () => group.memberDetails.find(m => m.uid === formData.payerId),
    [group.memberDetails, formData.payerId]
  );

  const perPersonAmount = useMemo(() => {
    if (!formData.amount) return '0.00';
    return (
      parseFloat(formData.amount) /
      (group.members?.length || 1)
    ).toFixed(2);
  }, [formData.amount, group.members]);

  /* ========================= */

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        return setError('Please enter an expense title');
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        return setError('Please enter a valid amount');
      }

      try {
        setError('');
        setLoading(true);

        await addExpense(group.id, {
          title: formData.title.trim(),
          amount: parseFloat(formData.amount),
          payerId: formData.payerId,
          payerName: payer?.displayName || 'Unknown',
        });

        onClose();
      } catch (err) {
        console.error('Error adding expense:', err);
        setError('Failed to add expense. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData, payer, group.id, onClose]
  );

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">

        {/* Header */}
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <IndianRupee className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
              <p className="text-sm text-gray-600">{group.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">

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

          {/* Title */}
          <Input
            label="Expense Title"
            icon={FileText}
            name="title"
            placeholder="e.g., Groceries, Dinner, Gas"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
          />

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              ₹
              Amount *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                required
                className="input-field pl-7"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Payer */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <User className="inline h-4 w-4 mr-1" />
              Paid by *
            </label>
            <select
              name="payerId"
              className="input-field"
              value={formData.payerId}
              onChange={handleChange}
              required
            >
              {group.memberDetails?.map(member => (
                <option key={member.uid} value={member.uid}>
                  {member.displayName}
                  {member.uid === currentUser.uid && ' (You)'}
                </option>
              ))}
            </select>
          </div>

          {/* Split Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
            <p className="font-medium text-blue-900 mb-1">Split Information</p>
            <p className="text-blue-800">
              • Split equally among {group.members?.length || 0} members
            </p>
            <p className="text-blue-800">
              • Each person owes: ₹{perPersonAmount}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
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
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="ml-2">Adding...</span>
                </span>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================
   Small Reusable Input
   ========================= */

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">
      <Icon className="inline h-4 w-4 mr-1" />
      {label} *
    </label>
    <input {...props} className="input-field" />
  </div>
);

export default AddExpenseModal;
