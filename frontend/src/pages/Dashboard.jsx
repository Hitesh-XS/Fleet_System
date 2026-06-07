import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart } from 'chart.js';

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8000/api/vehicles/'),
      axios.get('http://localhost:8000/api/orders/')
    ])
    .then(([vehicleRes, orderRes]) => {
      setVehicles(vehicleRes.data);
      setOrders(orderRes.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error loading dashboard metrics:", error);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ color: '#8B5CF6', padding: '20px', fontWeight: 'bold' }}>Loading Core Systems...</div>;

  const totalVehicles = vehicles.length;
  const idleVehicles = vehicles.filter(v => v.status.toLowerCase() === 'idle').length;
  const activeVehicles = totalVehicles - idleVehicles;
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.delivered).length;
  const pendingOrders = totalOrders - completedOrders;

  // Set chart text to light gray for dark mode
  Chart.defaults.color = '#9ca3af';

  const fleetData = {
    labels: ['Active/En-Route', 'Idle/Parked'],
    datasets: [{
      data: [activeVehicles, idleVehicles],
      backgroundColor: ['#8B5CF6', '#1f2937'],
      borderColor: '#050505',
      borderWidth: 2,
    }],
  };

  const orderData = {
    labels: ['Total Orders', 'Delivered', 'Pending'],
    datasets: [{
      label: 'Order Volume',
      data: [totalOrders, completedOrders, pendingOrders],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const cardStyle = {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  };

  return (
    <div>
      <h2 style={{ marginBottom: '5px', fontSize: '28px', tracking: 'tight' }}>System Overview</h2>
      <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Real-time metrics and fleet utilization.</p>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '30px' }}>
        <div style={{...cardStyle, borderTop: '2px solid #8B5CF6'}}>
          <h3 style={{ margin: 0, color: '#9ca3af', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Fleet</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{totalVehicles}</p>
        </div>
        <div style={{...cardStyle, borderTop: '2px solid #f59e0b'}}>
          <h3 style={{ margin: 0, color: '#9ca3af', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Dispatches</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{pendingOrders}</p>
        </div>
        <div style={{...cardStyle, borderTop: '2px solid #10b981'}}>
          <h3 style={{ margin: 0, color: '#9ca3af', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Success Rate</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>
            {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', height: '350px' }}>
        <div style={{ flex: 1, ...cardStyle }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#e5e7eb' }}>Fleet Utilization</h4>
          <div style={{ height: '260px' }}><Pie data={fleetData} options={chartOptions} /></div>
        </div>
        <div style={{ flex: 2, ...cardStyle }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#e5e7eb' }}>Fulfillment Velocity</h4>
          <div style={{ height: '260px' }}><Bar data={orderData} options={chartOptions} /></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;