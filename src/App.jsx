import React, { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Timer } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('kanban');



  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div style={{
        width: '80px',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
        gap: '2rem'
      }}>
        <div>
          <NavItem icon={<LayoutDashboard />} active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} />
        </div>
        <div>
          <NavItem icon={<CalendarDays />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        </div>
        <div>
          <NavItem icon={<Timer />} active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        


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
                  <p>Your beautiful space for getting things done.</p>
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

function NavItem({ icon, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        background: active ? 'var(--accent-gradient)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        border: 'none',
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: active ? 'var(--shadow-glow)' : 'none',
        transition: 'color 0.2s ease',
      }}
    >
      {icon}
    </motion.button>
  );
}

export default App;
