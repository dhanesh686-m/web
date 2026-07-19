import React, { useState, useEffect } from 'react';
import { apiCall } from '../api/client';
import ProductModal from '../components/ProductModal';

export default function ShopkeeperView({ currentUser }) {
  const [shop, setShop] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('grocery');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeBanner, setStoreBanner] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const allShops = await apiCall('/api/shops');
      const userShop = allShops.find(s => s.owner_id === currentUser.id);
      if (!userShop) {
        alert("Store not found or you do not have permissions.");
        return;
      }
      
      setShop(userShop);
      setStoreName(userShop.name || '');
      setStoreCategory(userShop.category || 'grocery');
      setStoreDesc(userShop.description || '');
      setStoreBanner(userShop.image || '');

      const userOrders = await apiCall('/api/orders');
      setOrders(userOrders);

      const shopDetails = await apiCall(`/api/shops/${userShop._id || userShop.id}`);
      setItems(shopDetails.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const payload = {
      name: storeName,
      category: storeCategory,
      description: storeDesc,
      image: storeBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
    };

    try {
      await apiCall('/api/shops', 'POST', payload);
      alert("Shop profile details updated successfully!");
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      await apiCall(`/api/orders/${orderId}`, 'PATCH', { status: nextStatus });
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (payload) => {
    try {
      await apiCall('/api/items', 'POST', payload);
      setIsModalOpen(false);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to permanently delete this product?")) {
      try {
        await apiCall(`/api/items/${itemId}`, 'DELETE');
        await fetchDashboardData();
      } catch (err) {
        console.error(err);
      }
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

  if (loading && !shop) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard Console...</div>;
  }

  // Stats
  const totalSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.subtotal || 0), 0);

  const activeShopOrders = orders.filter(o => o.status !== 'delivered');

  return (
    <section id="shopkeeper-view" className="view-section active">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1 id="shop-panel-title">{(shop?.name || 'Store') + ' Owner Console'}</h1>
          <p id="shop-panel-subtitle">Manage store products, fulfill incoming orders, and track metrics.</p>
        </div>
      </div>

      <div className="shopkeeper-panel-split">
        {/* Shop Profile Configuration */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 className="mb-4" style={{ fontSize: '1.15rem', fontWeight: 700 }}>Store Profile</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label htmlFor="shop-name">Store Name</label>
              <input 
                type="text" 
                id="shop-name" 
                className="form-control" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="shop-category">Category</label>
              <select 
                id="shop-category" 
                value={storeCategory}
                onChange={(e) => setStoreCategory(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: '#1e293b', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
              >
                <option value="grocery">Grocery</option>
                <option value="food">Restaurant</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="sweets">Sweets & Bakery</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="shop-desc">Description</label>
              <textarea 
                id="shop-desc" 
                rows="3" 
                className="form-control" 
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="shop-banner">Banner Image URL</label>
              <input 
                type="url" 
                id="shop-banner" 
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={storeBanner}
                onChange={(e) => setStoreBanner(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-sm">Update Profile</button>
          </form>
        </div>

        {/* Main Console Operations */}
        <div className="console-ops">
          {/* Metric Indicators */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon emerald">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="metric-details">
                <h4>Total Sales</h4>
                <div className="metric-value" id="shop-stats-sales">₹{totalSales.toFixed(2)}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon indigo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div className="metric-details">
                <h4>Orders Filled</h4>
                <div className="metric-value" id="shop-stats-orders">{orders.length}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div className="metric-details">
                <h4>Products Stocked</h4>
                <div className="metric-value" id="shop-stats-products">{items.length}</div>
              </div>
            </div>
          </div>

          {/* Active Orders Manager */}
          <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <h3 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Store Orders Queue</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items Ordered</th>
                    <th>Delivery Address</th>
                    <th>Pricing</th>
                    <th>Current Status</th>
                    <th style={{ textAlign: 'right' }}>Action Control</th>
                  </tr>
                </thead>
                <tbody id="shopkeeper-orders-table">
                  {activeShopOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No active orders pending.</td>
                    </tr>
                  ) : (
                    activeShopOrders.map(order => {
                      const itemsStr = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
                      let actionBtn = '';

                      if (order.status === 'pending') {
                        actionBtn = (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => handleUpdateOrderStatus(order._id || order.id, 'preparing')}
                          >
                            Accept Order
                          </button>
                        );
                      } else if (order.status === 'preparing') {
                        actionBtn = (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleUpdateOrderStatus(order._id || order.id, 'ready')}
                          >
                            Mark Ready
                          </button>
                        );
                      } else {
                        actionBtn = <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Waiting for courier pickup</span>;
                      }

                      return (
                        <tr key={order._id || order.id}>
                          <td className="order-id" style={{ fontSize: '0.85rem' }}>{(order._id || order.id).toUpperCase()}</td>
                          <td>{itemsStr}</td>
                          <td>{order.address}</td>
                          <td style={{ fontWeight: 700 }}>₹{Number(order.subtotal || 0).toFixed(2)}</td>
                          <td><span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                          <td style={{ textAlign: 'right' }}>{actionBtn}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Catalog Directory */}
          <div className="glass-panel">
            <div className="flex justify-between align-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Catalog Directory</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleOpenAddModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Product
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>In Stock (Qty)</th>
                    <th style={{ textAlign: 'right' }}>Control panel</th>
                  </tr>
                </thead>
                <tbody id="shopkeeper-items-table">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '2rem' }}>No items listed in inventory.</td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item._id || item.id}>
                        <td>
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url('${item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'}')` }}></div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ maxWidth: '250px', fontSize: '0.85rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.description}</td>
                        <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>₹{Number(item.price).toFixed(2)}</td>
                        <td>{item.quantity} units</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-2 justify-end" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditModal(item)}>Edit</button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }} 
                              onClick={() => handleDeleteItem(item._id || item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        item={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </section>
  );
}
