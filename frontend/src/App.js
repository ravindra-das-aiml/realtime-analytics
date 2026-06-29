import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const COLORS = ['#f59e0b', '#818cf8', '#4ade80', '#f87171', '#38bdf8'];

const CITY_POSITIONS = {
  Mumbai:    { x: 180, y: 280 },
  Delhi:     { x: 230, y: 160 },
  Bangalore: { x: 220, y: 340 },
  Patna:     { x: 300, y: 190 },
  Hyderabad: { x: 240, y: 290 },
};

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
      const newAlerts = data.cities
        .filter(c => c.avg_speed > 60)
        .map(c => `⚠️ ${c.city}: High speed — ${c.avg_speed} km/h`);
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
        {stats.map((city, i) => (
          <div key={city.city} style={{
            backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px',
            minWidth: '180px', textAlign: 'center', border: `1px solid ${COLORS[i]}`
          }}>
            <h2 style={{ color: COLORS[i], margin: '0 0 10px' }}>{city.city}</h2>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Events: <span style={{ color: 'white' }}>{city.total_events.toLocaleString()}</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Avg Speed: <span style={{ color: '#4ade80' }}>{city.avg_speed} km/h</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Delivering: <span style={{ color: '#f59e0b' }}>{city.delivering}</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Idle: <span style={{ color: '#94a3b8' }}>{city.idle}</span></p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>Returning: <span style={{ color: '#818cf8' }}>{city.returning}</span></p>
          </div>
        ))}
      </div>

      {/* SVG Map */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '10px' }}>🗺️ Live City Map</h2>
        <svg viewBox="0 0 500 450" style={{ width: '100%', height: '350px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
          {/* India outline simplified */}
          <ellipse cx="250" cy="250" rx="180" ry="200" fill="none" stroke="#334155" strokeWidth="1" />
          
          {/* City dots */}
          {stats.map((city, i) => {
            const pos = CITY_POSITIONS[city.city];
            if (!pos) return null;
            const radius = Math.max(8, city.total_events / 400);
            return (
              <g key={city.city}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={COLORS[i]}
                  opacity={0.8}
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 5}
                  fill="none"
                  stroke={COLORS[i]}
                  strokeWidth="1"
                  opacity={0.4}
                />
                <text x={pos.x} y={pos.y - radius - 5} textAnchor="middle" fill="white" fontSize="12">
                  {city.city}
                </text>
                <text x={pos.x} y={pos.y + radius + 15} textAnchor="middle" fill={COLORS[i]} fontSize="10">
                  {city.total_events.toLocaleString()} events
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bar Chart */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '20px' }}>📊 Driver Status by City</h2>
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
        <h2 style={{ color: '#38bdf8', marginBottom: '20px' }}>🥧 Total Events by City</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={stats} dataKey="total_events" nameKey="city" cx="50%" cy="50%" outerRadius={100} label={({name}) => name}>
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