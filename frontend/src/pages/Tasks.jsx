import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTasks(); }, [pagination.page, filters.status, filters.priority]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load tasks'); }
    setLoading(false);
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate?.split('T')[0] || '',
      });
    } else {
      setEditingTask(null);
      setForm({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingTask(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form };
      if (!data.dueDate) delete data.dueDate;
      if (editingTask) {
        await tasksAPI.update(editingTask._id, data);
        toast.success('Task updated');
      } else {
        await tasksAPI.create(data);
        toast.success('Task created');
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Delete failed'); }
  };

  const toggleStatus = async (task) => {
    const next = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' };
    try {
      await tasksAPI.update(task._id, { status: next[task.status] });
      fetchTasks();
    } catch { toast.error('Update failed'); }
  };

  const statusClass = { pending: 'badge-warning', 'in-progress': 'badge-info', completed: 'badge-success' };
  const priorityClass = { low: '', medium: 'badge-info', high: 'badge-danger' };

  return (
    <div className="tasks-page">
      <header className="page-header">
        <h1>Tasks</h1>
        <button onClick={() => openModal()} className="btn-primary"><Plus size={16} /> New</button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: '3rem' }}><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state card">
          <p>No tasks found</p>
          <button onClick={() => openModal()} className="btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            <Plus size={14} /> Create
          </button>
        </div>
      ) : (
        <>
          <div className="task-grid">
            {tasks.map((t) => (
              <div key={t._id} className="task-card card">
                <div className="task-card-top">
                  <div className="task-badges">
                    <span className={`badge ${statusClass[t.status]}`}>{t.status}</span>
                    <span className={`badge ${priorityClass[t.priority]}`}>{t.priority}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => toggleStatus(t)} className="btn-ghost" title="Toggle"><Check size={14} /></button>
                    <button onClick={() => openModal(t)} className="btn-ghost" title="Edit"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(t._id)} className="btn-ghost" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="task-card-title">{t.title}</h3>
                {t.description && <p className="task-card-desc">{t.description}</p>}
                {t.dueDate && <span className="task-card-due">Due {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="btn-secondary btn-sm">Prev</button>
              <span className="text-muted">{pagination.page} / {pagination.pages}</span>
              <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="btn-secondary btn-sm">Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingTask ? 'Edit task' : 'New task'}</h2>
              <button onClick={closeModal} className="btn-ghost"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <div className="spinner" /> : editingTask ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
