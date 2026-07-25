import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Timer, Palette, Bell, BellOff, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import useSync from './hooks/useSync';

function App() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'violet';
  });
  const [notifPermission, setNotifPermission] = useState(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  const syncInfo = useSync();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncInput, setSyncInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check capacitor permissions natively
    const checkPerm = async () => {
      try {
        const perm = await LocalNotifications.checkPermissions();
        setNotifPermission(perm.display);
      } catch (e) {
        // Fallback for standard web
        setNotifPermission('Notification' in window ? Notification.permission : 'denied');
      }
    };
    checkPerm();
  }, []);

  const toggleNotifications = async () => {
    try {
      if (notifPermission === 'granted') {
        await LocalNotifications.schedule({
          notifications: [{
            title: '🔔 Reminders Active',
            body: 'You will receive real native reminders for your habits and focus sessions!',
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) } // trigger 1 sec from now
          }]
        });
      } else {
        const perm = await LocalNotifications.requestPermissions();
        setNotifPermission(perm.display);
        if (perm.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [{
              title: '🎉 Notifications Enabled!',
              body: 'Real alerts are now active for your tasks and daily habits.',
              id: 2,
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
        }
      }
    } catch (e) {
      // web fallback
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications.');
        return;
      }
      if (Notification.permission === 'granted') {
        new Notification('🔔 Daily Reminders Active', {
          body: 'You will receive real desktop reminders for your habits and focus sessions!',
        });
      } else {
        const permission = await Notification.requestPermission();
        setNotifPermission(permission);
        if (permission === 'granted') {
          new Notification('🎉 Notifications Enabled!', {
            body: 'Real desktop alerts are now active for your tasks and daily habits.',
          });
        }
      }
    }
  };

  const copyHostCode = () => {
    navigator.clipboard.writeText(syncInfo.peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleTheme = () => {
    const themes = ['violet', 'cyan', 'emerald', 'rose'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  return (
    <div className="app-container">
      {/* Sidebar / Mobile Bottom Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-nav-group">
          <NavItem icon={<LayoutDashboard size={22} />} label="Board" active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} title="Task Kanban Board" />
          <NavItem icon={<CalendarDays size={22} />} label="Habits" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} title="Multi-Habit Tracker" />
          <NavItem icon={<Timer size={22} />} label="Focus" active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} title="Pomodoro Timer" />
        </div>

        {/* Bottom Actions: Theme & Notifications */}
        <div className="sidebar-nav-group sidebar-bottom-group">
          <NavItem 
            icon={notifPermission === 'granted' ? <Bell size={20} color="var(--accent-color)" /> : <BellOff size={20} />} 
            label="Alerts"
            active={notifPermission === 'granted'} 
            onClick={toggleNotifications} 
            title={notifPermission === 'granted' ? 'Daily Reminders Active (Click to test)' : 'Click to enable Daily Desktop Reminders'} 
          />
          <NavItem 
            icon={<Smartphone size={20} color={syncInfo.status === 'connected' ? '#81c784' : 'var(--text-muted)'} />} 
            label="Sync" 
            active={false} 
            onClick={() => setShowSyncModal(true)} 
            title="Link Devices (WebRTC Sync)" 
          />
          <NavItem icon={<Palette size={20} />} label="Theme" active={false} onClick={cycleTheme} title={`Current Theme: ${theme}`} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="main-content-inner"
              >
              <div className="header" style={{ padding: '2rem 2rem 1.5rem 0' }}>
                <div>
                  <h1>Task Board</h1>
                  <p>Organize, prioritize, and conquer your workload</p>
                </div>
              </div>
              <KanbanBoard />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="main-content-inner"
              >
              <Calendar />
            </motion.div>
          )}

          {activeTab === 'pomodoro' && (
              <motion.div
                key="pomodoro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="main-content-inner"
              >
              <Pomodoro />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Modal */}
        <AnimatePresence>
          {showSyncModal && (
            <div className="modal-overlay" onClick={() => setShowSyncModal(false)}>
              <motion.div 
                className="modal-content" 
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Link Devices</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  Sync your tasks and habits across phone and desktop instantly, securely, and with zero lag.
                </p>

                {syncInfo.status === 'disconnected' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Option 1: Host Data</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>Generate a 4-word phrase on this device, then enter it on your other device.</p>
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => syncInfo.hostSync()}>
                        Generate Phrase
                      </button>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Option 2: Connect</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>Enter the 4-word phrase generated on your other device.</p>
                      <input 
                        type="text" 
                        placeholder="e.g. apple-horse-blue-tree"
                        className="add-task-input"
                        value={syncInput}
                        onChange={e => setSyncInput(e.target.value)}
                        style={{ textAlign: 'center' }}
                      />
                      <button 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', background: '#81c784', color: '#000' }} 
                        onClick={() => syncInfo.connectToHost(syncInput)}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                )}

                {(syncInfo.status === 'hosting' || syncInfo.status === 'connecting') && (
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>
                      {syncInfo.status === 'hosting' ? 'Your Sync Code' : 'Connecting...'}
                    </h3>
                    
                    {syncInfo.peerId && (
                      <div 
                        onClick={copyHostCode}
                        style={{ 
                          background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--accent-color)',
                          fontSize: '1.2rem', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                      >
                        {syncInfo.peerId}
                        {copied ? <CheckCircle2 size={20} color="#81c784" /> : <Copy size={20} color="var(--text-muted)" />}
                      </div>
                    )}
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                      Waiting for connection...
                    </p>
                    <button 
                      className="btn-secondary" 
                      style={{ width: '100%', justifyContent: 'center' }} 
                      onClick={() => syncInfo.disconnect()}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {syncInfo.status === 'connected' && (
                  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(129, 199, 132, 0.2)', border: '2px solid #81c784', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <CheckCircle2 size={32} color="#81c784" />
                    </div>
                    <h3 style={{ color: '#81c784', marginBottom: '0.5rem' }}>Sync Active!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      Connected to: {syncInfo.connectedPeer}
                    </p>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => syncInfo.disconnect()}>
                      Disconnect
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, title }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'var(--accent-gradient)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        border: 'none',
        width: '64px',
        padding: '0.4rem 0',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        cursor: 'pointer',
        boxShadow: active ? 'var(--shadow-glow)' : 'none',
        transition: 'all 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      {label && <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.3px' }}>{label}</span>}
    </motion.button>
  );
}

export default App;
