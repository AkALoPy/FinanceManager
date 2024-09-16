import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:5086/api', 
});


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
  // Get the total expense amount for the month
  export const getMonthlyTotal = async (): Promise<number> => {
    try {
      const response = await api.get('/expenses/monthly-total'); 
      console.log('Monthly Total Response:', response.data); 
      return response.data; 
    } catch (error) {
      console.error('Error fetching monthly total:', error);
      throw error;
    }
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