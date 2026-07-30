import { useState, useEffect } from 'react';

const XP_PER_POMODORO = 50;
const XP_PER_TASK = 20;

export default function useGamification() {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('rpg-game-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse game state', e);
      }
    }
    return {
      level: 1,
      xp: 0,
      maxXp: 100,
      streak: 0,
      lastActive: new Date().toLocaleDateString()
    };
  });

  useEffect(() => {
    localStorage.setItem('rpg-game-state', JSON.stringify(gameState));
    
    // Check streak
    const today = new Date().toLocaleDateString();
    if (gameState.lastActive !== today) {
      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (gameState.lastActive === yesterday.toLocaleDateString()) {
        // Continue streak, just update last active
        setGameState(prev => ({ ...prev, lastActive: today }));
      } else {
        // Reset streak
        setGameState(prev => ({ ...prev, streak: 0, lastActive: today }));
      }
    }
  }, [gameState]);

  const addXp = (amount) => {
    setGameState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newMaxXp * 1.5); // Increase required XP for next level
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        maxXp: newMaxXp
      };
    });
  };

  const completePomodoro = () => addXp(XP_PER_POMODORO);
  const completeTask = () => addXp(XP_PER_TASK);

  return { gameState, addXp, completePomodoro, completeTask };
}
