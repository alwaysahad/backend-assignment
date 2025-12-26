import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, User, Shield, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">TF</div>
          
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className="nav-item" title="Dashboard">
              <LayoutDashboard size={20} />
            </NavLink>
            <NavLink to="/tasks" className="nav-item" title="Tasks">
              <CheckSquare size={20} />
            </NavLink>
            <NavLink to="/profile" className="nav-item" title="Profile">
              <User size={20} />
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="nav-item" title="Admin">
                <Shield size={20} />
              </NavLink>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-badge" title={user?.email}>
            {user?.name?.charAt(0)}
          </div>
          <div className="divider" />
          <button onClick={handleLogout} className="logout-btn" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
