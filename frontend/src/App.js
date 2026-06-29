import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const CITY_COORDS = {
  Mumbai:    [19.0760, 72.8777],
  Delhi:     [28.6139, 77.2090],
  Bangalore: [12.9716, 77.5946],
  Patna:     [25.5941, 85.1376],
  Hyderabad: [17.3850, 78.4867],
};

const COLORS = ['#f59e0b', '#818cf8', '#4ade80', '#f87171', '#38bdf8'];

function App() {
  const [stats, setStats] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('https://realtime-analytics-api.onrender.com/api/stats');
      const data = await res.json();
      setStats(data.cities);
      setLastUpdate(new Date().toLocaleTimeString());
      setConnected(true);

      // Alert system — speed > 60 km/h
      const newAlerts = data.cities
        .filter(c => c.avg_speed > 60)
        .map(c => `⚠️ ${c.city}: High speed detected — ${c.avg_speed} km/h`);
      if (newAlerts.length > 0) setAlerts(newAlerts);

    } catch (err) {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'Arial' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#38bdf8', fontSize: '2rem' }}>Real-Time Analytics Engine 🚀</h1>
        <p style={{ color: connected ? '#4ade80' : '#f87171' }}>
          {connected ? '🟢 Live — Updates every 3 seconds' : '🔴 Connecting...'}
        </p>
        <p style={{ color: '#94a3b8' }}>Last update: {lastUpdate}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ backgroundColor: '#7f1d1d', borderRadius: '8px', padding: '10px', marginBottom: '20px' }}>
          <h3 style={{ color: '#f87171', margin: '0 0 8px' }}>🚨 Speed Alerts</h3>
          {alerts.map((a, i) => <p key={i} style={{ margin: '4px 0', color: '#fca5a5' }}>{a}</p>)}
        </div>
      )}

      {/* City Cards */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
        {stats.map((city) => (
          <div key={city.city} style={{
            backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px',
            minWidth: '180px', textAlign: 'center', border: '1px solid #334155'
          }}>
            <h2 style={{ color: '#38bdf8', margin: '0 0 10px' }}>{city.city}</h2>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Events: <span style={{ color: 'white' }}>{city.total_events.toLocaleString()}</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Avg Speed: <span style={{ color: '#4ade80' }}>{city.avg_speed} km/h</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Delivering: <span style={{ color: '#f59e0b' }}>{city.delivering}</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Idle: <span style={{ color: '#94a3b8' }}>{city.idle}</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Returning: <span style={{ color: '#818cf8' }}>{city.returning}</span></p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '30px', height: '400px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '10px' }}>🗺️ Live City Map</h2>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '350px', borderRadius: '12px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {stats.map((city, i) => (
            CITY_COORDS[city.city] && (
              <CircleMarker
                key={city.city}
                center={CITY_COORDS[city.city]}
                radius={city.total_events / 500}
                fillColor={COLORS[i]}
                color={COLORS[i]}
                fillOpacity={0.7}
              >
                <Popup>
                  <b>{city.city}</b><br />
                  Events: {city.total_events}<br />
                  Avg Speed: {city.avg_speed} km/h
                </Popup>
              </CircleMarker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Bar Chart */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '20px' }}>Driver Status by City</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="city" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            <Legend />
            <Bar dataKey="delivering" fill="#f59e0b" name="Delivering" />
            <Bar dataKey="idle" fill="#94a3b8" name="Idle" />
            <Bar dataKey="returning" fill="#818cf8" name="Returning" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '20px' }}>Total Events by City</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={stats} dataKey="total_events" nameKey="city" cx="50%" cy="50%" outerRadius={100} label>
              {stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default App;