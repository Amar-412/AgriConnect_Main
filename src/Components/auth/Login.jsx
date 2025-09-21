import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Login</h2>
        {error && <div style={{ color: 'tomato', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Sign in</button>
        </form>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          Don't have an account? <a style={{ color: '#61dafb', cursor: 'pointer' }} onClick={onSwitchToRegister}>Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

