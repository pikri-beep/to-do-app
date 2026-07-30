import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrateLight, vibrateMedium, vibrateSuccess } from '../utils/haptics';
import useGamification from '../hooks/useGamification';
import { Clock, ShieldAlert, Shield, Trash2, CheckSquare, Square } from 'lucide-react';

export default function QuestLog() {
  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem('quest-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse quest data', e);
      }
    }
    return [];
  });

  const { completeTask } = useGamification();

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('main'); // 'main' or 'side'
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    localStorage.setItem('quest-data', JSON.stringify(quests));
    // Trigger event for Pomodoro to read tasks if needed
    window.dispatchEvent(new CustomEvent('sync-data-updated'));
  }, [quests]);

  const handleAddQuest = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    vibrateLight();
    const newQuest = {
      id: `quest-${Date.now()}`,
      title: newTitle,
      type: newType,
      timeBlock: newTime,
      completed: false,
      date: new Date().toLocaleDateString(),
      pomodoros: 0
    };

    setQuests(prev => [newQuest, ...prev]);
    setNewTitle('');
    setNewTime('');
  };

  const handleToggleQuest = (id) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        if (!q.completed) {
          vibrateSuccess();
          completeTask(); // Award XP
        } else {
          vibrateMedium();
        }
        return { ...q, completed: !q.completed };
      }
      return q;
    }));
  };

  const handleDeleteQuest = (id) => {
    vibrateMedium();
    setQuests(prev => prev.filter(q => q.id !== id));
  };

  // Grouping
  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  // Sorting: Main quests first, then sort by time if available
  const sortQuests = (questList) => {
    return questList.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'main' ? -1 : 1;
      }
      if (a.timeBlock && b.timeBlock) {
        return a.timeBlock.localeCompare(b.timeBlock);
      }
      if (a.timeBlock) return -1;
      if (b.timeBlock) return 1;
      return 0;
    });
  };

  const sortedActive = sortQuests([...activeQuests]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
      
      {/* Input Form */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem', color: 'var(--accent-color)', marginBottom: '1.5rem' }}>
          Assign New Quest
        </h2>
        <form onSubmit={handleAddQuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="What needs to be done, hero?" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="add-task-input"
            style={{ marginBottom: 0 }}
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select 
              value={newType} 
              onChange={e => setNewType(e.target.value)}
              className="add-task-input"
              style={{ flex: 1, marginBottom: 0, cursor: 'pointer' }}
            >
              <option value="main">⭐ Main Quest (High Priority)</option>
              <option value="side">🗡️ Side Quest (Low Priority)</option>
            </select>
            
            <input 
              type="time" 
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="add-task-input"
              style={{ flex: 1, marginBottom: 0, cursor: 'pointer' }}
            />
            
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Accept Quest
            </button>
          </div>
        </form>
      </div>

      {/* Quest List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Active Quests */}
        <div>
          <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--accent-color)" /> Active Quests ({sortedActive.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence>
              {sortedActive.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--text-muted)', fontFamily: '"VT323", monospace', fontSize: '1.25rem' }}>
                  No active quests. Time to rest or find a new adventure!
                </motion.div>
              )}
              {sortedActive.map(quest => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  onToggle={() => handleToggleQuest(quest.id)} 
                  onDelete={() => handleDeleteQuest(quest.id)} 
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div style={{ opacity: 0.7 }}>
            <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Completed ({completedQuests.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <AnimatePresence>
                {completedQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onToggle={() => handleToggleQuest(quest.id)} 
                    onDelete={() => handleDeleteQuest(quest.id)} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function QuestCard({ quest, onToggle, onDelete }) {
  const isMain = quest.type === 'main';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel"
      style={{ 
        padding: '1rem 1.25rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        borderLeft: `4px solid ${isMain ? 'var(--accent-color)' : '#81c784'}`,
        textDecoration: quest.completed ? 'line-through' : 'none',
        opacity: quest.completed ? 0.7 : 1
      }}
    >
      {/* Checkbox */}
      <button 
        onClick={onToggle}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          color: quest.completed ? '#81c784' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}
      >
        {quest.completed ? <CheckSquare size={28} /> : <Square size={28} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h3 style={{ 
          fontFamily: '"Press Start 2P", monospace', 
          fontSize: '0.8rem', 
          color: quest.completed ? 'var(--text-muted)' : 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.4
        }}>
          {quest.title}
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: isMain ? 'var(--accent-color)' : '#81c784', fontSize: '1rem' }}>
            {isMain ? 'Main Quest' : 'Side Quest'}
          </span>
          {quest.timeBlock && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} /> {quest.timeBlock}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <button 
        onClick={onDelete}
        className="btn-icon"
        style={{ color: '#ef4444' }}
        title="Abandon Quest"
      >
        <Trash2 size={20} />
      </button>
    </motion.div>
  );
}
