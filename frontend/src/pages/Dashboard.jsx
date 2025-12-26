import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { Plus, ChevronRight, Clock, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          tasksAPI.getStats(),
          tasksAPI.getAll({ limit: 5 }),
        ]);
        setStats(statsRes.data.data.stats);
        setRecentTasks(tasksRes.data.data.tasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProgress = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const statusConfig = {
    pending: { icon: Circle, color: 'warning' },
    'in-progress': { icon: Clock, color: 'info' },
    completed: { icon: CheckCircle2, color: 'success' },
  };

  const priorityConfig = {
    high: { icon: AlertTriangle, color: 'danger' },
    medium: { color: 'info' },
    low: { color: 'muted' },
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}><div className="spinner" /></div>;
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-greeting">
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/tasks" className="btn-primary"><Plus size={16} /> New task</Link>
      </header>

      <div className="dash-grid">
        <div className="progress-card">
          <div className="progress-header">
            <span className="progress-label">Completion</span>
            <span className="progress-value">{getProgress()}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
          </div>
          <div className="progress-stats">
            <span>{stats?.completed || 0} of {stats?.total || 0} tasks done</span>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon pending"><Circle size={18} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats?.pending || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active"><Clock size={18} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats?.inProgress || 0}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon done"><CheckCircle2 size={18} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats?.completed || 0}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon urgent"><AlertTriangle size={18} /></div>
            <div className="stat-info">
              <span className="stat-num">{stats?.highPriority || 0}</span>
              <span className="stat-label">Urgent</span>
            </div>
          </div>
        </div>
      </div>

      <section className="recent-section">
        <div className="section-header">
          <h2>Recent Tasks</h2>
          <Link to="/tasks" className="link-all">View all <ChevronRight size={14} /></Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon"><CheckCircle2 size={32} /></div>
            <p>No tasks yet</p>
            <Link to="/tasks" className="btn-primary btn-sm"><Plus size={14} /> Create your first task</Link>
          </div>
        ) : (
          <div className="task-list">
            {recentTasks.map((task) => {
              const StatusIcon = statusConfig[task.status]?.icon || Circle;
              const statusColor = statusConfig[task.status]?.color || 'muted';
              const priorityColor = priorityConfig[task.priority]?.color || 'muted';
              
              return (
                <div key={task._id} className="task-item">
                  <div className={`task-status ${statusColor}`}>
                    <StatusIcon size={16} />
                  </div>
                  <div className="task-content">
                    <span className="task-title">{task.title}</span>
                    <div className="task-meta">
                      <span className={`priority-dot ${priorityColor}`} />
                      <span>{task.priority}</span>
                      {task.dueDate && (
                        <>
                          <span className="meta-sep">•</span>
                          <span>Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to="/tasks" className="task-link">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
