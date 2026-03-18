import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Truck, UserPlus } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email);
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign up');
    }
  };

  if (isRegistered) {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="brand" style={{ justifyContent: 'center', marginBottom: 24, fontSize: 24 }}>
            <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
              <UserPlus size={24} />
            </div>
            TrackFlow
          </div>
          <h2 style={{ color: '#059669', marginBottom: 16 }}>Account Created!</h2>
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '12px', marginBottom: 24 }}>
            <p style={{ color: '#065f46', lineHeight: 1.6, marginBottom: 10 }}>
              Your account has been successfully registered.
            </p>
            <p style={{ fontWeight: '600', color: '#047857' }}>
              Please check your email <strong>({email})</strong> for your auto-generated password.
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="glass-panel auth-panel">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 24, fontSize: 24 }}>
          <div className="brand-icon">
            <Truck size={24} />
          </div>
          TrackFlow
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Create Account</h2>
        
        {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Company / Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
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
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px 20px', fontSize: 16, width: '100%' }}>
            <UserPlus size={18} style={{ marginRight: 8 }} />
            Sign Up
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
