import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { validateGmailEmail, validateStrongPassword } from '../../utils/validation';

const AdminDashboard = () => {
  const { allUsers, createUser, updateUser, deleteUser } = useAuth();
  const { orders, updateOrderStatus } = useData();
  const [draftUser, setDraftUser] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const loadTransactions = () => {
      const allTx = JSON.parse(localStorage.getItem('transactions') || '[]');
      setAllTransactions(allTx.reverse()); // Reverse to show newest first
    };
    
    loadTransactions();
    
    // Refresh transactions periodically to catch new ones
    const interval = setInterval(loadTransactions, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    // Validate email
    const emailValidationError = validateGmailEmail(draftUser.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Validate password
    const passwordValidationError = validateStrongPassword(draftUser.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      createUser(draftUser);
      setDraftUser({ name: '', email: '', password: '', role: 'buyer' });
      setShowCreateForm(false);
      setEmailError('');
      setPasswordError('');
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { backgroundColor: '#5eed3a', color: 'black' };
      case 'placed':
        return { backgroundColor: '#ffa500', color: 'black' };
      case 'flagged':
        return { backgroundColor: '#ff4444', color: 'white' };
      default:
        return { backgroundColor: '#666', color: 'white' };
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '3rem',
        fontWeight: 'bold',
        textAlign: 'center', 
        marginBottom: '32px',
        background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
        backgroundSize: '200% auto',
        color: 'transparent',
        backgroundClip: 'text',
        animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
      }}>
        Admin Dashboard
      </h2>
      
      {/* Users Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(94, 237, 58, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgba(94, 237, 58, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
            backgroundSize: '200% auto',
            color: 'transparent',
            backgroundClip: 'text',
            animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
          }}>
            Users
          </h3>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              background: '#5eed3a',
              color: 'black',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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
            Create User
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateUser} style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(94, 237, 58, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input 
                placeholder="Name" 
                value={draftUser.name} 
                onChange={(e) => setDraftUser({ ...draftUser, name: e.target.value })}
                required
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input 
                  placeholder="Email" 
                  type="email"
                  value={draftUser.email} 
                  onChange={(e) => {
                    setDraftUser({ ...draftUser, email: e.target.value });
                    setEmailError('');
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                {emailError && <div style={{ color: 'tomato', marginTop: 4, fontSize: '14px' }}>{emailError}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input 
                  placeholder="Password" 
                  type="password" 
                  value={draftUser.password} 
                  onChange={(e) => {
                    setDraftUser({ ...draftUser, password: e.target.value });
                    setPasswordError('');
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                {passwordError && <div style={{ color: 'tomato', marginTop: 4, fontSize: '14px' }}>{passwordError}</div>}
              </div>
              <select 
                value={draftUser.role} 
                onChange={(e) => setDraftUser({ ...draftUser, role: e.target.value })}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid rgba(255,255,255, 0.2)',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              >
                <option value="admin">Admin</option>
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
            </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="submit"
                style={{
                  background: '#5eed3a',
                  color: 'black',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4ddb2a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#5eed3a';
                }}
              >
                Create User
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: 'rgba(94, 237, 58, 0.2)' }}>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Name</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Email</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Role</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Login Type</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, index) => (
                <tr key={user.id} style={{
                  background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(94, 237, 58, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)';
                }}>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{user.name}</td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{user.email}</td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      ...(user.role === 'admin' ? { background: '#ff6b6b', color: 'white' } :
                          user.role === 'farmer' ? { background: '#4ecdc4', color: 'white' } :
                          { background: '#45b7d1', color: 'white' })
                    }}>
                      {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'Buyer'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: user.loginType === 'google' ? '#4285f4' : '#666',
                      color: 'white'
                    }}>
                      {user.loginType === 'google' ? 'Google' : 'Manual'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button 
                      onClick={() => {
                        const currentRole = (user.role || '').toLowerCase();
                        const newRole = currentRole === 'buyer' ? 'farmer' : 
                                      currentRole === 'farmer' ? 'buyer' : 'admin';
                        updateUser(user.id || user.userId || user.email, { role: newRole });
                      }}
                      style={{
                        background: '#ffa500',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ff8c00';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ffa500';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Toggle Role
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id || user.userId || user.email)}
                      style={{
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#cc0000';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ff4444';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Transactions Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(94, 237, 58, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgba(94, 237, 58, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
            backgroundSize: '200% auto',
            color: 'transparent',
            backgroundClip: 'text',
            animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
          }}>
            Transactions (Orders)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: 'rgba(94, 237, 58, 0.2)' }}>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Transaction ID</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Buyer Name</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Farmer Name</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Product</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Total</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Status</th>
                <th style={{ 
                  color: '#5eed3a', 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                allTransactions.map((tx, index) => (
                  <tr key={tx.transactionId} style={{
                    background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(94, 237, 58, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)';
                  }}>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {tx.transactionId}
                    </td>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {tx.buyerName || tx.buyerEmail || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {tx.farmerName || tx.farmerEmail || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {tx.items && tx.items.length > 0
                        ? (tx.items.length === 1 
                            ? tx.items[0].name || 'Unknown Product'
                            : `Multiple items (${tx.items.length})`)
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#5eed3a', fontWeight: '600' }}>
                      {(() => {
                        const total = tx.total || (tx.items && tx.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0)) || 0;
                        return `₹${Number(total).toLocaleString('en-IN')}`;
                      })()}
                    </td>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        ...getStatusStyle(tx.status)
                      }}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



