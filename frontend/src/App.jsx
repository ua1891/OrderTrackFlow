import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AlertsPage from './components/AlertsPage'
import OrdersPage from './components/OrdersPage'
import { Truck, Navigation, AlertCircle, LayoutDashboard, Settings } from 'lucide-react'

function Sidebar() {
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
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Settings size={18} />
          Settings
        </NavLink>
      </div>

      <div className="user-profile">
        <div className="avatar">V</div>
        <div className="user-info">
          <span className="user-name">Vendor Co.</span>
          <span className="user-email">{import.meta.env.VITE_VENDOR_EMAIL || "vendor@trackflow.com"}</span>
        </div>
      </div>
    </div>
  )
}

const PageWrapper = ({ title, description }) => (
  <div className="glass-panel" style={{ padding: 40, borderRadius: 24, minHeight: '80vh' }}>
    <h2>{title}</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>{description}</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route 
              path="/orders" 
              element={<OrdersPage />} 
            />
            <Route 
              path="/alerts" 
              element={<AlertsPage />} 
            />
            <Route 
              path="/settings" 
              element={<PageWrapper title="Settings" description="Configure TrackFlow integrations and templates." />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
