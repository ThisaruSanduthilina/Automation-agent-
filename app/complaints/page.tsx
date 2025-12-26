'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface Complaint {
  id: string;
  complaint_number: string;
  title: string;
  description: string;
  category: string;
  zone: string;
  priority: string;
  status: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assigned_to_name?: string;
  resolution_notes?: string;
  resolved_at?: string;
}

export default function ComplaintsPage() {
  const { user, hasHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || !isAuthenticated) {
      router.push('/login');
      return;
    }
    loadComplaints();
  }, [user, router, hasHydrated, isAuthenticated, filterStatus]);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const statusFilter = filterStatus !== 'all' ? filterStatus : undefined;
      const data = await apiClient.getComplaints(statusFilter);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    try {
      await apiClient.updateComplaint(complaintId, { status: newStatus });
      await loadComplaints();
      setShowDetailModal(false);
      alert('Status updated successfully!');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'Failed to update status'}`);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    try {
      await apiClient.updateComplaint(selectedComplaint.id, {
        status: 'resolved',
        resolution_notes: resolutionNotes
      });
      setShowResolveModal(false);
      setShowDetailModal(false);
      setResolutionNotes('');
      await loadComplaints();
      alert('Complaint resolved successfully!');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'Failed to resolve complaint'}`);
    }
  };

  const openDetailModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const openResolveModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolutionNotes('');
    setShowResolveModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;

  if (!hasHydrated || isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000', color: '#fff' }}>
        <div>Loading complaints...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
            🔧 Complaint Management
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            View and manage electrical failure reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/chat" style={{ padding: '10px 20px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '14px' }}>
            💬 Chat
          </Link>
          {user.role === 'admin' && (
            <Link href="/admin" style={{ padding: '10px 20px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '14px' }}>
              👑 Admin
            </Link>
          )}
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Total Complaints</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{complaints.length}</div>
        </div>
        <div style={{ background: '#0a0a0a', border: '1px solid #f59e0b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Pending</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingCount}</div>
        </div>
        <div style={{ background: '#0a0a0a', border: '1px solid #3b82f6', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>In Progress</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>{inProgressCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')} style={{ padding: '10px 20px', background: filterStatus === 'all' ? '#fff' : '#1a1a1a', color: filterStatus === 'all' ? '#000' : '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          All ({complaints.length})
        </button>
        <button onClick={() => setFilterStatus('pending')} style={{ padding: '10px 20px', background: filterStatus === 'pending' ? '#f59e0b' : '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          Pending ({pendingCount})
        </button>
        <button onClick={() => setFilterStatus('in_progress')} style={{ padding: '10px 20px', background: filterStatus === 'in_progress' ? '#3b82f6' : '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          In Progress ({inProgressCount})
        </button>
        <button onClick={() => setFilterStatus('resolved')} style={{ padding: '10px 20px', background: filterStatus === 'resolved' ? '#10b981' : '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          Resolved
        </button>
      </div>

      {/* Complaints Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {complaints.map((complaint) => (
          <div key={complaint.id} style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => openDetailModal(complaint)} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#555'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>{complaint.complaint_number}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{complaint.title}</h3>
              </div>
              <span style={{ fontSize: '24px' }}>{getPriorityIcon(complaint.priority)}</span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '15px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {complaint.description}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: `${getStatusColor(complaint.status)}20`, color: getStatusColor(complaint.status) }}>
                {complaint.status.toUpperCase().replace('_', ' ')}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: `${getPriorityColor(complaint.priority)}20`, color: getPriorityColor(complaint.priority) }}>
                {complaint.priority.toUpperCase()}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: '#1a1a1a', color: '#888' }}>
                {complaint.zone.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* Footer */}
            <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #1a1a1a', paddingTop: '10px' }}>
              <div>Reported by: {complaint.created_by_name}</div>
              <div>{new Date(complaint.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {complaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <div style={{ fontSize: '18px' }}>No complaints found</div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', padding: '30px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>{selectedComplaint.complaint_number}</div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedComplaint.title}</h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: `${getStatusColor(selectedComplaint.status)}20`, color: getStatusColor(selectedComplaint.status) }}>
                {selectedComplaint.status.toUpperCase().replace('_', ' ')}
              </span>
              <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: `${getPriorityColor(selectedComplaint.priority)}20`, color: getPriorityColor(selectedComplaint.priority) }}>
                {selectedComplaint.priority.toUpperCase()} PRIORITY
              </span>
              <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#1a1a1a', color: '#ccc' }}>
                {selectedComplaint.category.toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Description</h4>
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>{selectedComplaint.description}</p>
            </div>

            {/* Zone */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Zone</h4>
              <p style={{ color: '#ccc' }}>{selectedComplaint.zone.replace(/_/g, ' ').toUpperCase()}</p>
            </div>

            {/* Reporter */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Reported By</h4>
              <p style={{ color: '#ccc' }}>{selectedComplaint.created_by_name}</p>
              <p style={{ fontSize: '12px', color: '#666' }}>{new Date(selectedComplaint.created_at).toLocaleString()}</p>
            </div>

            {/* Resolution Notes */}
            {selectedComplaint.resolution_notes && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#1a1a1a', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#10b981', marginBottom: '10px' }}>✅ Resolution Notes</h4>
                <p style={{ color: '#ccc', lineHeight: '1.6' }}>{selectedComplaint.resolution_notes}</p>
                {selectedComplaint.resolved_at && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    Resolved: {new Date(selectedComplaint.resolved_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {(user.role === 'admin' || user.role === 'electrical_engineer') && selectedComplaint.status !== 'resolved' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {selectedComplaint.status === 'pending' && (
                  <button onClick={() => handleUpdateStatus(selectedComplaint.id, 'in_progress')} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Mark In Progress
                  </button>
                )}
                <button onClick={() => openResolveModal(selectedComplaint)} style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Mark Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', padding: '30px', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Resolve Complaint</h3>
            <p style={{ color: '#888', marginBottom: '20px', fontSize: '14px' }}>
              {selectedComplaint.complaint_number} - {selectedComplaint.title}
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>
                Resolution Notes *
              </label>
              <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Explain what was done to resolve this issue..." style={{ width: '100%', minHeight: '120px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '14px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowResolveModal(false)} style={{ padding: '10px 20px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleResolve} disabled={!resolutionNotes.trim()} style={{ padding: '10px 20px', background: resolutionNotes.trim() ? '#10b981' : '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: resolutionNotes.trim() ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
                Resolve Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
