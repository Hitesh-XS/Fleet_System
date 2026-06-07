import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))) * 1.3;
};

const warehouseIcon = new L.DivIcon({ html: `<div style="background-color: #000; color: white; padding: 6px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; border: 2px solid #8B5CF6; box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); white-space: nowrap;">🏠 HUB</div>`, className: 'custom-warehouse-marker', iconSize: [80, 30], iconAnchor: [40, 15]});
const vehicleIcon = (num, status) => {
  const isAllActive = status.toLowerCase() === 'active' || status.toLowerCase() === 'en_route';
  const color = isAllActive ? '#10b981' : '#3b82f6';
  return new L.DivIcon({ html: `<div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 20px; font-weight: bold; font-size: 11px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 0 8px ${color}; text-align: center; white-space: nowrap;">🚚 ${num}</div>`, className: 'custom-vehicle-marker', iconSize: [60, 25], iconAnchor: [30, 12]});
};
const orderIcon = (priority, delivered, isQueued) => {
  if (delivered) return new L.DivIcon({ html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; opacity: 0.3;"></div>`, className: 'custom-order-marker-done', iconSize: [12, 12], iconAnchor: [6, 6] });
  if (isQueued) return new L.DivIcon({ html: `<div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 2px dashed white; box-shadow: 0 0 10px #f97316;"></div>`, className: 'custom-order-marker-queued', iconSize: [16, 16], iconAnchor: [8, 8] });
  return new L.DivIcon({ html: `<div style="background-color: #06b6d4; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px #06b6d4;"></div>`, className: 'custom-order-marker', iconSize: [14, 14], iconAnchor: [7, 7] });
};

function MapPage() {
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState(null);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const warehousePosition = [19.0760, 72.8777];
  const AVG_SPEED_KMH = 30;

  const itineraries = useRef({});
  const isDriving = useRef({});
  const intervals = useRef({});
  const vanLocations = useRef({});

  const loadOperationalData = () => {
    Promise.all([axios.get('http://localhost:8000/api/vehicles/'), axios.get('http://localhost:8000/api/orders/')])
    .then(([vRes, oRes]) => {
      setVehicles(vRes.data); setOrders(oRes.data); setLoading(false);
      vRes.data.forEach(v => {
        if (!itineraries.current[v.id]) itineraries.current[v.id] = [];
        if (isDriving.current[v.id] === undefined) isDriving.current[v.id] = false;
        if (!vanLocations.current[v.id]) vanLocations.current[v.id] = { lat: v.latitude, lng: v.longitude };
      });
    });
  };

  useEffect(() => { loadOperationalData(); }, []);

  const fetchRoute = async (lat, lng) => {
    const start = `${warehousePosition[1]},${warehousePosition[0]}`;
    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start};${lng},${lat}?overview=full&geometries=geojson`);
    setActiveRoute(response.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
  };

  const autoAssignBestVehicle = async (order) => {
    const validVehicles = vehicles.filter(v => {
      const plannedWeight = itineraries.current[v.id]?.reduce((sum, o) => sum + o.weight, 0) || 0;
      return v.status !== 'maintenance' && (v.capacity - v.current_load - plannedWeight) >= order.weight;
    });

    if (validVehicles.length === 0) {
      if (!pendingQueue.includes(order.id)) {
        setPendingQueue(prev => [...prev, order.id]);
        toast.error(`Order #${order.id} queued. No available capacity.`);
      }
      return;
    }

    let bestVehicle = validVehicles[0];
    const allStops = [...itineraries.current[bestVehicle.id], order];
    const currentLoc = vanLocations.current[bestVehicle.id];

    try {
      const optResponse = await axios.post('http://localhost:8000/api/optimize/', {
        start: currentLoc,
        stops: allStops.map(o => ({ id: o.id, lat: o.latitude, lng: o.longitude, weight: o.weight }))
      });
      const optimizedIds = optResponse.data.optimized_path.map(stop => stop.id);
      itineraries.current[bestVehicle.id] = optimizedIds.map(id => allStops.find(o => o.id === id));
      toast.success(`Route Optimized for ${bestVehicle.vehicle_number}`);
      executeDispatch(bestVehicle, order);
    } catch (err) {
      executeDispatch(bestVehicle, order);
    }
  };

  const handleManualDispatch = (order) => {
    if (!selectedVehicleId) return toast.error("Select a vehicle!");
    const vehicle = vehicles.find(v => v.id === parseInt(selectedVehicleId));
    executeDispatch(vehicle, order);
  };

  const executeDispatch = async (vehicle, order) => {
    if (!itineraries.current[vehicle.id].includes(order)) {
        itineraries.current[vehicle.id].push(order);
    }
    await axios.patch(`http://localhost:8000/api/orders/${order.id}/`, { delivered: false });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isAssigned: true } : o));
    setPendingQueue(prev => prev.filter(id => id !== order.id));
    if (!isDriving.current[vehicle.id]) {
      isDriving.current[vehicle.id] = true;
      driveToNextStop(vehicle.id);
    }
  };

  const driveToNextStop = async (vehicleId) => {
    const loc = vanLocations.current[vehicleId];
    if (itineraries.current[vehicleId].length === 0) {
      if (Math.abs(loc.lat - warehousePosition[0]) < 0.001 && Math.abs(loc.lng - warehousePosition[1]) < 0.001) {
        isDriving.current[vehicleId] = false;
        await axios.patch(`http://localhost:8000/api/vehicles/${vehicleId}/`, { status: 'idle', current_load: 0 });
        loadOperationalData();
        return;
      }
      const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${warehousePosition[1]},${warehousePosition[0]}?overview=full&geometries=geojson`);
      animateVehicle(vehicleId, response.data.routes[0].geometry.coordinates, null);
      return;
    }

    const targetOrder = itineraries.current[vehicleId][0];
    await axios.patch(`http://localhost:8000/api/vehicles/${vehicleId}/`, { status: 'active' });
    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${targetOrder.longitude},${targetOrder.latitude}?overview=full&geometries=geojson`);
    animateVehicle(vehicleId, response.data.routes[0].geometry.coordinates, targetOrder);
  };

  const animateVehicle = (vehicleId, rawCoords, targetOrder) => {
    const coords = rawCoords.map(c => [c[1], c[0]]);
    let step = 0;
    if (intervals.current[vehicleId]) clearInterval(intervals.current[vehicleId]);

    intervals.current[vehicleId] = setInterval(async () => {
      step += 6;
      if (step >= coords.length) {
        clearInterval(intervals.current[vehicleId]);
        const finalPoint = coords[coords.length - 1];
        vanLocations.current[vehicleId] = { lat: finalPoint[0], lng: finalPoint[1] };
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, latitude: finalPoint[0], longitude: finalPoint[1] } : v));

        if (targetOrder) {
          toast.success(`Delivered: ${targetOrder.customer_name}`);
          await axios.patch(`http://localhost:8000/api/orders/${targetOrder.id}/`, { delivered: true });
          itineraries.current[vehicleId].shift();
          loadOperationalData();
        }
        setTimeout(() => { driveToNextStop(vehicleId); }, 1000);
        return;
      }

      const [newLat, newLng] = coords[step];
      vanLocations.current[vehicleId] = { lat: newLat, lng: newLng };
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, latitude: newLat, longitude: newLng } : v));
    }, 100);
  };

  if (loading) return <div style={{ color: '#8B5CF6', padding: '20px', fontWeight: 'bold' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px', fontSize: '28px' }}>Live Operations</h2>
      <div style={{ height: '700px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <MapContainer center={warehousePosition} zoom={12} style={{ height: '100%', width: '100%', backgroundColor: '#111' }}>
          <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Marker position={warehousePosition} icon={warehouseIcon} />
          {vehicles.map(v => {
             const qCount = itineraries.current[v.id]?.length || 0;
             const label = qCount > 1 ? `🚚 ${v.vehicle_number} (+${qCount-1})` : `🚚 ${v.vehicle_number}`;
             return <Marker key={`v-${v.id}`} position={[v.latitude, v.longitude]} icon={vehicleIcon(label, v.status)} />;
          })}
          {orders.map(order => {
            const isQueued = pendingQueue.includes(order.id);
            return (
              <Marker key={`o-${order.id}`} position={[order.latitude, order.longitude]} icon={orderIcon(order.priority, order.delivered, isQueued)} eventHandlers={{click: () => fetchRoute(order.latitude, order.longitude) }}>
                <Popup>
                  <div style={{ minWidth: '220px', color: '#1f2937' }}>
                    <strong style={{ fontSize: '16px' }}>{order.customer_name}</strong><br />
                    Weight: {order.weight} kg<br />
                    {!order.delivered && !order.isAssigned ? (
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                        <button onClick={() => autoAssignBestVehicle(order)} style={{ width: '100%', padding: '10px', backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>
                          🪄 Smart Auto-Stack
                        </button>
                        <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                          <option value="">-- Choose Vehicle --</option>
                          {vehicles.filter(v => {
                              const plannedWeight = itineraries.current[v.id]?.reduce((sum, o) => sum + o.weight, 0) || 0;
                              return v.status !== 'maintenance' && (v.capacity - v.current_load - plannedWeight) >= order.weight;
                            }).map(v => {
                              const currentLoc = vanLocations.current[v.id] || { lat: v.latitude, lng: v.longitude };
                              const distWH = calculateDistanceKm(currentLoc.lat, currentLoc.lng, warehousePosition[0], warehousePosition[1]);
                              const distCust = calculateDistanceKm(warehousePosition[0], warehousePosition[1], order.latitude, order.longitude);
                              const etaMins = Math.round(((distWH + distCust) / AVG_SPEED_KMH) * 60);
                              const freeCap = v.capacity - v.current_load - (itineraries.current[v.id]?.reduce((sum, o) => sum + o.weight, 0) || 0);
                              return (
                                <option key={v.id} value={v.id}>
                                  {v.vehicle_number} - ETA: {etaMins}m ({freeCap}kg free)
                                </option>
                              );
                          })}
                        </select>
                        <button onClick={() => handleManualDispatch(order)} style={{ width: '100%', padding: '8px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          Manual Override
                        </button>
                      </div>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {activeRoute && <Polyline positions={activeRoute} pathOptions={{ color: '#8B5CF6', weight: 4, opacity: 0.8 }} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;