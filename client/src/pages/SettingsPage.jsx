import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Globe, Shield, Check, Loader, CheckCircle, AlertCircle, ChevronRight, MapPin, Zap, Bell, Upload } from 'lucide-react';

const TABS = [
  { id: 0, label: 'Profile',   icon: <User size={18} /> },
  { id: 1, label: 'Logistics', icon: <MapPin size={18} /> },
  { id: 2, label: 'Security',  icon: <Shield size={18} /> },
  { id: 4, label: 'System',    icon: <Bell size={18} /> },
];

export default function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile]     = useState({ name: '', storeName: '', headquarters: '', contact: '' });
  const [password, setPassword]   = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading]     = useState(false);
  const [alert, setAlert]         = useState(null);

  useEffect(() => {
    api.get('/api/auth/profile').then(r => {
      const u = r.data.data;
      setProfile({
        name:         u.name         || '',
        storeName:    u.storeName    || '',
        headquarters: u.headquarters || '',
        contact:      u.contact      || '',
      });
    }).catch(console.error);
  }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/auth/profile', profile);
      // Update localStorage so sidebar shows new name
      const stored = JSON.parse(localStorage.getItem('inventory_user') || '{}');
      localStorage.setItem('inventory_user', JSON.stringify({ ...stored, name: profile.name }));
      showAlert('success', 'Profile saved successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save profile');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.newPw !== password.confirm) {
      showAlert('error', 'New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/api/auth/profile', { password: password.newPw });
      setPassword({ current: '', newPw: '', confirm: '' });
      showAlert('success', 'Password updated successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <header className="page-header">
        <label className="page-header-label">System Configuration</label>
        <h1 className="page-title">Workspace Settings</h1>
        <p className="page-subtitle">Configure your store identity, team permissions, and AI integrations.</p>
      </header>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '2rem' }}>
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {alert.msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }}>
        {/* ── SETTINGS NAV ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              style={{ justifyContent: 'flex-start', padding: '1rem' }}
            >
              {tab.icon}
              <span style={{ marginLeft: '0.75rem', fontWeight: 700 }}>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}

          <div className="card" style={{ marginTop: '2rem', background: 'var(--primary)', color: '#fff', border: 'none' }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.5rem' }}>LOGGED IN AS</div>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>{user?.role?.toUpperCase()}</div>
          </div>
        </div>

        {/* ── CONTENT PANEL ── */}
        <div className="animate-in" style={{ maxWidth: '800px' }}>

          {/* Profile Tab */}
          {activeTab === 0 && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Store Profile</h3>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div className="sidebar-brand-icon" style={{ width: 80, height: 80, fontSize: '1.5rem', flexShrink: 0 }}><Globe /></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input type="text" className="form-control" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Store / Business Name</label>
                      <input type="text" className="form-control" placeholder="e.g. SuperMart Global Ltd." value={profile.storeName} onChange={e => setProfile({...profile, storeName: e.target.value})} />
                    </div>
                    <div className="grid-cols-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Headquarters / City</label>
                        <input type="text" className="form-control" placeholder="e.g. Chennai, TN" value={profile.headquarters} onChange={e => setProfile({...profile, headquarters: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input type="text" className="form-control" placeholder="+91 99999 00000" value={profile.contact} onChange={e => setProfile({...profile, contact: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader size={18} className="animate-float" /> : <Check size={18} />} Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Logistics Tab */}
          {activeTab === 1 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Regional Logistics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Main Warehouse (MAA)', 'Distribution Center (BLR)', 'Transit Hub (CBE)'].map((loc, i) => (
                  <div key={i} className="flex-between" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div className="flex-center gap-3">
                      <div className="sidebar-brand-icon" style={{ width: 40, height: 40 }}><MapPin size={18} /></div>
                      <div style={{ fontWeight: 700 }}>{loc}</div>
                    </div>
                    <span className="badge-vibrant green">Operational</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 2 && (
            <form onSubmit={handleChangePassword}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" value={password.current} onChange={e => setPassword({...password, current: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" value={password.newPw} onChange={e => setPassword({...password, newPw: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                    {loading ? <Loader size={18} /> : <Shield size={18} />} Update Password
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* System Alerts Tab */}
          {activeTab === 4 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>System Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Cloud Sync Notifications', on: true },
                  { label: 'Auto-Restock Email Alerts', on: true },
                  { label: 'WhatsApp Daily Summaries', on: false },
                  { label: 'LLM Response Webhooks', on: true },
                ].map((item, i) => (
                  <div key={i} className="flex-between">
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div className={`badge-vibrant ${item.on ? 'green' : 'indigo'}`} style={{ cursor: 'pointer' }}>
                      {item.on ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
