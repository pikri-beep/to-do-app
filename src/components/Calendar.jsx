import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Plus, Trash2, Flame, Calendar as CalendarIcon, CheckSquare, Square, Clock, Tag, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrateSuccess, vibrateLight } from '../utils/haptics';

const DEFAULT_HABITS = [
  { id: 'h1', title: 'Code & Build', color: '#8a2be2' },
  { id: 'h2', title: 'Daily Reading', color: '#60a5fa' },
  { id: 'h3', title: 'Workout / Cardio', color: '#10b981' }
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('multi-habits-list');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [activeHabitId, setActiveHabitId] = useState(() => habits[0]?.id || 'h1');
  
  const [completedDaysMap, setCompletedDaysMap] = useState(() => {
    const saved = localStorage.getItem('multi-habits-records');
    return saved ? JSON.parse(saved) : {};
  });

  const [kanbanData, setKanbanData] = useState(() => {
    const saved = localStorage.getItem('kanban-data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { tasks: {}, columns: { todo: { taskIds: [] }, inprogress: { taskIds: [] }, done: { taskIds: [] } }, columnOrder: ['todo', 'inprogress', 'done'] };
  });

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const isRemoteUpdateRef = useRef(false);

  // Sync Kanban data updates
  const loadKanbanData = () => {
    const saved = localStorage.getItem('kanban-data');
    if (saved) {
      try {
        setKanbanData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse kanban data for calendar', e);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('local-data-changed', loadKanbanData);
    window.addEventListener('sync-data-updated', loadKanbanData);
    return () => {
      window.removeEventListener('local-data-changed', loadKanbanData);
      window.removeEventListener('sync-data-updated', loadKanbanData);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('multi-habits-list', JSON.stringify(habits));
    if (!isRemoteUpdateRef.current) {
      window.dispatchEvent(new CustomEvent('local-data-changed'));
    }
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('multi-habits-records', JSON.stringify(completedDaysMap));
    if (!isRemoteUpdateRef.current) {
      window.dispatchEvent(new CustomEvent('local-data-changed'));
    }
  }, [completedDaysMap]);

  useEffect(() => {
    const handleSync = () => {
      isRemoteUpdateRef.current = true;
      const savedHabits = localStorage.getItem('multi-habits-list');
      if (savedHabits) {
        try { setHabits(JSON.parse(savedHabits)); } catch (e) { console.error(e); }
      }
      const savedRecords = localStorage.getItem('multi-habits-records');
      if (savedRecords) {
        try { setCompletedDaysMap(JSON.parse(savedRecords)); } catch (e) { console.error(e); }
      }
      loadKanbanData();
      setTimeout(() => { isRemoteUpdateRef.current = false; }, 50);
    };
    window.addEventListener('sync-data-updated', handleSync);
    return () => window.removeEventListener('sync-data-updated', handleSync);
  }, []);

  const activeHabit = habits.find(h => h.id === activeHabitId) || habits[0];
  const activeRecords = (completedDaysMap && activeHabit) ? (completedDaysMap[activeHabit.id] || []) : [];

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const toggleDay = (day) => {
    if (!activeHabit) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    const habitRecords = completedDaysMap[activeHabit.id] || [];
    const isAdding = !habitRecords.includes(dateStr);
    
    if (isAdding) {
      vibrateSuccess();
    } else {
      vibrateLight();
    }

    const updated = habitRecords.includes(dateStr)
      ? habitRecords.filter(d => d !== dateStr)
      : [...habitRecords, dateStr];

    setCompletedDaysMap({
      ...completedDaysMap,
      [activeHabit.id]: updated
    });
  };

  const isCompleted = (day) => activeRecords.includes(format(day, 'yyyy-MM-dd'));

  // Calculate current streak for active habit
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

  // Extract tasks due on a specific date
  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!kanbanData || !kanbanData.tasks) return [];
    
    const tasks = [];
    Object.values(kanbanData.tasks).forEach(task => {
      if (task.dueDate === dateStr) {
        // find task column
        let columnId = 'todo';
        if (kanbanData.columns) {
          for (const [colId, col] of Object.entries(kanbanData.columns)) {
            if (col.taskIds && col.taskIds.includes(task.id)) {
              columnId = colId;
              break;
            }
          }
        }
        tasks.push({ ...task, columnId });
      }
    });
    return tasks;
  };

  // Toggle task completed state (move between done and todo)
  const toggleTaskDone = (task) => {
    vibrateLight();
    const currentData = { ...kanbanData };
    const currentCol = task.columnId;
    const targetCol = currentCol === 'done' ? 'todo' : 'done';

    // Remove from current col
    if (currentData.columns[currentCol]) {
      currentData.columns[currentCol].taskIds = currentData.columns[currentCol].taskIds.filter(id => id !== task.id);
    }
    // Add to target col
    if (!currentData.columns[targetCol]) {
      currentData.columns[targetCol] = { id: targetCol, title: targetCol === 'done' ? 'Done' : 'To Do', taskIds: [] };
    }
    currentData.columns[targetCol].taskIds.push(task.id);

    setKanbanData(currentData);
    localStorage.setItem('kanban-data', JSON.stringify(currentData));
    window.dispatchEvent(new CustomEvent('local-data-changed'));
  };

  // Add a task due on the selected date
  const handleAddNewTaskForDate = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    vibrateLight();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title: newTaskTitle.trim(),
      description: '',
      tag: 'work',
      dueDate: dateStr,
      pomodoros: 0,
      subtasks: []
    };

    const currentData = { ...kanbanData };
    if (!currentData.tasks) currentData.tasks = {};
    currentData.tasks[newTaskId] = newTask;

    if (!currentData.columns.todo) {
      currentData.columns.todo = { id: 'todo', title: 'To Do', taskIds: [] };
    }
    currentData.columns.todo.taskIds.push(newTaskId);

    setKanbanData(currentData);
    localStorage.setItem('kanban-data', JSON.stringify(currentData));
    window.dispatchEvent(new CustomEvent('local-data-changed'));
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const selectedDateTasks = getTasksForDate(selectedDate);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const activeHabitCompletedOnSelectedDate = activeRecords.includes(selectedDateStr);

  return (
    <div className="calendar-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* View Header */}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.8rem', background: 'linear-gradient(to right, var(--accent-color), #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <div style={{ padding: '8px', background: 'rgba(138,43,226,0.15)', borderRadius: '12px', display: 'flex', boxShadow: '0 0 15px rgba(138,43,226,0.3)' }}>
              <CalendarIcon size={28} color="var(--accent-color)" />
            </div>
            Schedule & Habits
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>Unified view of habit streaks and scheduled task deadlines</p>
        </div>
        <button 
          onClick={goToToday} 
          className="btn-primary" 
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Clock size={16} /> Jump to Today
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Habit Selector Pills & Streak Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>Habit:</span>
            {habits.map(h => (
              <motion.button
                key={h.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { vibrateLight(); setActiveHabitId(h.id); }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '14px',
                  border: `1px solid ${activeHabitId === h.id ? h.color : 'var(--glass-border)'}`,
                  background: activeHabitId === h.id ? `linear-gradient(135deg, ${h.color}30, ${h.color}10)` : 'rgba(255,255,255,0.03)',
                  boxShadow: activeHabitId === h.id ? `0 0 12px ${h.color}40` : 'none',
                  color: activeHabitId === h.id ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: h.color, boxShadow: `0 0 8px ${h.color}` }} />
                {h.title}
                {habits.length > 1 && activeHabitId === h.id && (
                  <Trash2 
                    size={13} 
                    style={{ marginLeft: '4px', opacity: 0.6 }} 
                    onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }} 
                  />
                )}
              </motion.button>
            ))}

            <button 
              className="btn-icon" 
              onClick={() => setIsAddingHabit(!isAddingHabit)}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.4rem' }}
              title="Add Habit"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Streak Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.3) 100%)', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '0.4rem 1.2rem', borderRadius: '20px', boxShadow: '0 0 15px rgba(251,191,36,0.15)' }}
          >
            <Flame size={20} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.5))' }} />
            <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{calculateStreak()} Day Streak</span>
          </motion.div>
        </div>

        {/* New Habit Form */}
        <AnimatePresence>
          {isAddingHabit && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              onSubmit={addHabit}
              style={{ display: 'flex', gap: '0.75rem' }}
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
              <button type="submit" className="btn-primary" style={{ padding: '0 1.25rem' }}>Add Habit</button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Month Navigation Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon" onClick={prevMonth} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <ChevronLeft size={18} />
            </button>
            <button className="btn-icon" onClick={nextMonth} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Unified Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.65rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', paddingBottom: '0.2rem' }}>
              {day}
            </div>
          ))}
          
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const completed = isCompleted(day);
            const today = isToday(day);
            const selected = isSameDay(day, selectedDate);
            const dayTasks = getTasksForDate(day);
            const activeColor = activeHabit ? activeHabit.color : 'var(--accent-color)';

            return (
              <motion.div 
                key={day.toISOString()}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  vibrateLight();
                  setSelectedDate(day);
                }}
                style={{
                  minHeight: '80px',
                  padding: '0.5rem',
                  background: completed ? `linear-gradient(135deg, ${activeColor}25, ${activeColor}10)` : (selected ? 'rgba(255,255,255,0.08)' : 'var(--glass-bg)'),
                  border: selected ? '2px solid var(--accent-color)' : (completed ? `1px solid ${activeColor}80` : (today ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)')),
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: selected ? `0 0 12px var(--accent-color)` : (completed ? `0 0 10px ${activeColor}30` : 'none'),
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {/* Date Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: today ? 800 : 600, 
                    color: today ? 'var(--accent-color)' : (completed ? 'white' : 'var(--text-primary)'),
                    background: today ? 'rgba(138,43,226,0.2)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    boxShadow: today ? '0 0 8px rgba(138,43,226,0.4)' : 'none'
                  }}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Habit Check Indicator */}
                  <motion.span 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDay(day);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    title={completed ? 'Habit Done' : 'Click to complete habit'}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    {completed ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <CheckCircle2 size={18} color={activeColor} style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }} />
                      </motion.div>
                    ) : (
                      <Circle size={18} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                    )}
                  </motion.span>
                </div>

                {/* Task Indicators */}
                {dayTasks.length > 0 && (
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '2px' }}>
                    {dayTasks.slice(0, 3).map((task, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: task.columnId === 'done' ? '#10b981' : (task.columnId === 'inprogress' ? '#fbbf24' : '#60a5fa'),
                          boxShadow: `0 0 4px ${task.columnId === 'done' ? '#10b981' : (task.columnId === 'inprogress' ? '#fbbf24' : '#60a5fa')}`
                        }}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '2px', fontWeight: 700 }}>+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer */}
      <motion.div 
        className="glass-panel" 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent-color)" /> Agenda for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isToday(selectedDate) ? 'Today' : 'Selected Date'} Overview
            </p>
          </div>

          {/* Habit quick toggle for selected date */}
          {activeHabit && (
            <button
              onClick={() => toggleDay(selectedDate)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${activeHabitCompletedOnSelectedDate ? activeHabit.color : 'var(--glass-border)'}`,
                background: activeHabitCompletedOnSelectedDate ? `${activeHabit.color}25` : 'transparent',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {activeHabitCompletedOnSelectedDate ? <CheckCircle2 size={16} color={activeHabit.color} /> : <Circle size={16} color="var(--text-muted)" />}
              {activeHabit.title}: {activeHabitCompletedOnSelectedDate ? 'Completed' : 'Mark Done'}
            </button>
          )}
        </div>

        {/* Task List for Selected Date */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ListTodo size={16} /> Scheduled Tasks ({selectedDateTasks.length})
            </h4>
            <button 
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="btn-icon" 
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          {/* Quick Add Task Form */}
          <AnimatePresence>
            {isAddingTask && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddNewTaskForDate}
                style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}
              >
                <input 
                  type="text" 
                  className="add-task-input" 
                  style={{ marginBottom: 0 }}
                  placeholder={`Task for ${format(selectedDate, 'MMM d')}...`}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 1rem', fontSize: '0.85rem' }}>Schedule</button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Task Items */}
          {selectedDateTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No tasks scheduled for this date. Click "+ Add Task" to schedule one!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {selectedDateTasks.map(task => {
                const isDone = task.columnId === 'done';
                const colLabel = task.columnId === 'done' ? 'Done' : (task.columnId === 'inprogress' ? 'In Progress' : 'To Do');
                const colBadgeColor = task.columnId === 'done' ? '#10b981' : (task.columnId === 'inprogress' ? '#fbbf24' : '#60a5fa');

                return (
                  <div 
                    key={task.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <button 
                        onClick={() => toggleTaskDone(task)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isDone ? '#10b981' : 'var(--text-muted)' }}
                      >
                        {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {task.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {task.tag && (
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          background: 'rgba(255,255,255,0.06)', 
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Tag size={10} /> {task.tag}
                        </span>
                      )}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        background: `${colBadgeColor}20`,
                        border: `1px solid ${colBadgeColor}40`,
                        color: colBadgeColor
                      }}>
                        {colLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

