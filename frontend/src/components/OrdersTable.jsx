import React, { useState } from 'react';
import { Eye, Filter } from 'lucide-react';
import { getTimeAgo } from '../utils/dateUtils';

export default function OrdersTable({ orders }) {
  const [filter, setFilter] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pickup Ready': return 'ready';
      case 'Returned': return 'returned';
      case 'Delivered': return 'delivered';
      case 'In Transit': return 'transit';
      default: return 'pending';
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filter === 'All Status' || o.status === filter;
    const matchesSearch = o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="orders-table-controls" style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <input 
          type="text" 
          placeholder="Search by tracking or customer..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ 
            flex: 1, 
            padding: '10px 16px', 
            borderRadius: 8, 
            border: '1px solid var(--border-color)',
            outline: 'none',
            fontSize: 14
          }} 
        />
        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="filter-select"
            style={{ 
              padding: '10px 16px', 
              borderRadius: 8, 
              border: '1px solid var(--border-color)',
              outline: 'none',
              backgroundColor: 'white',
              fontSize: 14
            }}
          >
            <option>All Status</option>
            <option>In Transit</option>
            <option>Pickup Ready</option>
            <option>Delivered</option>
            <option>Returned</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td style={{ color: 'var(--primary)', fontWeight: 500 }}>{order.trackingNumber}</td>
                <td>{order.customerName}</td>
                <td>{order.destination || 'N/A'}</td>
                <td>
                  <span className={`badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {getTimeAgo(order.updatedAt)}
                </td>
                <td>
                  <div className="order-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Eye size={18} className="action-icon" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} title="View Details" />
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
