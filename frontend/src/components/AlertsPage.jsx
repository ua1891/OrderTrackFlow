import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Alerts from './Alerts';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      const res = await client.get(`/orders/dashboard`);
      // sendSuccess wraps data in a 'data' property
      setAlerts(res.data.data.alerts);
      setError(null);
    } catch (err) {
      console.error("Failed to load alerts", err);
      setError("Failed to load alerts from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: 40, borderRadius: 24, minHeight: '80vh' }}>Loading Alerts...</div>;

  return (
    <div className="glass-panel" style={{ padding: 40, borderRadius: 24, minHeight: '80vh' }}>
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Alerts Feed</h2>
        <p style={{ color: 'var(--text-muted)' }}>View and manage all automated system alerts here.</p>
      </div>

      {error ? (
        <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px' }}>{error}</div>
      ) : (
        <Alerts alerts={alerts} />
      )}
    </div>
  );
}
