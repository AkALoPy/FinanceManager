import React, { useEffect, useState } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../services/api';

interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState<string>('');

  const predefinedCategories = ['Food', 'Transport', 'Utilities', 'Housing'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  const handleAddOrUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', isEditing ? 'Editing' : 'Adding', editingExpense || newExpense);

    try {
      const category = useCustomCategory ? customCategory : isEditing && editingExpense ? editingExpense.category : newExpense.category;

      if (!category) {
        alert('Please select or enter a category.');
        return;
      }

      if (isEditing && editingExpense) {
        await updateExpense(editingExpense.id, {
          ...editingExpense,
          category: category,
        });
        console.log('Expense updated:', editingExpense);
      } else {
        await addExpense({
          ...newExpense,
          category: category,
        });
        console.log('Expense added:', newExpense);
      }

      setEditingExpense(null);
      setNewExpense({});
      setCustomCategory('');
      setIsEditing(false);
      setUseCustomCategory(false);
      fetchExpenses(); // Refresh the expense list
    } catch (error) {
      console.error('Error adding or updating expense:', error);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditing(true);
    setUseCustomCategory(!predefinedCategories.includes(expense.category)); // If category is not in predefined list, use custom
    setCustomCategory(!predefinedCategories.includes(expense.category) ? expense.category : ''); // Set custom category if available
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        console.log('Expense deleted:', id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isEditing && editingExpense) {
      setEditingExpense({ ...editingExpense, [name]: name === 'amount' ? parseFloat(value) : value });
    } else {
      setNewExpense({ ...newExpense, [name]: name === 'amount' ? parseFloat(value) : value });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'Other') {
      setUseCustomCategory(true);
      setCustomCategory(''); // Reset custom category input when selecting "Other"
      if (isEditing && editingExpense) {
        setEditingExpense({ ...editingExpense, category: '' });
      } else {
        setNewExpense((prev) => ({ ...prev, category: '' }));
      }
    } else {
      setUseCustomCategory(false);
      handleInputChange(e);
    }
  };

  return (
    <div>
      <h1>Expenses</h1>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.name} - ${expense.amount} on {new Date(expense.date).toLocaleDateString()} ({expense.category})
            <button onClick={() => handleEditClick(expense)}>Edit</button>
            <button onClick={() => handleDeleteClick(expense.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
      <form onSubmit={handleAddOrUpdateExpense}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={isEditing && editingExpense ? editingExpense.name : newExpense.name || ''}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={isEditing && editingExpense ? editingExpense.amount : newExpense.amount || ''}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          value={isEditing && editingExpense ? editingExpense.date.split('T')[0] : newExpense.date || ''}
          onChange={handleInputChange}
          required
        />
        <select
          name="category"
          onChange={handleCategoryChange}
          value={useCustomCategory ? 'Other' : isEditing && editingExpense ? editingExpense.category : newExpense.category || ''}
          required={!useCustomCategory} // Make this required only if not using a custom category
        >
          <option value="">Select Category</option>
          {predefinedCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {useCustomCategory && (
          <input
            type="text"
            name="customCategory"
            placeholder="Enter Custom Category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
          />
        )}

        <button type="submit">{isEditing ? 'Update Expense' : 'Add Expense'}</button>
        {isEditing && <button onClick={() => setIsEditing(false)}>Cancel</button>}
      </form>
    </div>
  );
};

export default Expenses;
