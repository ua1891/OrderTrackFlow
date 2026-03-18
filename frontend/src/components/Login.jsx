import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Truck, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-panel">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 24, fontSize: 24 }}>
          <div className="brand-icon">
            <Truck size={24} />
          </div>
          TrackFlow
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Welcome Back</h2>
        
        {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px 20px', fontSize: 16, width: '100%' }}>
            <LogIn size={18} style={{ marginRight: 8 }} />
            Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
