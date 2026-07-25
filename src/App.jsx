import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Timer, Palette, Bell, BellOff, Smartphone, Copy, CheckCircle2, Radio, X, Settings } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import useSync from './hooks/useSync';
import { vibrateLight, vibrateMedium, vibrateSuccess, vibrateAlarm, getHapticSettings, saveHapticSettings } from './utils/haptics';

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hapticSettings, setHapticSettingsState] = useState(getHapticSettings);
  const [syncInput, setSyncInput] = useState('');
  const [copied, setCopied] = useState(false);

  const updateHaptics = (newSettings) => {
    setHapticSettingsState(newSettings);
    saveHapticSettings(newSettings);
  };

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

  const handleTabChange = (tab) => {
    vibrateLight();
    setActiveTab(tab);
  };

  const cycleTheme = () => {
    vibrateLight();
    const themes = ['violet', 'cyan', 'emerald', 'rose'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  return (
    <div className="app-container">
      {/* Sidebar / Mobile Bottom Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-nav-group">
          <NavItem icon={<LayoutDashboard size={22} />} label="Board" active={activeTab === 'kanban'} onClick={() => handleTabChange('kanban')} title="Task Kanban Board" />
          <NavItem icon={<CalendarDays size={22} />} label="Habits" active={activeTab === 'calendar'} onClick={() => handleTabChange('calendar')} title="Multi-Habit Tracker" />
          <NavItem icon={<Timer size={22} />} label="Focus" active={activeTab === 'pomodoro'} onClick={() => handleTabChange('pomodoro')} title="Pomodoro Timer" />
        </div>

        {/* Bottom Actions: Sync & Settings */}
        <div className="sidebar-nav-group sidebar-bottom-group">
          <NavItem 
            icon={<Smartphone size={20} color={syncInfo.status === 'connected' ? '#81c784' : 'var(--text-muted)'} />} 
            label="Sync" 
            active={showSyncModal} 
            onClick={() => { vibrateLight(); setShowSyncModal(true); }} 
            title="Link Devices (WebRTC Sync)" 
          />
          <NavItem 
            icon={<Settings size={22} color={showSettingsModal ? "white" : "var(--text-muted)"} />} 
            label="Settings" 
            active={showSettingsModal} 
            onClick={() => { vibrateLight(); setShowSettingsModal(true); }} 
            title="App Settings (Theme, Haptics, Alerts)" 
          />
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
                className="modal-content glass-panel" 
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{ maxWidth: '440px', padding: '1.75rem', textAlign: 'center', position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Smartphone size={22} color="var(--accent-color)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Link Devices</h3>
                  </div>
                  <button className="btn-icon" onClick={() => setShowSyncModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  Sync your tasks and habits across phone and desktop instantly and securely.
                </p>

                {syncInfo.status === 'disconnected' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
                      <h4 style={{ marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>Option 1: Host Data</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>Generate a 4-word phrase on this device, then enter it on your other device.</p>
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => syncInfo.hostSync()}>
                        Generate Phrase
                      </button>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
                      <h4 style={{ marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>Option 2: Connect</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>Enter the 4-word phrase generated on your other device.</p>
                      <input 
                        type="text" 
                        placeholder="e.g. apple-horse-blue-tree"
                        className="add-task-input"
                        value={syncInput}
                        onChange={e => setSyncInput(e.target.value)}
                        style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '0.85rem' }}
                      />
                      <button 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', background: '#81c784', color: '#000', fontSize: '0.85rem' }} 
                        onClick={() => syncInfo.connectToHost(syncInput)}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                )}

                {(syncInfo.status === 'hosting' || syncInfo.status === 'connecting') && (
                  <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
                      {syncInfo.status === 'hosting' ? 'Your Sync Code' : 'Connecting...'}
                    </h4>
                    
                    {syncInfo.peerId && (
                      <div 
                        onClick={copyHostCode}
                        style={{ 
                          background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '12px', border: '1px dashed var(--accent-color)',
                          fontSize: '1.1rem', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem'
                        }}
                      >
                        {syncInfo.peerId}
                        {copied ? <CheckCircle2 size={18} color="#81c784" /> : <Copy size={18} color="var(--text-muted)" />}
                      </div>
                    )}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                      Waiting for device connection...
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
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(129, 199, 132, 0.2)', border: '2px solid #81c784', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <CheckCircle2 size={26} color="#81c784" />
                    </div>
                    <h4 style={{ color: '#81c784', marginBottom: '0.3rem', fontSize: '1rem' }}>Sync Active!</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
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

          {/* Unified Settings Modal */}
          {showSettingsModal && (
            <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content glass-panel"
                style={{ maxWidth: '520px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.6rem', borderRadius: '14px', background: 'var(--accent-gradient)', display: 'flex' }}>
                      <Settings size={22} color="white" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customize theme, haptics & daily alerts</p>
                    </div>
                  </div>
                  <button className="btn-icon" onClick={() => setShowSettingsModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                  {/* Section 1: Theme & Color Accent */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Palette size={18} color="var(--accent-color)" />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>App Theme</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                      {[
                        { id: 'violet', label: 'Violet', color: '#8a2be2' },
                        { id: 'cyan', label: 'Cyan', color: '#06b6d4' },
                        { id: 'emerald', label: 'Emerald', color: '#10b981' },
                        { id: 'rose', label: 'Rose', color: '#f43f5e' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            vibrateLight();
                            setTheme(t.id);
                            localStorage.setItem('app-theme', t.id);
                          }}
                          style={{
                            padding: '0.6rem 0.4rem',
                            borderRadius: '12px',
                            border: theme === t.id ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                            background: theme === t.id ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.color, border: '2px solid rgba(255,255,255,0.8)' }} />
                          <span style={{ fontSize: '0.75rem', color: theme === t.id ? 'white' : 'var(--text-muted)', fontWeight: theme === t.id ? 600 : 400 }}>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Haptics & Vibration */}
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Radio size={18} color="var(--accent-color)" />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tactile Haptics</h3>
                    </div>

                    {/* Master Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Haptic Vibrations</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vibration feedback on phone taps & alerts</span>
                      </div>
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          const updated = { ...hapticSettings, enabled: !hapticSettings.enabled };
                          updateHaptics(updated);
                          if (updated.enabled) vibrateLight();
                        }}
                        style={{ 
                          background: hapticSettings.enabled ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                          color: 'white',
                          borderColor: hapticSettings.enabled ? 'var(--accent-color)' : 'var(--glass-border)',
                          padding: '0.35rem 0.9rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        {hapticSettings.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {hapticSettings.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Intensity Selector */}
                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Vibration Intensity</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            {['soft', 'medium', 'strong'].map((level) => (
                              <button
                                key={level}
                                onClick={() => {
                                  const updated = { ...hapticSettings, intensity: level };
                                  updateHaptics(updated);
                                  vibrateMedium();
                                }}
                                style={{
                                  padding: '0.45rem',
                                  borderRadius: '8px',
                                  border: hapticSettings.intensity === level ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
                                  background: hapticSettings.intensity === level ? 'rgba(138, 43, 226, 0.25)' : 'rgba(0,0,0,0.15)',
                                  color: hapticSettings.intensity === level ? 'white' : 'var(--text-muted)',
                                  textTransform: 'capitalize',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  fontWeight: hapticSettings.intensity === level ? 600 : 400
                                }}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Feature Toggles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          <ToggleItem 
                            title="Touch & Drag Ticks"
                            sub="Vibrate on card drag & button clicks"
                            checked={hapticSettings.vibrateOnTouch}
                            onToggle={() => {
                              const updated = { ...hapticSettings, vibrateOnTouch: !hapticSettings.vibrateOnTouch };
                              updateHaptics(updated);
                              if (updated.vibrateOnTouch) vibrateLight();
                            }}
                          />
                          <ToggleItem 
                            title="Task & Habit Pulse"
                            sub="Success vibration when checking off items"
                            checked={hapticSettings.vibrateOnSuccess}
                            onToggle={() => {
                              const updated = { ...hapticSettings, vibrateOnSuccess: !hapticSettings.vibrateOnSuccess };
                              updateHaptics(updated);
                              if (updated.vibrateOnSuccess) vibrateSuccess();
                            }}
                          />
                          <ToggleItem 
                            title="Break Reminder Alarm"
                            sub="Rhythmic alert when timers end"
                            checked={hapticSettings.vibrateOnAlarm}
                            onToggle={() => {
                              const updated = { ...hapticSettings, vibrateOnAlarm: !hapticSettings.vibrateOnAlarm };
                              updateHaptics(updated);
                              if (updated.vibrateOnAlarm) vibrateAlarm();
                            }}
                          />
                        </div>

                        {/* Live Test Vibrations */}
                        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>⚡ Test Vibration Patterns</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem', justifyContent: 'center' }} onClick={vibrateLight}>
                              Soft Tap
                            </button>
                            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem', justifyContent: 'center' }} onClick={vibrateSuccess}>
                              Success
                            </button>
                            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem', justifyContent: 'center' }} onClick={vibrateAlarm}>
                              Alarm Pulse
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Desktop & Native Alerts */}
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Bell size={18} color="var(--accent-color)" />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Daily Alerts & Notifications</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Desktop / Mobile Notifications</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {notifPermission === 'granted' ? 'Active & Ready' : 'Disabled'}
                        </span>
                      </div>
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          vibrateLight();
                          toggleNotifications();
                        }}
                        style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }}
                      >
                        {notifPermission === 'granted' ? 'Test Alert' : 'Enable'}
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToggleItem({ title, sub, checked, onToggle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</span>
      </div>
      <button 
        onClick={onToggle}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '12px',
          background: checked ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
          padding: '2px'
        }}
      >
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: 'white',
          transform: checked ? 'translateX(18px)' : 'translateX(0px)',
          transition: 'transform 0.2s ease'
        }} />
      </button>
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
