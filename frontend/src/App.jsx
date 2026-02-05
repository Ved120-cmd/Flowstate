import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dash from './pages/dash';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dash />} />
      </Routes>
    </Router>
  );
}

export default App;