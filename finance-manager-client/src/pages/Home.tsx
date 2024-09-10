import React from 'react';

import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div>
      <h1>Welcome to Finance Manager</h1>
      <p>This is the home page of your application.</p>
      <button onClick={() => navigate('/expenses')}>Manage Your Expenses</button>
    </div>
  );
};

export default Home;  
