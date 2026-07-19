import React, { useState, useEffect } from 'react';
import { apiCall } from '../api/client';

export default function DeliveryView({ currentUser }) {
  const [isOnline, setIsOnline] = useState(() => {
    return localStorage.getItem(`rider_online_${currentUser.id}`) === 'true';
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(`rider_online_${currentUser.id}`, isOnline);
    fetchDeliveryData();
  }, [isOnline]);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/api/orders?isOnline=${isOnline}`);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDuty = async (checked) => {
    // If going offline, verify no active deliveries first
    if (!checked) {
      try {
        const data = await apiCall('/api/orders');
        const hasActive = data.some(o => o.delivery_boy_id === currentUser.id && o.status !== 'delivered');
        if (hasActive) {
          alert("Cannot go offline with an active delivery in progress!");
          return;
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }
    setIsOnline(checked);
  };

  const handleAcceptJob = async (orderId) => {
    try {
      await apiCall(`/api/orders/${orderId}`, 'PATCH', { status: 'delivering' });
      alert("Delivery job accepted! Navigate to store to pick up the packages.");
      await fetchDeliveryData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTaskStatus = async (orderId, nextStatus) => {
    try {
      await apiCall(`/api/orders/${orderId}`, 'PATCH', { status: nextStatus });
      if (nextStatus === 'delivered') {
        alert("Order delivered! Payout added to your wallet earnings.");
      }
      await fetchDeliveryData();
    } catch (e) {
      console.error(e);
    }
  };

  // Stats calculation
  const myOrders = orders.filter(o => o.delivery_boy_id === currentUser.id);
  const completedTrips = myOrders.filter(o => o.status === 'delivered').length;
  const totalEarnings = completedTrips * 5.00;

  // Active Task
  const activeOrder = myOrders.find(o => o.status === 'delivering' || o.status === 'ready');

  // Available ready unassigned jobs
  const availableJobs = orders.filter(o => o.status === 'ready' && !o.delivery_boy_id);

  return (
    <section id="delivery-view" className="view-section active">
      {/* Delivery Status Card */}
      <div className="status-toggle-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--bg-card-border)', marginBottom: '2rem' }}>
        <div className="status-label-group">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>COURIER DISPATCH SYSTEM</span>
          <div className={`status-indicator-text ${isOnline ? 'online' : 'offline'}`} id="delivery-status-text">
            Duty Status: {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
          <input 
            type="checkbox" 
            id="duty-status-toggle" 
            checked={isOnline}
            onChange={(e) => handleToggleDuty(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#334155', transition: '.4s', borderRadius: '34px' }}></span>
        </label>
      </div>

      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Delivery Courier Dashboard</h1>
          <p>Earn per trip. Accept orders from partner merchants and bring them to customers.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Total Earnings</h4>
            <div className="metric-value" id="delivery-stats-earnings">${totalEarnings.toFixed(2)}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon indigo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Completed Trips</h4>
            <div className="metric-value" id="delivery-stats-trips">{completedTrips}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="metric-details">
            <h4>Active Status</h4>
            <div className="metric-value" id="delivery-stats-active" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {activeOrder ? (activeOrder._id || activeOrder.id).toUpperCase() : 'No Active Order'}
            </div>
          </div>
        </div>
      </div>

      {/* Active Task Screen (If assigned) */}
      {activeOrder && (
        <div className="glass-panel" id="delivery-active-task-container" style={{ display: 'block', borderColor: 'var(--primary)', marginBottom: '2rem' }}>
          <div className="flex justify-between align-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>CURRENT DEPLOYMENT TASK</h3>
            <span className={`badge ${activeOrder.status === 'ready' ? 'badge-ready' : 'badge-delivering'}`} id="delivery-active-status-badge">
              {activeOrder.status === 'ready' ? 'READY FOR MERCHANT PICKUP' : 'OUT FOR DELIVERY'}
            </span>
          </div>
          <div id="delivery-active-task-details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Store details</h4>
                <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>{activeOrder.shop_name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Ready at counter.</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Delivery Destination</h4>
                <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>Recipient: {activeOrder.customer_name}</p>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>Address: {activeOrder.address}</p>
              </div>
            </div>
            <div className="mt-4" style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Items: <strong style={{ color: 'var(--text-primary)' }}>{activeOrder.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}</strong>
              </p>
            </div>
            {activeOrder.status === 'ready' ? (
              <button 
                className="btn btn-primary btn-sm mt-4" 
                onClick={() => handleUpdateTaskStatus(activeOrder._id || activeOrder.id, 'delivering')}
              >
                Mark Out for Delivery
              </button>
            ) : (
              <button 
                className="btn btn-secondary btn-sm mt-4" 
                onClick={() => handleUpdateTaskStatus(activeOrder._id || activeOrder.id, 'delivered')}
              >
                Confirm Delivery Completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Jobs Board */}
      <div className="glass-panel">
        <h3 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Open Deliveries Near You</h3>
        
        {loading ? (
          <div className="text-center" style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading open pickups...</div>
        ) : !isOnline ? (
          <div className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>
            Go ONLINE to start receiving job offers.
          </div>
        ) : availableJobs.length === 0 ? (
          <div className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>
            Waiting for merchants to complete food/grocery preparation...
          </div>
        ) : (
          <div id="delivery-available-jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {availableJobs.map(job => (
              <div className="glass-panel" style={{ padding: '1.25rem', margin: 0 }} key={job._id || job.id}>
                <div className="flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong style={{ color: 'var(--primary)' }}>{(job._id || job.id).toUpperCase()}</strong> 
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0.25rem' }}>from</span> 
                    <strong>{job.shop_name}</strong>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Payout: $5.00</div>
                </div>
                <div className="mt-4" style={{ fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>Deliver to: <strong>{job.address}</strong></div>
                  <div>Items: <span style={{ color: 'var(--text-secondary)' }}>{job.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}</span></div>
                </div>
                <button 
                  className="btn btn-outline btn-sm mt-4 w-full" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => handleAcceptJob(job._id || job.id)} 
                  disabled={!!activeOrder}
                >
                  {activeOrder ? 'Finish Active Job First' : 'Accept Delivery Task'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
