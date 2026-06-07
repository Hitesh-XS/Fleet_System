import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Orders from './pages/Orders';
import MapPage from './pages/MapPage';
import Health from './pages/Health';

function App() {
  const navStyle = {
    display: 'flex',
    gap: '30px',
    padding: '20px 40px',
    background: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const linkStyle = {
    color: '#e5e7eb',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '15px',
    letterSpacing: '0.5px'
  };

  return (
    <Router>
      <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff' } }} />

        <nav style={navStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto' }}>
            <span style={{ color: '#8B5CF6', fontSize: '20px' }}>🚚</span>
            <span style={{ fontWeight: '900', fontSize: '18px', tracking: 'tight' }}>NEXUS LOGISTICS</span>
          </div>
          <Link to="/" style={linkStyle}>Dashboard</Link>
          <Link to="/vehicles" style={linkStyle}>Fleet</Link>
          <Link to="/orders" style={linkStyle}>Orders</Link>
          <Link to="/map" style={linkStyle}>Live Map</Link>
        </nav>

        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/health" element={<Health />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;