import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../ui/RoleSelector';
import { validateGmailEmail, validateStrongPassword } from '../../utils/validation';

const Login = ({ onSuccess, onSwitchToRegister }) => {
  const { login, handleGoogleSignIn, completeGoogleSignIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [tempGoogleUser, setTempGoogleUser] = useState(null);

  // Check if user was auto-logged in after Google sign-in
  useEffect(() => {
    if (user && !showRoleSelector && !tempGoogleUser && user.loginType === 'google') {
      // Auto-login happened, redirect
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    }
  }, [user, showRoleSelector, tempGoogleUser, onSuccess]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setEmailError('');
  setPasswordError('');

  const emailValidationError = validateGmailEmail(email);
  if (emailValidationError) {
    setEmailError(emailValidationError);
    return;
  }

  const passwordValidationError = validateStrongPassword(password);
  if (passwordValidationError) {
    setPasswordError(passwordValidationError);
    return;
  }

  try {
    await login(email, password);
    onSuccess?.();
  } catch (err) {
    setError(err.message || 'Login failed');
  }
};


  const handleRoleSelected = (role) => {
    if (tempGoogleUser) {
      completeGoogleSignIn(tempGoogleUser, role);
      setShowRoleSelector(false);
      setTempGoogleUser(null);
      // Redirect based on role
      onSuccess?.();
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      setError('');
      handleGoogleSignIn(credentialResponse, (tempUser) => {
        // First time - show role selector
        if (tempUser) {
          setTempGoogleUser(tempUser);
          setShowRoleSelector(true);
        }
      });
    } catch (err) {
      console.error('[Login] Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
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
          <div>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              style={{ width: '100%' }}
            />

            {emailError && <div style={{ color: 'tomato', marginTop: 4, fontSize: '14px' }}>{emailError}</div>}
          </div>
          <div>
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              style={{ width: '100%' }}
            />

            {passwordError && <div style={{ color: 'tomato', marginTop: 4, fontSize: '14px' }}>{passwordError}</div>}
          </div>
          <button type="submit">Sign in</button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>or</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          Don't have an account? <a style={{ color: '#61dafb', cursor: 'pointer' }} onClick={onSwitchToRegister}>Register</a>
        </div>
      </div>
      {showRoleSelector && tempGoogleUser && (
        <RoleSelector
          userName={tempGoogleUser.name}
          onSelectRole={handleRoleSelected}
        />
      )}
    </div>
  );
};

export default Login;

