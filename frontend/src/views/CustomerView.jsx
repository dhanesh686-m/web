import React, { useState, useEffect } from 'react';
import { apiCall } from '../api/client';

export default function CustomerView() {
  const [shops, setShops] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchShops();
    fetchOrders();
  }, [categoryFilter]);

  const fetchShops = async () => {
    setLoadingShops(true);
    try {
      const data = await apiCall(`/api/shops?category=${categoryFilter}`);
      setShops(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShops(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await apiCall('/api/orders');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSelectShop = async (shopId) => {
    setLoadingItems(true);
    try {
      const data = await apiCall(`/api/shops/${shopId}`);
      setSelectedShop(data.shop);
      setItems(data.items);
      setCart([]); // Clear cart when switching shops
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleBackToShops = () => {
    setSelectedShop(null);
    setItems([]);
    setCart([]);
  };

  const handleAddToCart = (itemId) => {
    const item = items.find(i => i._id === itemId || i.id === itemId);
    if (!item) return;

    if (cart.length > 0 && cart[0].item.shop_id !== item.shop_id) {
      if (window.confirm("Your cart contains items from another store. Empty cart and add this item?")) {
        setCart([{ item, quantity: 1 }]);
      }
      return;
    }

    const existingIndex = cart.findIndex(c => (c.item._id || c.item.id) === itemId);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity >= item.quantity) {
        alert(`Cannot add more. Store only has ${item.quantity} units in stock.`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const handleUpdateCartQty = (itemId, change) => {
    const existingIndex = cart.findIndex(c => (c.item._id || c.item.id) === itemId);
    if (existingIndex === -1) return;

    const cartItem = cart[existingIndex];
    const storeItem = items.find(i => (i._id || i.id) === itemId);

    if (change > 0) {
      if (cartItem.quantity >= storeItem.quantity) {
        alert(`Only ${storeItem.quantity} items available in stock.`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity -= 1;
      if (updatedCart[existingIndex].quantity <= 0) {
        updatedCart.splice(existingIndex, 1);
      }
      setCart(updatedCart);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      alert("Please input a delivery address for checkout.");
      return;
    }

    try {
      const orderPayload = {
        shopId: selectedShop._id || selectedShop.id,
        items: cart.map(c => ({
          itemId: c.item._id || c.item.id,
          quantity: c.quantity
        })),
        address: address.trim()
      };

      await apiCall('/api/orders', 'POST', orderPayload);

      // Clear cart
      setCart([]);
      setAddress('');
      
      // Refresh items to get updated inventory count
      if (selectedShop) {
        await handleSelectShop(selectedShop._id || selectedShop.id);
      }

      // Refresh orders
      await fetchOrders();
      alert("Order placed successfully! Tracking progress now.");
    } catch (e) {
      console.error(e);
    }
  };

  // Helper stats
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 3.50 : 0.00;
  const cartTotal = cartSubtotal + deliveryFee;

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

  return (
    <section id="customer-view" className="view-section active">
      <div className="customer-layout">
        {/* Left panel: Shops & Shop items */}
        <div className="customer-main">
          {/* Shop List Panel */}
          {!selectedShop ? (
            <div id="customer-shops-panel">
              <div className="category-bar">
                <button className={`category-tab ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>All Shops</button>
                <button className={`category-tab ${categoryFilter === 'grocery' ? 'active' : ''}`} onClick={() => setCategoryFilter('grocery')}>Grocery</button>
                <button className={`category-tab ${categoryFilter === 'food' ? 'active' : ''}`} onClick={() => setCategoryFilter('food')}>Restaurants</button>
                <button className={`category-tab ${categoryFilter === 'pharmacy' ? 'active' : ''}`} onClick={() => setCategoryFilter('pharmacy')}>Pharmacy</button>
                <button className={`category-tab ${categoryFilter === 'sweets' ? 'active' : ''}`} onClick={() => setCategoryFilter('sweets')}>Sweets & Bakeries</button>
              </div>

              <h2 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Popular Partner Shops
              </h2>

              {loadingShops ? (
                <div className="text-center w-full" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading partner shops...</div>
              ) : shops.length === 0 ? (
                <div className="empty-state w-full" style={{ padding: '2rem' }}>
                  <p>No stores available in this category yet.</p>
                </div>
              ) : (
                <div className="shops-grid" id="shops-list-container">
                  {shops.map(shop => (
                    <div className="shop-card" key={shop._id || shop.id} onClick={() => handleSelectShop(shop._id || shop.id)}>
                      <span className="shop-category-tag">{shop.category}</span>
                      <div className="shop-banner" style={{ backgroundImage: `url('${shop.image}')` }}></div>
                      <div className="shop-info">
                        <h3>{shop.name}</h3>
                        <p className="shop-desc">{shop.description}</p>
                        <div className="shop-meta">
                          <span className="shop-rating">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            {Number(shop.rating || 5.0).toFixed(1)}
                          </span>
                          <span>Free Delivery</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Shop Details & Item List Panel */
            <div id="customer-items-panel">
              <button className="btn btn-outline btn-sm mb-4" onClick={handleBackToShops}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Shops
              </button>

              <div className="glass-panel" id="selected-shop-banner-details" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url('${selectedShop.image}')` }}></div>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedShop.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{selectedShop.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span className="badge badge-ready" style={{ textTransform: 'capitalize' }}>{selectedShop.category}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)' }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        {Number(selectedShop.rating || 5.0).toFixed(1)} Rating
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="section-title">Available Products</h3>
              
              {loadingItems ? (
                <div className="text-center w-full" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading store products...</div>
              ) : items.length === 0 ? (
                <div className="empty-state w-full" style={{ padding: '2rem' }}>
                  <p>No products listed in this store yet.</p>
                </div>
              ) : (
                <div className="items-grid" id="items-list-container">
                  {items.map(item => {
                    const isLowStock = item.quantity <= 5;
                    const isOutOfStock = item.quantity === 0;

                    return (
                      <div className="item-card" key={item._id || item.id}>
                        <div className="item-image" style={{ backgroundImage: `url('${item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'}')` }}></div>
                        <div className="item-info">
                          <div>
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                          </div>
                          <div>
                            <div className="item-purchase-row mb-4">
                              <span className="item-price">${Number(item.price).toFixed(2)}</span>
                              <span className={`item-stock ${isLowStock ? 'low' : ''}`}>
                                {isOutOfStock ? 'OUT OF STOCK' : (isLowStock ? `Only ${item.quantity} left!` : `${item.quantity} In Stock`)}
                              </span>
                            </div>
                            <button 
                              className="btn btn-primary btn-full btn-sm" 
                              onClick={() => handleAddToCart(item._id || item.id)}
                              disabled={isOutOfStock}
                            >
                              {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Customer Orders List */}
          <div className="orders-section">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Your Orders
            </h2>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path>
                </svg>
                <p>No active or past orders found.</p>
              </div>
            ) : (
              <div className="orders-list" id="customer-orders-container">
                {orders.map(order => {
                  let progressPercent = 10;
                  let step1 = 'completed', step2 = '', step3 = '', step4 = '';

                  if (order.status === 'preparing') {
                    progressPercent = 40;
                    step2 = 'active';
                    step1 = 'completed';
                  } else if (order.status === 'ready') {
                    progressPercent = 70;
                    step2 = 'completed';
                    step3 = 'active';
                  } else if (order.status === 'delivering') {
                    progressPercent = 85;
                    step2 = 'completed';
                    step3 = 'completed';
                    step4 = 'active';
                  } else if (order.status === 'delivered') {
                    progressPercent = 100;
                    step2 = 'completed';
                    step3 = 'completed';
                    step4 = 'completed';
                  } else {
                    step1 = 'active';
                  }

                  const riderInfo = order.delivery_boy_name ? `${order.delivery_boy_name} is delivering` : 'Assigning Courier...';

                  return (
                    <div className="order-card" key={order._id || order.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id">{(order._id || order.id).toUpperCase()}</span>
                          <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>|</span>
                          <span className="order-shop-name">{order.shop_name}</span>
                        </div>
                        <div>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                          <span className="order-time" style={{ marginLeft: '0.75rem' }}>{order.timestamp}</span>
                        </div>
                      </div>

                      <div className="order-details-grid">
                        <div>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Items</h4>
                          <ul className="order-items-list">
                            {order.items.map((it, idx) => (
                              <li key={idx}>
                                <span>{it.name} (x{it.quantity})</span>
                                <span>${(Number(it.price) * it.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="order-meta-info">
                          <div>Address: <span>{order.address}</span></div>
                          <div>Courier: <span>{riderInfo}</span></div>
                          <div>Total Invoiced: <span style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>${Number(order.total).toFixed(2)}</span></div>
                        </div>
                      </div>

                      <div className="order-progress-wrapper">
                        <div className="progress-steps">
                          <div className="progress-line-fill" style={{ width: `calc(${progressPercent}% - 20px)` }}></div>
                          <div className={`progress-step ${step1}`}>
                            <div className="progress-dot">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="progress-label">Ordered</span>
                          </div>
                          <div className={`progress-step ${step2}`}>
                            <div className="progress-dot">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <span className="progress-label">Preparing</span>
                          </div>
                          <div className={`progress-step ${step3}`}>
                            <div className="progress-dot">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon></svg>
                            </div>
                            <span className="progress-label">Out</span>
                          </div>
                          <div className={`progress-step ${step4}`}>
                            <div className="progress-dot">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <span className="progress-label">Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: Cart Sidebar */}
        <div className="cart-panel">
          <div className="cart-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Shopping Cart
            </h3>
            <span id="cart-item-count" className="badge badge-preparing">{cartItemCount} Items</span>
          </div>

          <div className="cart-items-container" id="cart-items-list">
            {cart.length === 0 ? (
              <div className="cart-empty">
                Your cart is empty. Add items from a shop to begin.
              </div>
            ) : (
              cart.map((cartItem) => (
                <div className="cart-item" key={cartItem.item._id || cartItem.item.id}>
                  <div className="cart-item-details">
                    <span className="cart-item-name">{cartItem.item.name}</span>
                    <span className="cart-item-price">${Number(cartItem.item.price).toFixed(2)}</span>
                  </div>
                  <div className="cart-item-quantity">
                    <button className="qty-btn" onClick={() => handleUpdateCartQty(cartItem.item._id || cartItem.item.id, -1)}>-</button>
                    <span className="qty-val">{cartItem.quantity}</span>
                    <button className="qty-btn" onClick={() => handleUpdateCartQty(cartItem.item._id || cartItem.item.id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="cart-address" style={{ fontSize: '0.8rem' }}>Delivery Address</label>
              <textarea 
                id="cart-address" 
                rows="2" 
                className="form-control" 
                style={{ fontSize: '0.85rem' }}
                placeholder="Flat, Building, Street Name, Landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>

            <div className="cart-summary-row">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span id="cart-subtotal">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
              <span id="cart-delivery-fee">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Estimated Total</span>
              <span id="cart-total">${cartTotal.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary btn-full mt-4" 
              id="btn-checkout" 
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
            >
              Checkout & Place Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
