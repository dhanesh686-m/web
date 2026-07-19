import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../api/client';

export default function SmsSimulator({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filterPhone, setFilterPhone] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  
  const seenIds = useRef(new Set());
  const initialLoadDone = useRef(false);

  // Play a premium double-beep chime using Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Tone 1 (Lower Pitch)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Tone 2 (Higher Pitch, slightly delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio chime failed (user interaction block fallback):', e);
    }
  };

  useEffect(() => {
    // Set default filter phone to logged in user phone, if any
    if (currentUser && currentUser.phone) {
      setFilterPhone(currentUser.phone);
    } else {
      setFilterPhone('all');
    }
  }, [currentUser]);

  useEffect(() => {
    // Fetch logs immediately, then start polling
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [filterPhone]);

  const fetchLogs = async () => {
    try {
      const url = filterPhone === 'all' ? '/api/sms-logs' : `/api/sms-logs?phone=${encodeURIComponent(filterPhone)}`;
      const data = await apiCall(url);
      setLogs(data);

      let hasNew = false;
      let newestMsg = null;

      data.forEach(log => {
        const logId = log._id || log.id;
        if (!seenIds.current.has(logId)) {
          seenIds.current.add(logId);
          if (initialLoadDone.current) {
            hasNew = true;
            newestMsg = log;
          }
        }
      });

      if (hasNew && newestMsg) {
        playNotificationSound();
        setToastMessage(`SMS to ${newestMsg.to}: "${newestMsg.message}"`);
        setTimeout(() => setToastMessage(null), 5000);
      }

      initialLoadDone.current = true;
    } catch (err) {
      console.error('Failed to fetch SMS logs:', err);
    }
  };

  return (
    <>
      {/* Toast Notification Alert Overlay */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderLeft: '4px solid var(--primary)',
          borderTop: '1px solid var(--bg-card-border)',
          borderRight: '1px solid var(--bg-card-border)',
          borderBottom: '1px solid var(--bg-card-border)',
          color: 'var(--text-primary)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--glow-shadow)',
          zIndex: 99999,
          maxWidth: '350px',
          animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            New SMS Received
          </div>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{toastMessage}</div>
        </div>
      )}

      {/* Floating simulator button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)'
        }}
        title="SMS Simulator Phone"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      </div>

      {/* Smartphone Chassis Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '105px',
          right: '30px',
          width: '340px',
          height: '520px',
          borderRadius: '32px',
          background: '#0b111e',
          border: '6px solid #2d3748',
          boxShadow: 'var(--glow-shadow)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Phone Notch/Speaker Header */}
          <div style={{
            height: '24px',
            background: '#1a202c',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '80px',
              height: '14px',
              background: '#2d3748',
              borderRadius: '0 0 10px 10px',
              position: 'absolute',
              top: 0
            }}></div>
            <div style={{
              fontSize: '0.7rem',
              color: '#718096',
              position: 'absolute',
              left: '15px'
            }}>9:41</div>
            <div style={{
              display: 'flex',
              gap: '4px',
              position: 'absolute',
              right: '15px'
            }}>
              {/* Fake Battery Icon */}
              <div style={{ width: '16px', height: '8px', border: '1px solid #718096', borderRadius: '2px', padding: '1px' }}>
                <div style={{ width: '100%', height: '100%', background: '#718096' }}></div>
              </div>
            </div>
          </div>

          {/* Messages App Header */}
          <div style={{
            background: '#171e30',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--bg-card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></span>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>Message Inbox</h4>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Filter Phone Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', color: '#a0aec0', whiteSpace: 'nowrap' }}>SMS Line:</label>
              <select
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                style={{
                  flex: 1,
                  background: '#090d16',
                  color: '#e2e8f0',
                  border: '1px solid var(--bg-card-border)',
                  fontSize: '0.75rem',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              >
                <option value="all">All Logs (Global)</option>
                {currentUser && currentUser.phone && (
                  <option value={currentUser.phone}>Active User ({currentUser.phone})</option>
                )}
                {/* Seed user list numbers for debugging */}
                <option value="+919876543210"> Arthur (+919876543210)</option>
                <option value="+919876543211"> Chef Ramsay (+919876543211)</option>
                <option value="+919876543212"> Dr. Elizabeth (+919876543212)</option>
                <option value="+919876543213"> Speedy Rider (+919876543213)</option>
                <option value="+919876543214"> Flash Rider (+919876543214)</option>
                <option value="+919876543215"> Alice Customer (+919876543215)</option>
              </select>
            </div>
          </div>

          {/* SMS logs list (Scrollable) */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: '#090d16'
          }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#4a5568', fontSize: '0.8rem', marginTop: '3rem' }}>
                No text messages received. Place an order or change order status to trigger SMS alerts.
              </div>
            ) : (
              logs.map((log) => {
                const isSentToMe = currentUser && log.to === currentUser.phone;
                return (
                  <div 
                    key={log._id || log.id}
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: '#718096', marginLeft: '6px' }}>
                      To: <span style={{ color: 'var(--primary)' }}>{log.to}</span> {isSentToMe ? '(You)' : ''}
                    </div>
                    <div style={{
                      background: '#1a202c',
                      color: '#e2e8f0',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      lineHeight: '1.35',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      {log.message}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#4a5568', alignSelf: 'flex-end', marginRight: '6px' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Simulator Footer */}
          <div style={{
            height: '12px',
            background: '#1a202c',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '2px'
          }}>
            <div style={{
              width: '120px',
              height: '4px',
              background: '#4a5568',
              borderRadius: '2px'
            }}></div>
          </div>
        </div>
      )}
    </>
  );
}
