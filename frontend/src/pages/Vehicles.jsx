import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '', capacity: '', status: 'idle', latitude: 19.0760, longitude: 72.8777, current_load: 0
  });

  const fetchVehicles = () => {
    axios.get('http://localhost:8000/api/vehicles/')
      .then(res => { setVehicles(res.data); setLoading(false); })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleInputChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/api/vehicles/', newVehicle)
      .then(res => {
        fetchVehicles();
        setNewVehicle({ ...newVehicle, vehicle_number: '', capacity: '' });
        toast.success(`Vehicle ${res.data.vehicle_number} successfully deployed!`);
      })
      .catch(err => toast.error("Failed to add vehicle to fleet."));
  };

  if (loading) return <div style={{ color: '#8B5CF6', padding: '20px', fontWeight: 'bold' }}>Loading Fleet Manifest...</div>;

  const cardStyle = { backgroundColor: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '30px' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' };
  const thStyle = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' };
  const tdStyle = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb' };

  return (
    <div>
      <h2 style={{ marginBottom: '5px', fontSize: '28px', color: '#fff' }}>Fleet Management</h2>
      <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Deploy and monitor active transport units.</p>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#e5e7eb', fontSize: '18px', marginBottom: '20px' }}>🚛 Deploy New Vehicle</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label style={labelStyle}>Vehicle ID</label>
            <input type="text" name="vehicle_number" value={newVehicle.vehicle_number} onChange={handleInputChange} required placeholder="MH-03-XX99" style={inputStyle} />
          </div>

          <div style={{ flex: '0 1 150px', minWidth: '120px' }}>
            <label style={labelStyle}>Capacity (kg)</label>
            <input type="number" name="capacity" value={newVehicle.capacity} onChange={handleInputChange} required placeholder="500" style={inputStyle} />
          </div>

          <div style={{ flex: '0 1 200px', minWidth: '150px' }}>
            <label style={labelStyle}>Initial Status</label>
            <select name="status" value={newVehicle.status} onChange={handleInputChange} style={inputStyle}>
              <option value="idle">Idle / Parked</option>
              <option value="active">Active / En-Route</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <button type="submit" style={{ flex: '0 0 auto', padding: '12px 24px', backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Add to Fleet
          </button>
        </form>
      </div>

      <div style={{...cardStyle, padding: 0, overflow: 'hidden'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <tr>
              <th style={thStyle}>Vehicle ID</th>
              <th style={thStyle}>Capacity</th>
              <th style={thStyle}>Current Load</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} style={{ transition: 'background-color 0.2s' }}>
                <td style={{...tdStyle, fontWeight: 'bold'}}>{vehicle.vehicle_number}</td>
                <td style={tdStyle}>{vehicle.capacity} kg</td>
                <td style={tdStyle}>
                  <span style={{ color: vehicle.current_load > 0 ? '#f59e0b' : '#9ca3af' }}>{vehicle.current_load} kg</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                    backgroundColor: vehicle.status === 'idle' ? 'rgba(156, 163, 175, 0.1)' : (vehicle.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'),
                    color: vehicle.status === 'idle' ? '#9ca3af' : (vehicle.status === 'active' ? '#10b981' : '#f43f5e')
                  }}>
                    {vehicle.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vehicles;