import React, { useState } from 'react';
import { apiCall } from '../api/client';

export default function AuthView({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // 'customer', 'shopkeeper', 'delivery'

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        const user = await apiCall('/api/auth/signup', 'POST', {
          name: name.trim() || 'New User',
          email,
          password,
          phone: phone.trim(),
          role
        });
        onAuthSuccess(user);
      } else {
        const user = await apiCall('/api/auth/login', 'POST', {
          email,
          password
        });
        onAuthSuccess(user);
      }
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setRole('customer');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="auth-view" className="view-section active">
      <div className="auth-container">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome to QuickShopp' : 'Join QuickShopp Ecosystem'}</h2>
          <p id="auth-subtitle">
            {mode === 'login' 
              ? 'Log in to order fresh meals, groceries, and more.' 
              : 'Create an account to start buying, selling, or delivering.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-toggle ${mode === 'login' ? 'active' : ''}`} 
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`auth-toggle ${mode === 'signup' ? 'active' : ''}`} 
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form id="auth-form" onSubmit={handleSubmit}>
          {/* Name (Only visible during Signup) */}
          {mode === 'signup' && (
            <div className="form-group" id="group-signup-name">
              <label htmlFor="auth-name">Full Name</label>
              <input 
                type="text" 
                id="auth-name" 
                className="form-control" 
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input 
              type="email" 
              id="auth-email" 
              className="form-control" 
              placeholder="name@domain.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input 
              type="password" 
              id="auth-password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {/* Phone Number (Only visible during Signup) */}
          {mode === 'signup' && (
            <div className="form-group" id="group-signup-phone">
              <label htmlFor="auth-phone">Mobile Number</label>
              <input 
                type="tel" 
                id="auth-phone" 
                className="form-control" 
                placeholder="+919876543210" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>
          )}

          {/* Role Selector (Only visible during Signup) */}
          {mode === 'signup' && (
            <div className="form-group" id="group-signup-role">
              <label>Register As</label>
              <div className="role-selector-grid">
                <div 
                  className={`role-card-opt ${role === 'customer' ? 'selected' : ''}`} 
                  onClick={() => setRole('customer')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Customer</span>
                </div>
                <div 
                  className={`role-card-opt ${role === 'shopkeeper' ? 'selected' : ''}`} 
                  onClick={() => setRole('shopkeeper')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Shopkeeper</span>
                </div>
                <div 
                  className={`role-card-opt ${role === 'delivery' ? 'selected' : ''}`} 
                  onClick={() => setRole('delivery')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span>Rider</span>
                </div>
              </div>
            </div>
          )}

          <button type="submit" id="btn-auth-submit" className="btn btn-primary btn-full mt-4">
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p id="auth-helper-text" className="auth-helper-text" style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>Tip: Use <strong>admin@swiftdrop.com</strong> / <strong>admin123</strong> to login as administrator.</>
          ) : (
            <>Become a QuickShopp member today and get instant deliveries.</>
          )}
        </p>
      </div>
    </section>
  );
}
