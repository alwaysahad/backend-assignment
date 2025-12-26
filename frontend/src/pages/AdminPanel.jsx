import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, Edit2, Trash2, X, UserCheck, UserX } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ page: pagination.page, limit: 10, search }),
      ]);
      setStats(s.data.data);
      setUsers(u.data.data.users);
      setPagination(u.data.data.pagination);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const openModal = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingUser(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.updateUser(editingUser._id, form);
      toast.success('User updated');
      closeModal();
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete user and their data?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const toggleStatus = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      fetchData();
    } catch { toast.error('Update failed'); }
  };

  if (loading && !stats) {
    return <div className="flex-center" style={{ height: '50vh' }}><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      <h1>Admin</h1>

      <div className="stats-row">
        <div className="stat-box"><span className="stat-num">{stats?.users?.totalUsers || 0}</span><span className="stat-label">Users</span></div>
        <div className="stat-box"><span className="stat-num">{stats?.users?.activeUsers || 0}</span><span className="stat-label">Active</span></div>
        <div className="stat-box"><span className="stat-num">{stats?.tasks?.totalTasks || 0}</span><span className="stat-label">Tasks</span></div>
        <div className="stat-box"><span className="stat-num">{stats?.tasks?.completedTasks || 0}</span><span className="stat-label">Done</span></div>
      </div>

      <div className="section-head">
        <h2>Users</h2>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData()} />
        </div>
      </div>

      <div className="card user-table-wrap">
        <table className="user-table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="user-cell">
                    <span className="avatar">{u.name.charAt(0)}</span>
                    <div><div className="name">{u.name}</div><div className="email">{u.email}</div></div>
                  </div>
                </td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-info' : ''}`}>{u.role}</span></td>
                <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="actions">
                    <button onClick={() => toggleStatus(u)} className="btn-ghost" title={u.isActive ? 'Deactivate' : 'Activate'}>{u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                    <button onClick={() => openModal(u)} className="btn-ghost" title="Edit"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(u._id)} className="btn-ghost" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="btn-secondary btn-sm">Prev</button>
          <span className="text-muted">{pagination.page} / {pagination.pages}</span>
          <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="btn-secondary btn-sm">Next</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Edit user</h2><button onClick={closeModal} className="btn-ghost"><X size={18} /></button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></div>
                <div className="form-group"><label>Status</label><select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <div className="spinner" /> : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
