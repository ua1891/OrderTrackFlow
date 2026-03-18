import React, { useState, useEffect } from 'react';
import client from '../api/client';
import OrdersTable from './OrdersTable';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await client.get(`/orders/dashboard`);
      setOrders(res.data.orders);
      setError(null);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Failed to load orders from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: 40, borderRadius: 24, minHeight: '80vh' }}>Loading Orders...</div>;

  return (
    <div className="glass-panel" style={{ padding: 40, borderRadius: 24, minHeight: '80vh' }}>
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Orders Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>View and track all shipments in the TrackFlow system.</p>
      </div>

      {error ? (
        <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px' }}>{error}</div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
