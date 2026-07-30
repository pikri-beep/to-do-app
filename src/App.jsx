import React, { useEffect } from 'react';
import GameWorld from './components/GameWorld';
import { Settings } from 'lucide-react';


export default function App() {
  // Theme check
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-color') || 'rose';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      
      {/* Settings/Info button on the top right */}
      <button 
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          padding: '0.5rem',
          borderRadius: '50%',
          cursor: 'pointer'
        }}
        onClick={() => alert("Settings would go here!")}
      >
        <Settings size={24} />
      </button>

      {/* Main Game Engine */}
      <GameWorld />
      
    </div>
  );
}
