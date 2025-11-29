import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateGmailEmail, validateStrongPassword } from '../../utils/validation';

const Register = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validate email
    const emailValidationError = validateGmailEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Validate password
    const passwordValidationError = validateStrongPassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      register(name, email, password, role);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create account</h2>
        {error && <div style={{ color: 'tomato', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <input placeholder="Email" value={email} onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }} />
            {emailError && <div style={{ color: 'tomato', marginTop: 4, fontSize: '14px' }}>{emailError}</div>}
          </div>
          <div>
            <input placeholder="Password" type="password" value={password} onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }} />
            {passwordError && <div style={{ color: 'tomato', marginTop: 4, fontSize: '14px' }}>{passwordError}</div>}
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          Already have an account? <a style={{ color: '#61dafb', cursor: 'pointer' }} onClick={onSwitchToLogin}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;


