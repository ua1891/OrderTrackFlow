import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AlertsPage from './components/AlertsPage'
import OrdersPage from './components/OrdersPage'
import Login from './components/Login'
import Signup from './components/Signup'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { Truck, Navigation, AlertCircle, LayoutDashboard, Settings, LogOut } from 'lucide-react'

function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // Don't show sidebar if not logged in

  return (
    <div className="sidebar glass-panel">
      <div className="brand">
        <div className="brand-icon">
          <Truck size={20} />
        </div>
        TrackFlow
      </div>
      
      <div className="nav-links">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={18} />
          Overview
        </NavLink>
        <NavLink to="/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Navigation size={18} />
          Orders
        </NavLink>
        <NavLink to="/alerts" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <AlertCircle size={18} />
          Alerts
        </NavLink>
      </div>

      <div className="user-profile" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-info" style={{ flex: 1, minWidth: '100px' }}>
          <span className="user-name">{user.name}</span>
          <span className="user-email">{user.email}</span>
        </div>
        <button onClick={logout} className="btn" style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

const PageWrapper = ({ title, description }) => (
  <div className="glass-panel" style={{ padding: 40, borderRadius: 24, minHeight: '80vh' }}>
    <h2>{title}</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>{description}</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
              <Route path="/alerts" element={<PrivateRoute><AlertsPage /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
