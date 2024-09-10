import React, { useState } from 'react';
import { addExpense } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddExpense: React.FC = () => {
  const [expense, setExpense] = useState({
    name: '',
    amount: '',
    date: '',
    category: '',
    customCategory: '',
  });
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const navigate = useNavigate();

  const predefinedCategories = ['Food', 'Transport', 'Utilities', 'Housing'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'Other') {
      setUseCustomCategory(true);
      setExpense((prev) => ({ ...prev, category: '', customCategory: '' }));
    } else {
      setUseCustomCategory(false);
      setExpense((prev) => ({ ...prev, category: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const category = useCustomCategory ? expense.customCategory : expense.category;
      await addExpense({
        ...expense,
        amount: parseFloat(expense.amount),
        date: new Date(expense.date).toISOString(),
        category: category,
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={expense.name}
        onChange={handleChange}
        placeholder="Expense Name"
        required
      />
      <input
        type="number"
        name="amount"
        value={expense.amount}
        onChange={handleChange}
        placeholder="Amount"
        required
      />
      <input
        type="date"
        name="date"
        value={expense.date}
        onChange={handleChange}
        required
      />

      <select name="category" onChange={handleCategoryChange} required>
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
          value={expense.customCategory}
          onChange={handleChange}
          placeholder="Enter Custom Category"
          required
        />
      )}

      <button type="submit">Add Expense</button>
    </form>
  );
};

export default AddExpense;
