import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [stats, setStats] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    // WebSocket connection
  const ws = new WebSocket('wss://realtime-analytics-api.onrender.com/ws/live');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(data);
      setLastUpdate(new Date().toLocaleTimeString());
    };

    ws.onerror = () => {
      // Fallback to REST API
      fetchStats();
    };

    return () => ws.close();
  }, []);

  const fetchStats = async () => {
    try {
     const res = await fetch('https://realtime-analytics-api.onrender.com/api/stats');
      const data = await res.json();
      setStats(data.cities);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'Arial' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', fontSize: '2rem' }}>
          Real-Time Analytics Engine
        </h1>
        <p style={{ color: '#94a3b8' }}>Live last update: {lastUpdate}</p>
      </div>

      {/* City Cards */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
        {stats.map((city) => (
          <div key={city.city} style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '20px',
            minWidth: '180px',
            textAlign: 'center',
            border: '1px solid #334155'
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

      {/* Bar Chart */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px' }}>
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

    </div>
  );
}

export default App;