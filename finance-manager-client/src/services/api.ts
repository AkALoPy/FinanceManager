import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:5086/api', 
});

// Fetch all expenses
// Get all expenses
export const getExpenses = async () => {
    const response = await api.get('/expenses');
    return response.data;
  };
  
  // Get a single expense by ID
  export const getExpense = async (id: number) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  };
  
  // Add a new expense
  export const addExpense = async (expense: any) => {
    const response = await api.post('/expenses', expense);
    return response.data;
  };
  
  // Update an existing expense by ID
  export const updateExpense = async (id: number, expense: any) => {
    const response = await api.put(`/expenses/${id}`, expense);
    return response.data;
  };
  
  // Delete an expense by ID
  export const deleteExpense = async (id: number) => {
    await api.delete(`/expenses/${id}`);
  };