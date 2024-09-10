import React, { useState, useEffect } from 'react';
import { getExpense, updateExpense } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const EditExpense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<any>({
    name: '',
    amount: '',
    date: '',
    category: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpense = async () => {
      if (id) {
        try {
          const fetchedExpense = await getExpense(Number(id));
          setExpense(fetchedExpense);
        } catch (error) {
          console.error('Error fetching expense:', error);
        }
      }
    };

    fetchExpense();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpense((prevExpense: any) => ({
      ...prevExpense,
      [name]: value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateExpense(Number(id), {
        ...expense,
        amount: parseFloat(expense.amount), 
        date: new Date(expense.date).toISOString(), 
      });
      navigate('/');
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={expense.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={expense.amount}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={expense.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={expense.category}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit">Update Expense</button>
    </form>
  );
};

export default EditExpense;
