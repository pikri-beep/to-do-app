import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('habit-tracker');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('habit-tracker', JSON.stringify(completedDays));
  }, [completedDays]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const toggleDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setCompletedDays(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const isCompleted = (day) => completedDays.includes(format(day, 'yyyy-MM-dd'));

  return (
    <div className="calendar-view" style={{ flex: 1, padding: '0 2rem 2rem 0', display: 'flex', flexDirection: 'column' }}>
      <div className="header" style={{ padding: '2rem 0 1.5rem 0' }}>
        <div>
          <h1>Habit Tracker</h1>
          <p>{format(currentDate, 'MMMM yyyy')}</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {day}
            </div>
          ))}
          
          {/* Empty cells for start of month offset */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day, i) => {
            const completed = isCompleted(day);
            const today = isToday(day);
            return (
              <motion.div 
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleDay(day)}
                style={{
                  aspectRatio: '1',
                  background: completed ? 'rgba(138, 43, 226, 0.2)' : 'var(--glass-bg)',
                  border: `1px solid ${completed ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: completed ? 'var(--shadow-glow)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: today ? 'bold' : 'normal', color: today ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                  {format(day, 'd')}
                </span>
                {completed ? <CheckCircle2 size={16} color="var(--accent-color)" style={{ marginTop: '4px' }}/> : <Circle size={16} color="var(--text-muted)" style={{ marginTop: '4px' }}/>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
