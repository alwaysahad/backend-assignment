import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateMe(profile);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPwd !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPwd.length < 6) {
      toast.error('Password too short');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPwd });
      toast.success('Password changed');
      setPasswords({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed');
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <h1>Account</h1>

      <div className="tabs">
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile</button>
        <button className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>Password</button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="card form-card">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : <><Save size={14} /> Save</>}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="card form-card">
          <div className="form-group">
            <label>Current password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New password</label>
            <input type="password" value={passwords.newPwd} onChange={(e) => setPasswords({ ...passwords, newPwd: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
