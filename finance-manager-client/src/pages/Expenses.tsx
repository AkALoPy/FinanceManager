import React, { useEffect, useState } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, getMonthlyTotal } from '../services/api';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  recurringExpense: boolean;
  recurrenceInterval?: string;
  recurrenceEndDate?: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState<string>('');

  const predefinedCategories = ['Food', 'Transport', 'Utilities', 'Housing'];
  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null);

  useEffect(() => {
    fetchExpenses();
    fetchMonthlyTotal();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
      calculateMonthlyTotal(data);
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  const fetchMonthlyTotal = async () => {
    try {
      const total = await getMonthlyTotal();
      if (typeof total === 'number') {
        setMonthlyTotal(total);
      } else {
        console.error('Monthly total is not a number:', total);
      }
    } catch (error) {
      console.error('Error fetching monthly total:', error);
    }
  };

  const calculateMonthlyTotal = (expenses: Expense[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const total = expenses
      .filter(
        (expense) =>
          new Date(expense.date).getMonth() === currentMonth &&
          new Date(expense.date).getFullYear() === currentYear
      )
      .reduce((sum, expense) => sum + expense.amount, 0);

    setMonthlyTotal(total);
  };



  const handleAddOrUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const category = useCustomCategory ? customCategory : isEditing && editingExpense ? editingExpense.category : newExpense.category;

    if (!category) {
      alert('Please select or enter a category.');
      return;
    }

    const formattedExpense = {
      ...(isEditing && editingExpense ? editingExpense : newExpense),
      date: isEditing && editingExpense
        ? new Date(editingExpense.date).toISOString()
        : newExpense.date
          ? new Date(newExpense.date).toISOString()
          : '',
      recurrenceEndDate:
        (isEditing && editingExpense && editingExpense.recurrenceEndDate)
          ? new Date(editingExpense.recurrenceEndDate).toISOString()
          : (newExpense.recurrenceEndDate)
            ? new Date(newExpense.recurrenceEndDate).toISOString()
            : undefined,
      category,
    };

    try {
      if (isEditing && editingExpense) {
        await updateExpense(editingExpense.id, formattedExpense);
      } else {
        await addExpense(formattedExpense);
      }

      setEditingExpense(null);
      setNewExpense({});
      setCustomCategory('');
      setIsEditing(false);
      setUseCustomCategory(false);

      fetchExpenses();
    } catch (error) {
      console.error('Error adding or updating expense:', error);
    }
  };


  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditing(true);
    setUseCustomCategory(!predefinedCategories.includes(expense.category));
    setCustomCategory(!predefinedCategories.includes(expense.category) ? expense.category : '');
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isEditing && editingExpense) {
      setEditingExpense({ ...editingExpense, [name]: name === 'amount' ? parseFloat(value) : value });
    } else {
      setNewExpense({ ...newExpense, [name]: name === 'amount' ? parseFloat(value) : value });
    }
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value === 'Other') {
      setUseCustomCategory(true);
      setCustomCategory('');
      if (isEditing && editingExpense) {
        setEditingExpense({ ...editingExpense, category: '' });
      } else {
        setNewExpense((prev) => ({ ...prev, category: '' }));
      }
    } else {
      setUseCustomCategory(false);
      if (isEditing && editingExpense) {
        setEditingExpense({ ...editingExpense, category: value });
      } else {
        setNewExpense((prev) => ({ ...prev, category: value }));
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" textAlign={'center'} component="div" sx={{ flexGrow: 1 }}>
            Finance Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ marginTop: 2, padding: 1, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
      <Typography variant="h5" textAlign={'center'}>
        Total Monthly Expenses: ${monthlyTotal !== null && monthlyTotal !== undefined && !isNaN(monthlyTotal) ? monthlyTotal.toFixed(2) : 'Loading...'}
      </Typography>
      </Box>
      <Container maxWidth="md" sx={{ marginTop: 4, paddingBottom: 4 }}>
        <Grid container spacing={3}>
          {expenses.map((expense) => (
            <Grid item xs={12} sm={6} md={4} key={expense.id}>
              <Card sx={{ backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{expense.name}</Typography>
                  <Typography color="text.secondary">${expense.amount}</Typography>
                  <Typography color="text.secondary">{new Date(expense.date).toLocaleDateString()}</Typography>
                  <Typography color="text.secondary">{expense.category}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleEditClick(expense)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(expense.id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#fff', borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 3 }}>{isEditing ? 'Edit Expense' : 'Add New Expense'}</Typography>
          <form onSubmit={handleAddOrUpdateExpense}>
            <TextField
              label="Name"
              name="name"
              value={isEditing && editingExpense ? editingExpense.name : newExpense.name || ''}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              sx={{ backgroundColor: 'white' }}
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={isEditing && editingExpense ? editingExpense.amount : newExpense.amount || ''}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              sx={{ backgroundColor: 'white' }}
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={isEditing && editingExpense ? editingExpense.date.split('T')[0] : newExpense.date || ''}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: 'white' }}
            />
            <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                onChange={handleCategoryChange}
                value={useCustomCategory ? 'Other' : isEditing && editingExpense ? editingExpense.category : newExpense.category || ''}
                required={!useCustomCategory}
                sx={{ backgroundColor: 'white' }}
              >
                {predefinedCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {useCustomCategory && (
              <TextField
                label="Custom Category"
                name="customCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                fullWidth
                margin="normal"
                sx={{ backgroundColor: 'white' }}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={isEditing && editingExpense ? editingExpense.recurringExpense : newExpense.recurringExpense || false}
                  onChange={(e) => {
                    if (isEditing && editingExpense) {
                      setEditingExpense({ ...editingExpense, recurringExpense: e.target.checked });
                    } else {
                      setNewExpense({ ...newExpense, recurringExpense: e.target.checked });
                    }
                  }}
                />
              }
              label="Recurring Expense"
            />

            {((isEditing && editingExpense?.recurringExpense) || (!isEditing && newExpense.recurringExpense)) && (
              <>
                <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
                  <InputLabel>Recurrence Interval</InputLabel>
                  <Select
                    name="recurrenceInterval"
                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
                    value={isEditing && editingExpense ? editingExpense.recurrenceInterval : newExpense.recurrenceInterval || ''}
                    sx={{ backgroundColor: 'white' }}
                  >
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Recurrence End Date"
                  name="recurrenceEndDate"
                  type="date"
                  value={isEditing && editingExpense ? editingExpense.recurrenceEndDate?.split('T')[0] : newExpense.recurrenceEndDate || ''}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: 'white' }}
                />
              </>
            )}

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
              {isEditing ? 'Update Expense' : 'Add Expense'}
            </Button>
            {isEditing && (
              <Button variant="outlined" color="secondary" fullWidth sx={{ marginTop: 2 }} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </form>
        </Box>
      </Container>
    </>
  );
};

export default Expenses;
