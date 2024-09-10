import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';  

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/add-expense" element={<AddExpense />} />  {}
      </Routes>
    </Router>
  );
};

export default App;
