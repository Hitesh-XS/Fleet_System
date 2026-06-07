import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState({
    customer_name: '', latitude: '', longitude: '', weight: '', priority: '50', delivered: false
  });

  // --- Health Status Logic ---
  const HealthStatus = () => {
    const [status, setStatus] = useState('Checking...');
    const [color, setColor] = useState('#9ca3af');

    useEffect(() => {
      axios.get('http://localhost:8000/api/health/')
        .then(() => { setStatus('System Online'); setColor('#10b981'); })
        .catch(() => { setStatus('System Offline'); setColor('#f43f5e'); });
    }, []);

    return (
      <div style={{ fontSize: '12px', marginBottom: '10px', color: '#9ca3af' }}>
        Backend Connection: <span style={{ fontWeight: 'bold', color: color }}>{status}</span>
      </div>
    );
  };

  // --- New Algorithm Controls Component ---
  const AlgorithmControls = () => {
    const [running, setRunning] = useState(false);
    const [assignments, setAssignments] = useState([]);

    const runOptimizer = () => {
      setRunning(true);
      axios.post('http://localhost:8000/api/assign/')
        .then(res => {
          setAssignments(res.data.assignments);
          toast.success(`Optimized ${res.data.count} assignments!`);
          fetchOrders(); // Refresh table after optimization
        })
        .catch(() => toast.error("Algorithm Engine failed."));
      setRunning(false);
    };

    return (
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runOptimizer}
          disabled={running}
          style={{ padding: '10px 20px', backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {running ? 'Running Engine...' : 'Run Greedy Optimizer'}
        </button>
        {assignments.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#9ca3af', backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <strong>Last Run:</strong> {assignments.length} orders matched to vehicles.
          </div>
        )}
      </div>
    );
  };

  const fetchOrders = () => {
    axios.get('http://localhost:8000/api/orders/')
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleInputChange = (e) => {
    setNewOrder({ ...newOrder, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...newOrder,
      latitude: parseFloat(newOrder.latitude),
      longitude: parseFloat(newOrder.longitude),
      weight: parseInt(newOrder.weight),
      priority: parseInt(newOrder.priority)
    };

    axios.post('http://localhost:8000/api/orders/', payload)
      .then(res => {
        fetchOrders();
        setNewOrder({ customer_name: '', latitude: '', longitude: '', weight: '', priority: '50', delivered: false });
        toast.success(`Order #${res.data.id} registered!`);
      })
      .catch(err => toast.error("Failed to register order. Check coordinates."));
  };

  const getPriorityBadge = (priority) => {
    if (priority >= 80) return <span style={{ padding: '4px 8px', backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>CRITICAL ({priority})</span>;
    if (priority >= 40) return <span style={{ padding: '4px 8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>MEDIUM ({priority})</span>;
    return <span style={{ padding: '4px 8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>LOW ({priority})</span>;
  };

  const cardStyle = { backgroundColor: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '30px' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' };
  const thStyle = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' };
  const tdStyle = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb' };

  return (
    <div>
      <h2 style={{ marginBottom: '5px', fontSize: '28px', color: '#fff' }}>Order Manifest</h2>
      <HealthStatus />

      <div style={cardStyle}>
        <AlgorithmControls />
        <h3 style={{ marginTop: 0, color: '#e5e7eb', fontSize: '18px', marginBottom: '20px' }}>📦 Register New Shipment</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Form fields remain the same as previous iteration */}
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label style={labelStyle}>Customer Name</label>
            <input type="text" name="customer_name" value={newOrder.customer_name} onChange={handleInputChange} required placeholder="Rohan Mehta" style={inputStyle} />
          </div>
          <div style={{ flex: '0 1 120px', minWidth: '100px' }}>
            <label style={labelStyle}>Latitude</label>
            <input type="number" step="any" name="latitude" value={newOrder.latitude} onChange={handleInputChange} required placeholder="19.059" style={inputStyle} />
          </div>
          <div style={{ flex: '0 1 120px', minWidth: '100px' }}>
            <label style={labelStyle}>Longitude</label>
            <input type="number" step="any" name="longitude" value={newOrder.longitude} onChange={handleInputChange} required placeholder="72.829" style={inputStyle} />
          </div>
          <div style={{ flex: '0 1 100px', minWidth: '80px' }}>
            <label style={labelStyle}>Weight</label>
            <input type="number" name="weight" value={newOrder.weight} onChange={handleInputChange} required placeholder="45" style={inputStyle} />
          </div>
          <div style={{ flex: '0 1 120px', minWidth: '100px' }}>
            <label style={labelStyle}>Priority</label>
            <input type="number" min="1" max="100" name="priority" value={newOrder.priority} onChange={handleInputChange} required style={inputStyle} />
          </div>
          <button type="submit" style={{ flex: '0 0 auto', padding: '12px 24px', backgroundColor: '#06b6d4', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Book
          </button>
        </form>
      </div>

      <div style={{...cardStyle, padding: 0, overflow: 'hidden'}}>
        {loading ? <div style={{ padding: '20px', color: '#fff' }}>Loading Data...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Coordinates</th>
                <th style={thStyle}>Payload</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{...tdStyle, color: '#6b7280'}}>#{order.id}</td>
                  <td style={{...tdStyle, fontWeight: 'bold'}}>{order.customer_name}</td>
                  <td style={{...tdStyle, fontFamily: 'monospace', color: '#9ca3af'}}>
                    {Number(order.latitude).toFixed(4)}, {Number(order.longitude).toFixed(4)}
                  </td>
                  <td style={tdStyle}>{order.weight} kg</td>
                  <td style={tdStyle}>{getPriorityBadge(order.priority)}</td>
                  <td style={tdStyle}>{order.delivered ? '✓ FULFILLED' : '⏳ PENDING'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Orders;