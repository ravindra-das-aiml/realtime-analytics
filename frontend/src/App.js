import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const API = 'https://realtime-analytics-api.onrender.com';
const COLORS = ['#f59e0b', '#818cf8', '#4ade80', '#f87171', '#38bdf8'];

const CITY_POSITIONS = {
  Mumbai:    { x: 180, y: 280 },
  Delhi:     { x: 230, y: 160 },
  Bangalore: { x: 220, y: 340 },
  Patna:     { x: 300, y: 190 },
  Hyderabad: { x: 240, y: 290 },
};

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const res = await fetch(`${API}/token`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin(data.access_token);
      } else {
        setError('Invalid credentials!');
      }
    } catch {
      setError('Server error!');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '40px', width: '350px', border: '1px solid #334155' }}>
        <h1 style={{ color: '#38bdf8', textAlign: 'center', marginBottom: '30px' }}>🚀 Analytics Engine</h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px' }}>Sign in to access dashboard</p>
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '16px', boxSizing: 'border-box' }}
        />
        
        {error && <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
        
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', color: '#0f172a', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Demo: admin / admin123
        </p>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [stats, setStats] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [connected, setConnected] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/public/stats`);
      const data = await res.json();
      setStats(data.cities);
      setLastUpdate(new Date().toLocaleTimeString());
      setConnected(true);
    } catch {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#38bdf8', fontSize: '1.8rem' }}>Real-Time Analytics Engine 🚀</h1>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#f87171', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ color: connected ? '#4ade80' : '#f87171' }}>
          {connected ? '🟢 Live — Updates every 3 seconds' : '🔴 Connecting...'}
        </p>
        <p style={{ color: '#94a3b8' }}>Last update: {lastUpdate}</p>
      </div>

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
          <ellipse cx="250" cy="250" rx="180" ry="200" fill="none" stroke="#334155" strokeWidth="1" />
          {stats.map((city, i) => {
            const pos = CITY_POSITIONS[city.city];
            if (!pos) return null;
            const radius = Math.max(8, city.total_events / 400);
            return (
              <g key={city.city}>
                <circle cx={pos.x} cy={pos.y} r={radius} fill={COLORS[i]} opacity={0.8} />
                <circle cx={pos.x} cy={pos.y} r={radius + 5} fill="none" stroke={COLORS[i]} strokeWidth="1" opacity={0.4} />
                <text x={pos.x} y={pos.y - radius - 5} textAnchor="middle" fill="white" fontSize="12">{city.city}</text>
                <text x={pos.x} y={pos.y + radius + 15} textAnchor="middle" fill={COLORS[i]} fontSize="10">{city.total_events.toLocaleString()} events</text>
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (token) => setToken(token);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) return <Login onLogin={handleLogin} />;
  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;