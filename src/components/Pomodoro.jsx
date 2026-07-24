import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or notification here ideally
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calculate progress for the circular indicator
  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div style={{ flex: 1, padding: '0 2rem 2rem 0', display: 'flex', flexDirection: 'column' }}>
      <div className="header" style={{ padding: '2rem 0 1.5rem 0' }}>
        <div>
          <h1>Pomodoro</h1>
          <p>Focus and recharge</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '4rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => switchMode('work')}
            style={{ 
              background: mode === 'work' ? 'var(--glass-bg)' : 'transparent',
              borderColor: mode === 'work' ? 'var(--accent-color)' : 'var(--glass-border)'
            }}
          >
            Work (25m)
          </button>
          <button 
            className="btn-secondary"
            onClick={() => switchMode('break')}
            style={{ 
              background: mode === 'break' ? 'var(--glass-bg)' : 'transparent',
              borderColor: mode === 'break' ? '#81c784' : 'var(--glass-border)'
            }}
          >
            Break (5m)
          </button>
        </div>

        <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
          <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle 
              cx="150" cy="150" r="140" 
              fill="transparent" 
              stroke="var(--glass-border)" 
              strokeWidth="8" 
            />
            <circle 
              cx="150" cy="150" r="140" 
              fill="transparent" 
              stroke={mode === 'work' ? 'var(--accent-color)' : '#81c784'} 
              strokeWidth="8" 
              strokeDasharray={2 * Math.PI * 140}
              strokeDashoffset={(2 * Math.PI * 140) * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <motion.div 
              key={`${minutes}:${seconds}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '5rem', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1 }}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {mode}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button 
            className="btn-primary" 
            onClick={toggleTimer}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', padding: 0, justifyContent: 'center',
              background: isActive ? 'transparent' : 'var(--accent-gradient)',
              border: isActive ? '2px solid var(--glass-border)' : 'none'
            }}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '4px' }} />}
          </button>
          
          <button 
            className="btn-icon" 
            onClick={resetTimer}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'
            }}
          >
            <RotateCcw size={24} />
          </button>
        </div>
        
      </div>
    </div>
  );
}
