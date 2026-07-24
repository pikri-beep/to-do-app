import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Target } from 'lucide-react';

export default function Pomodoro() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [tasks, setTasks] = useState([]);

  // Load available tasks from local storage
  useEffect(() => {
    const saved = localStorage.getItem('kanban-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tasks) {
          const taskList = Object.values(parsed.tasks);
          setTasks(taskList);
          if (taskList.length > 0 && !selectedTaskId) {
            setSelectedTaskId(taskList[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load tasks for pomodoro', e);
      }
    }
  }, []);

  // Web Audio API synth for notification chime
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.log('Audio playback error', e);
    }
  };

  // Real OS Desktop Notification trigger
  const sendDesktopNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg'
      });
    }
  };

  const handleSessionComplete = () => {
    playChimeSound();

    if (mode === 'work') {
      sendDesktopNotification('🍅 Pomodoro Complete!', 'Great work! Take a well-deserved short break.');

      // Increment task pomodoro count in local storage
      if (selectedTaskId) {
        try {
          const saved = localStorage.getItem('kanban-data');
          if (saved) {
            const data = JSON.parse(saved);
            if (data.tasks && data.tasks[selectedTaskId]) {
              data.tasks[selectedTaskId].pomodoros = (data.tasks[selectedTaskId].pomodoros || 0) + 1;
              localStorage.setItem('kanban-data', JSON.stringify(data));
              setTasks(Object.values(data.tasks));
            }
          }
        } catch (e) {
          console.error('Failed to update pomodoro count', e);
        }
      }

      setMode('break');
      setTimeLeft(breakDuration * 60);
    } else {
      sendDesktopNotification('🔔 Break Finished!', 'Time to lock back in for your next focus session.');
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, workDuration, breakDuration, selectedTaskId]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const updateWorkDuration = (mins) => {
    setWorkDuration(mins);
    if (mode === 'work' && !isActive) setTimeLeft(mins * 60);
  };

  const updateBreakDuration = (mins) => {
    setBreakDuration(mins);
    if (mode === 'break' && !isActive) setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const totalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div style={{ flex: 1, padding: '0 2rem 2rem 0', display: 'flex', flexDirection: 'column' }}>
      <div className="header" style={{ padding: '2rem 0 1.5rem 0' }}>
        <div>
          <h1>Pomodoro Focus</h1>
          <p>Supercharge your productivity with time boxing</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Task Link Selector */}
        {tasks.length > 0 && (
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Target size={18} color="var(--accent-color)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Focus Task:</span>
            <select 
              value={selectedTaskId} 
              onChange={(e) => setSelectedTaskId(e.target.value)}
              style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '0.95rem', fontFamily: 'Outfit', outline: 'none', cursor: 'pointer' }}
            >
              {tasks.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#12121e', color: 'white' }}>
                  {t.title} (🍅 {t.pomodoros || 0})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => switchMode('work')}
            style={{ 
              background: mode === 'work' ? 'var(--glass-bg)' : 'transparent',
              borderColor: mode === 'work' ? 'var(--accent-color)' : 'var(--glass-border)'
            }}
          >
            Work
          </button>
          <button 
            className="btn-secondary"
            onClick={() => switchMode('break')}
            style={{ 
              background: mode === 'break' ? 'var(--glass-bg)' : 'transparent',
              borderColor: mode === 'break' ? '#81c784' : 'var(--glass-border)'
            }}
          >
            Break
          </button>
        </div>

        {/* Duration Customization Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {mode === 'work' ? (
            [15, 25, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => updateWorkDuration(mins)}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  background: workDuration === mins ? 'var(--accent-gradient)' : 'transparent',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {mins}m
              </button>
            ))
          ) : (
            [5, 10, 15].map(mins => (
              <button
                key={mins}
                onClick={() => updateBreakDuration(mins)}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  background: breakDuration === mins ? '#81c784' : 'transparent',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {mins}m
              </button>
            ))
          )}
        </div>

        {/* Timer Visual */}
        <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle 
              cx="140" cy="140" r="130" 
              fill="transparent" 
              stroke="var(--glass-border)" 
              strokeWidth="8" 
            />
            <circle 
              cx="140" cy="140" r="130" 
              fill="transparent" 
              stroke={mode === 'work' ? 'var(--accent-color)' : '#81c784'} 
              strokeWidth="8" 
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={(2 * Math.PI * 130) * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <motion.div 
              key={`${minutes}:${seconds}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '4.8rem', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1 }}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {mode}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={toggleTimer}
            style={{ 
              width: '72px', height: '72px', borderRadius: '50%', padding: 0, justifyContent: 'center',
              background: isActive ? 'transparent' : 'var(--accent-gradient)',
              border: isActive ? '2px solid var(--glass-border)' : 'none'
            }}
          >
            {isActive ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
          </button>
          
          <button 
            className="btn-icon" 
            onClick={resetTimer}
            style={{ 
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'
            }}
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>

          <button 
            className="btn-icon" 
            onClick={playChimeSound}
            style={{ 
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'
            }}
            title="Test Sound Chime"
          >
            <Volume2 size={20} />
          </button>
        </div>
        
      </div>
    </div>
  );
}
