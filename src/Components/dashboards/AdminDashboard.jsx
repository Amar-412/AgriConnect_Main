import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const AdminDashboard = () => {
  const { allUsers, createUser, updateUser, deleteUser } = useAuth();
  const { orders, updateOrderStatus } = useData();
  const [draftUser, setDraftUser] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateUser = (e) => {
              e.preventDefault();
              try {
                createUser(draftUser);
                setDraftUser({ name: '', email: '', password: '', role: 'buyer' });
      setShowCreateForm(false);
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
              <input 
                placeholder="Email" 
                type="email"
                value={draftUser.email} 
                onChange={(e) => setDraftUser({ ...draftUser, email: e.target.value })}
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
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input 
                placeholder="Password" 
                type="password" 
                value={draftUser.password} 
                onChange={(e) => setDraftUser({ ...draftUser, password: e.target.value })}
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
              <select 
                value={draftUser.role} 
                onChange={(e) => setDraftUser({ ...draftUser, role: e.target.value })}
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
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button 
                      onClick={() => updateUser(user.id, { 
                        role: user.role === 'buyer' ? 'farmer' : 
                              user.role === 'farmer' ? 'buyer' : 'admin' 
                      })}
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
                      onClick={() => deleteUser(user.id)}
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
                }}>Order ID</th>
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
                }}>Quantity</th>
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
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} style={{
                  background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(94, 237, 58, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)';
                }}>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>#{order.id}</td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{order.productName}</td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{order.quantity}</td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      ...getStatusStyle(order.status)
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'approved')}
                      style={{
                        background: '#5eed3a',
                        color: 'black',
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
                        e.target.style.background = '#4ddb2a';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#5eed3a';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'flagged')}
                      style={{
                        background: '#ff6b6b',
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
                        e.target.style.background = '#ff5252';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ff6b6b';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Flag
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



