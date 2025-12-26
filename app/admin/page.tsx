'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface UserData {
  uid: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  assigned_zones: string[];
}

interface Stats {
  total_users: number;
  total_complaints: number;
  active_users: number;
  pending_complaints: number;
}

export default function AdminDashboard() {
  const { user, logout, hasHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user || !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/chat');
      return;
    }

    loadDashboardData();
  }, [user, router, hasHydrated, isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await apiClient.changeUserRole(selectedUser.uid, newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      await loadDashboardData();
      alert(`Successfully changed ${selectedUser.full_name}'s role to ${newRole}`);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'Failed to change role'}`);
    }
  };

  const openRoleModal = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'electrical_engineer': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'electrical_engineer': return '⚡';
      default: return '👤';
    }
  };

  if (!hasHydrated || isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
        color: '#fff'
      }}>
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #333'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            👑 Admin Dashboard
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Manage users, roles, and system configuration
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/chat" style={{
            padding: '10px 20px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            💬 Chat
          </Link>
          <button
            onClick={() => logout()}
            style={{
              padding: '10px 20px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
              Total Users
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
              {stats.total_users}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '5px' }}>
              {stats.active_users} active
            </div>
          </div>

          <div style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
              Total Complaints
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
              {stats.total_complaints}
            </div>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '5px' }}>
              {stats.pending_complaints} pending
            </div>
          </div>

          <div style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
              System Status
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              🟢 Online
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
              All systems operational
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            User Management
          </h2>
          <p style={{ fontSize: '14px', color: '#888' }}>
            {users.length} users in the system
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: '#1a1a1a',
                borderBottom: '1px solid #333'
              }}>
                <th style={{
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '600'
                }}>
                  USER
                </th>
                <th style={{
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '600'
                }}>
                  EMAIL
                </th>
                <th style={{
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '600'
                }}>
                  ROLE
                </th>
                <th style={{
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '600'
                }}>
                  STATUS
                </th>
                <th style={{
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '600'
                }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((userData) => (
                <tr
                  key={userData.uid}
                  style={{
                    borderBottom: '1px solid #333'
                  }}
                >
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {getRoleIcon(userData.role)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{userData.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          UID: {userData.uid.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', color: '#ccc' }}>
                    {userData.email}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: `${getRoleColor(userData.role)}20`,
                      color: getRoleColor(userData.role)
                    }}>
                      {userData.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      color: userData.is_active ? '#10b981' : '#ef4444'
                    }}>
                      {userData.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button
                      onClick={() => openRoleModal(userData)}
                      style={{
                        padding: '8px 16px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              Change User Role
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#888', marginBottom: '10px' }}>
                User: <strong style={{ color: '#fff' }}>{selectedUser.full_name}</strong>
              </p>
              <p style={{ color: '#888' }}>
                Email: <strong style={{ color: '#fff' }}>{selectedUser.email}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                color: '#ccc'
              }}>
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="user">👤 User</option>
                <option value="electrical_engineer">⚡ Electrical Engineer</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
