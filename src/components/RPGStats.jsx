import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sword } from 'lucide-react';
import useGamification from '../hooks/useGamification';

export default function RPGStats() {
  const { gameState } = useGamification();
  const { level, xp, maxXp, streak } = gameState;
  
  const xpPercentage = Math.min(100, Math.max(0, (xp / maxXp) * 100));

  return (
    <div style={{
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      marginBottom: '2rem',
      fontFamily: '"Press Start 2P", monospace',
      flexWrap: 'wrap',
      backgroundColor: '#1a1a24',
      border: '4px solid #fff',
      boxShadow: '6px 6px 0px #000',
      color: '#fff'
    }}>
      {/* Level Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'var(--accent-color)',
          border: '4px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '1.5rem',
          textShadow: '2px 2px 0px #000'
        }}>
          L{level}
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Hero Rank</div>
          <div style={{ fontSize: '1rem', color: '#fff' }}>Pixel Master</div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
          <span>EXP</span>
          <span>{xp} / {maxXp}</span>
        </div>
        <div style={{
          width: '100%',
          height: '16px',
          background: '#000',
          border: '2px solid #555',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.5)'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
            style={{
              height: '100%',
              background: 'var(--accent-color)',
              borderRight: '2px solid #000'
            }}
          />
        </div>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb703' }}>
        <Flame size={24} fill={streak > 0 ? '#ffb703' : 'transparent'} strokeWidth={2.5} />
        <span style={{ fontSize: '1.25rem', textShadow: '2px 2px 0px #000' }}>{streak} Day</span>
      </div>
    </div>
  );
}
