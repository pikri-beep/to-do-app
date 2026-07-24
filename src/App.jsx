import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Timer, Palette, Bell, BellOff } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'violet';
  });
  const [notifPermission, setNotifPermission] = useState(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleNotifications = async () => {
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
  };

  const cycleTheme = () => {
    const themes = ['violet', 'cyan', 'emerald', 'rose'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  return (
    <div className="app-container">
      {/* Sidebar / Mobile Bottom Navigation */}
      <div className="sidebar-nav" style={{
        width: '90px',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem 0',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', alignItems: 'center' }}>
          <NavItem icon={<LayoutDashboard size={22} />} label="Board" active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} title="Task Kanban Board" />
          <NavItem icon={<CalendarDays size={22} />} label="Habits" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} title="Multi-Habit Tracker" />
          <NavItem icon={<Timer size={22} />} label="Focus" active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} title="Pomodoro Timer" />
        </div>

        {/* Bottom Actions: Theme & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
          <NavItem 
            icon={notifPermission === 'granted' ? <Bell size={20} color="var(--accent-color)" /> : <BellOff size={20} />} 
            label="Alerts"
            active={notifPermission === 'granted'} 
            onClick={toggleNotifications} 
            title={notifPermission === 'granted' ? 'Daily Reminders Active (Click to test)' : 'Click to enable Daily Desktop Reminders'} 
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
              style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '2rem' }}
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
              style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '2rem' }}
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
              style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '2rem' }}
            >
              <Pomodoro />
            </motion.div>
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
        padding: '0.5rem 0',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        cursor: 'pointer',
        boxShadow: active ? 'var(--shadow-glow)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {icon}
      {label && <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.3px' }}>{label}</span>}
    </motion.button>
  );
}

export default App;
