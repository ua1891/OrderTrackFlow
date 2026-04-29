import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Package, CheckCircle, AlertTriangle, TrendingUp, Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import OrdersTable from './OrdersTable';
import Alerts from './Alerts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ trackingNumber: '' });
  const [submitError, setSubmitError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await client.get(`/orders/dashboard`);
      setData(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddShipment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await client.post(`/orders`, formData);
      setIsModalOpen(false);
      setFormData({ trackingNumber: '' });
      fetchDashboardData();
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Failed to add shipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, fontFamily: 'Outfit, sans-serif' }}>Loading TrackFlow...</div>;

  const timeSinceUpdate = Math.floor((new Date() - lastUpdated) / 1000);
  const updateText = timeSinceUpdate < 10 ? "Updated just now" : `Updated ${timeSinceUpdate}s ago`;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{updateText}</span>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Track Shipment
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px' }}>{error}</div>}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Track New Shipment</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {submitError && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{submitError}</div>}
            <form onSubmit={handleAddShipment}>
              <div className="form-group">
                <label>Tracking Number (TCS or PostEx)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.trackingNumber}
                  onChange={e => setFormData({ trackingNumber: e.target.value })}
                  placeholder="e.g. 1234567890 or CX-XXXXXXXXXXX"
                  required
                  autoFocus
                />
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                  Customer details will be fetched automatically. PostEx numbers must start with 'CX-'.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Active Orders</span>
                <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                  <Package size={20} />
                </div>
              </div>
              <div className="metric-value">{data.metrics.activeOrders}</div>
              <div className="metric-trend trend-up">Current in transit</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Delivered Today</span>
                <div className="metric-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="metric-value">{data.metrics.deliveredToday}</div>
              <div className="metric-trend trend-up">Successfully delivered</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Returns</span>
                <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="metric-value">{data.metrics.returns}</div>
              <div className="metric-trend trend-down">Failed or returned</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Pending Pickup</span>
                <div className="metric-icon" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="metric-value">{data.metrics.pendingPickup}</div>
              <div className="metric-trend trend-up">Awaiting collection</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="left-column">
              <div className="chart-section" style={{ height: 400 }}>
                <h3 className="section-title">Order Performance (Last 7 Days)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Order trends dynamically calculated from data</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                    />
                    <Line type="monotone" dataKey="Total" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Delivered" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Pending" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="table-section">
                <h3 className="section-title">Recent Orders</h3>
                <OrdersTable orders={data.orders} />
              </div>
            </div>

            <div className="right-column">
              <Alerts alerts={data.alerts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
