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
                         (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="orders-table-wrapper">
      <div className="orders-table-controls">
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder="Search by tracking or customer..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <Filter size={18} color="var(--text-muted)" />
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="filter-select"
          >
            <option>All Status</option>
            <option>In Transit</option>
            <option>Pickup Ready</option>
            <option>Delivered</option>
            <option>Returned</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
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
                <td className="tracking-id">{order.trackingNumber}</td>
                <td>{order.customerName || 'N/A'}</td>
                <td>{order.destination || 'N/A'}</td>
                <td>
                  <span className={`badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="date-cell">
                  {getTimeAgo(order.updatedAt)}
                </td>
                <td>
                  <div className="order-actions">
                    <Eye size={18} className="action-icon" title="View Details" />
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="no-results">
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
