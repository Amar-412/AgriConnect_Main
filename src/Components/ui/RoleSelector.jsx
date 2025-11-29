import React from 'react';

/**
 * RoleSelector Modal Component
 * Displays role selection options for first-time Google sign-in users
 * Uses existing CSS classes and dark theme - no UI changes
 */
const RoleSelector = ({ onSelectRole, userName }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={(e) => {
        // Prevent closing on background click - user must select a role
        e.stopPropagation();
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          color: 'white'
        }}>
          Welcome, {userName || 'User'}!
        </h2>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px'
        }}>
          Please select your role to continue
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => onSelectRole('Farmer')}
            style={{
              padding: '14px 24px',
              background: '#5eed3a',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4ddb2a';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#5eed3a';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Farmer
          </button>
          <button
            onClick={() => onSelectRole('Buyer')}
            style={{
              padding: '14px 24px',
              background: '#5eed3a',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4ddb2a';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#5eed3a';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Buyer
          </button>
          <button
            onClick={() => onSelectRole('Admin')}
            style={{
              padding: '14px 24px',
              background: '#5eed3a',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4ddb2a';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#5eed3a';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;

