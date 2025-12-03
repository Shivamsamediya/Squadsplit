import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addExpense } from '../../services/groupService';
import { X, DollarSign, User, FileText, AlertCircle } from 'lucide-react';

const AddExpenseModal = ({ group, onClose }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    payerId: currentUser.uid
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter an expense title');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const payer = group.memberDetails.find(member => member.uid === formData.payerId);
      
      await addExpense(group.id, {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        payerId: formData.payerId,
        payerName: payer?.displayName || 'Unknown'
      });
      
      onClose();
    } catch (error) {
      setError('Failed to add expense. Please try again.');
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
              <p className="text-sm text-gray-600">{group.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Expense Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input-field"
              placeholder="e.g., Groceries, Dinner, Gas"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                step="0.01"
                min="0.01"
                className="input-field pl-7"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="payerId" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Paid by *
            </label>
            <select
              id="payerId"
              name="payerId"
              required
              className="input-field"
              value={formData.payerId}
              onChange={handleChange}
            >
              {group.memberDetails?.map((member) => (
                <option key={member.uid} value={member.uid}>
                  {member.displayName}
                  {member.uid === currentUser.uid && ' (You)'}
                </option>
              ))}
            </select>
          </div>

          {/* Split Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Split Information
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• This expense will be split equally among all {group.members?.length || 0} members</p>
              <p>• Each person will owe: ${formData.amount ? (parseFloat(formData.amount) / (group.members?.length || 1)).toFixed(2) : '0.00'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="ml-2">Adding...</span>
                </div>
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

export default AddExpenseModal;
