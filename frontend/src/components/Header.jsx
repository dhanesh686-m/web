import React from 'react';

export default function Header({ currentUser, onLogout, onBrandClick }) {
  const getAvatarChar = () => {
    if (!currentUser || !currentUser.name) return 'U';
    return currentUser.name.charAt(0).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return '';
    if (role === 'delivery') return 'Rider';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      {/* SVG Gradient Definition for Logo */}
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
        <linearGradient id="brand-gradient" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </svg>

      <header>
        <div className="brand" onClick={onBrandClick}>
          {/* Inline SVG Logo */}
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'url(#brand-gradient)' }}>
            <path d="M5 18H18c.6 0 1.1-.4 1.2-1l1.4-7c.1-.4-.2-.8-.6-.8H8"></path>
            <path d="M16 6L8 14H3V9h4l3-3h6z"></path>
            <circle cx="7.5" cy="20.5" r="1.5" fill="currentColor"></circle>
            <circle cx="16.5" cy="20.5" r="1.5" fill="currentColor"></circle>
          </svg>
          <span>QuickShopp</span>
        </div>

        <div className="nav-actions">
          {currentUser && (
            <div className="user-profile-info" id="user-profile-header">
              <div className="user-avatar" id="header-avatar">{getAvatarChar()}</div>
              <div className="user-details">
                <span className="user-name" id="header-username">{currentUser.name}</span>
                <span className="user-role-badge" id="header-role">{formatRole(currentUser.role)}</span>
              </div>
              <button 
                className="btn btn-danger btn-sm" 
                onClick={onLogout}
                style={{ marginLeft: '0.5rem', padding: '0.4rem 0.6rem' }}
              >
                {/* Logout Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
