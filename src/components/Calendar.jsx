import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Plus, Trash2, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_HABITS = [
  { id: 'h1', title: 'Code & Build', color: '#8a2be2' },
  { id: 'h2', title: 'Daily Reading', color: '#60a5fa' },
  { id: 'h3', title: 'Workout / Cardio', color: '#10b981' }
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('multi-habits-list');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [activeHabitId, setActiveHabitId] = useState(() => habits[0]?.id || 'h1');
  
  const [completedDaysMap, setCompletedDaysMap] = useState(() => {
    const saved = localStorage.getItem('multi-habits-records');
    return saved ? JSON.parse(saved) : {};
  });

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  useEffect(() => {
    localStorage.setItem('multi-habits-list', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('multi-habits-records', JSON.stringify(completedDaysMap));
  }, [completedDaysMap]);

  useEffect(() => {
    const handleSync = () => {
      const savedHabits = localStorage.getItem('multi-habits-list');
      if (savedHabits) {
        try {
          setHabits(JSON.parse(savedHabits));
        } catch (e) {
          console.error('Failed to parse synced habits list', e);
        }
      }
      const savedRecords = localStorage.getItem('multi-habits-records');
      if (savedRecords) {
        try {
          setCompletedDaysMap(JSON.parse(savedRecords));
        } catch (e) {
          console.error('Failed to parse synced habits records', e);
        }
      }
    };
    window.addEventListener('sync-data-updated', handleSync);
    return () => window.removeEventListener('sync-data-updated', handleSync);
  }, []);

  const activeHabit = habits.find(h => h.id === activeHabitId) || habits[0];
  const activeRecords = (completedDaysMap && activeHabit) ? (completedDaysMap[activeHabit.id] || []) : [];

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const toggleDay = (day) => {
    if (!activeHabit) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    const habitRecords = completedDaysMap[activeHabit.id] || [];
    
    const updated = habitRecords.includes(dateStr)
      ? habitRecords.filter(d => d !== dateStr)
      : [...habitRecords, dateStr];

    setCompletedDaysMap({
      ...completedDaysMap,
      [activeHabit.id]: updated
    });
  };

  const isCompleted = (day) => activeRecords.includes(format(day, 'yyyy-MM-dd'));

  // Calculate current streak
  const calculateStreak = () => {
    if (!activeRecords || activeRecords.length === 0) return 0;
    const sorted = [...activeRecords].sort().reverse();
    let streak = 0;
    let checkDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (sorted.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not be checked off yet, try yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    const colors = ['#8a2be2', '#60a5fa', '#10b981', '#f43f5e', '#fbbf24'];
    const newH = {
      id: `h-${Date.now()}`,
      title: newHabitTitle.trim(),
      color: colors[habits.length % colors.length]
    };
    setHabits([...habits, newH]);
    setActiveHabitId(newH.id);
    setNewHabitTitle('');
    setIsAddingHabit(false);
  };

  const deleteHabit = (id) => {
    if (habits.length <= 1) return;
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    setActiveHabitId(updated[0].id);
  };

  return (
    <div className="calendar-view" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <div>
          <h1>Habit Tracker</h1>
          <p>Build consistency one day at a time</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        
        {/* Habit Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {habits.map(h => (
              <button
                key={h.id}
                onClick={() => setActiveHabitId(h.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  border: `1px solid ${activeHabitId === h.id ? h.color : 'var(--glass-border)'}`,
                  background: activeHabitId === h.id ? `${h.color}25` : 'transparent',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color }} />
                {h.title}
                {habits.length > 1 && activeHabitId === h.id && (
                  <Trash2 
                    size={14} 
                    style={{ marginLeft: '4px', opacity: 0.6 }} 
                    onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }} 
                  />
                )}
              </button>
            ))}

            <button 
              className="btn-icon" 
              onClick={() => setIsAddingHabit(!isAddingHabit)}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Streak Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
            <Flame size={18} color="#fbbf24" />
            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem' }}>{calculateStreak()} Day Streak</span>
          </div>
        </div>

        {/* New Habit Form */}
        <AnimatePresence>
          {isAddingHabit && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              onSubmit={addHabit}
              style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}
            >
              <input 
                type="text" 
                className="add-task-input" 
                style={{ marginBottom: 0 }}
                placeholder="New habit title..."
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 1.25rem' }}>Add</button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Month Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon" onClick={prevMonth} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <ChevronLeft size={20} />
            </button>
            <button className="btn-icon" onClick={nextMonth} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.85rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
              {day}
            </div>
          ))}
          
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const completed = isCompleted(day);
            const today = isToday(day);
            const activeColor = activeHabit ? activeHabit.color : 'var(--accent-color)';

            return (
              <motion.div 
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleDay(day)}
                style={{
                  aspectRatio: '1',
                  background: completed ? `${activeColor}30` : 'var(--glass-bg)',
                  border: `1px solid ${completed ? activeColor : (today ? 'var(--accent-color)' : 'var(--glass-border)')}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: completed ? `0 0 15px ${activeColor}40` : 'none',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: today ? 'bold' : 'normal', color: today ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                  {format(day, 'd')}
                </span>
                {completed ? (
                  <CheckCircle2 size={16} color={activeColor} style={{ marginTop: '4px' }}/>
                ) : (
                  <Circle size={16} color="var(--text-muted)" style={{ marginTop: '4px' }}/>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
