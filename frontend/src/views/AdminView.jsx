import React, { useState, useEffect } from 'react';
import { apiCall } from '../api/client';

export default function AdminView({ currentUser, onSelfSuspended }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await apiCall('/api/admin/stats');
      setStats(statsData);

      const usersData = await apiCall('/api/admin/users');
      setUsers(usersData);

      const ordersData = await apiCall('/api/orders');
      setOrders(ordersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const data = await apiCall(`/api/admin/users/${userId}`, 'PATCH');
      
      if (currentUser.id === userId && data.status === 'suspended') {
        onSelfSuspended();
        alert("Your account has been deactivated by the platform administrator. Logging out.");
        return;
      }

      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'preparing': return 'badge-preparing';
      case 'ready': return 'badge-ready';
      case 'delivering': return 'badge-delivering';
      case 'delivered': return 'badge-delivered';
      default: return 'badge-pending';
    }
  };

  if (loading && !stats) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Operations Console...</div>;
  }

  return (
    <section id="admin-view" className="view-section active">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Administrative Operations Center</h1>
          <p>Total platform metrics, ecosystem user control, and audit logs.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon indigo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Platform Users</h4>
            <div className="metric-value" id="admin-stats-users">{stats?.users || 0}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Gross Revenue</h4>
            <div className="metric-value" id="admin-stats-revenue">₹{Number(stats?.revenue || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Active Merchants</h4>
            <div className="metric-value" id="admin-stats-shops">{stats?.shops || 0}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Completed Orders</h4>
            <div className="metric-value" id="admin-stats-orders">{stats?.orders || 0}</div>
          </div>
        </div>
      </div>

      {/* Account Operations Table */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Account Operations</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>System Role</th>
                <th>Affiliated Merchant</th>
                <th>Security Status</th>
                <th style={{ textAlign: 'right' }}>Action panel</th>
              </tr>
            </thead>
            <tbody id="admin-users-table">
              {users.map(u => {
                const isActive = u.status === 'active';
                const actionText = isActive ? 'Deactivate' : 'Activate';
                const actionClass = isActive ? 'btn-danger' : 'btn-secondary';

                return (
                  <tr key={u.id}>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-ready" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td>{u.shopName}</td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-delivered' : 'badge-pending'}`}>{u.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className={`btn ${actionClass} btn-sm`} 
                        style={{ fontSize: '0.75rem' }} 
                        onClick={() => handleToggleUserStatus(u.id)}
                      >
                        {actionText}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ecosystem Deliveries Log */}
      <div className="glass-panel">
        <h3 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ecosystem Deliveries Log</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Merchant Shop</th>
                <th>Recipient</th>
                <th>Pricing</th>
                <th>Assigned Courier</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody id="admin-orders-table">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No platform orders placed yet.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id || order.id}>
                    <td className="order-id" style={{ fontSize: '0.85rem' }}>{(order._id || order.id).toUpperCase()}</td>
                    <td>{order.shop_name}</td>
                    <td>{order.customer_name}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(order.total).toFixed(2)}</td>
                    <td>{order.delivery_boy_name || <em style={{ color: 'var(--text-muted)' }}>Waiting rider...</em>}</td>
                    <td><span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
