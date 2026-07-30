import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrateLight, vibrateMedium } from '../utils/haptics';
import QuestLog from './QuestLog';
import Pomodoro from './Pomodoro';
import Calendar from './Calendar';
import Analytics from './Analytics';
import RPGStats from './RPGStats';
import { X, Map } from 'lucide-react';

const MAP_SIZE = 1024;
const CHAR_SIZE = 64;
const SPEED = 6;

const OBJECTS = [
  { id: 'quest', x: 150, y: 150, label: 'Mission Control', width: 100, height: 100, color: '#3b82f6' },
  { id: 'pomodoro', x: 750, y: 150, label: 'Cryo Pod', width: 100, height: 100, color: '#10b981' },
  { id: 'calendar', x: 150, y: 750, label: 'Captain Log', width: 100, height: 100, color: '#f59e0b' },
  { id: 'analytics', x: 750, y: 750, label: 'Holo Core', width: 100, height: 100, color: '#8b5cf6' }
];

export default function GameWorld() {
  const [charPos, setCharPos] = useState({ x: 512, y: 512 });
  const [activeModal, setActiveModal] = useState(null);
  const [direction, setDirection] = useState('down');
  const [isWalking, setIsWalking] = useState(false);
  const [nearbyObj, setNearbyObj] = useState(null);
  const [activeQuests, setActiveQuests] = useState([]);
  
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });
  const frameRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
      if (e.key === 'ArrowUp') keys.current.w = true;
      if (e.key === 'ArrowDown') keys.current.s = true;
      if (e.key === 'ArrowLeft') keys.current.a = true;
      if (e.key === 'ArrowRight') keys.current.d = true;
      if (e.key === ' ' || e.key === 'Enter') keys.current.space = true;
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
      if (e.key === 'ArrowUp') keys.current.w = false;
      if (e.key === 'ArrowDown') keys.current.s = false;
      if (e.key === 'ArrowLeft') keys.current.a = false;
      if (e.key === 'ArrowRight') keys.current.d = false;
      if (e.key === ' ' || e.key === 'Enter') keys.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const loadQuests = () => {
      const saved = localStorage.getItem('quest-data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActiveQuests(parsed.filter(q => !q.completed).slice(0, 3));
        } catch (e) {}
      }
    };
    loadQuests();
    window.addEventListener('sync-data-updated', loadQuests);
    return () => window.removeEventListener('sync-data-updated', loadQuests);
  }, []);

  useEffect(() => {
    const loop = (time) => {
      if (activeModal) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      let dx = 0;
      let dy = 0;
      if (keys.current.w) dy -= SPEED;
      if (keys.current.s) dy += SPEED;
      if (keys.current.a) dx -= SPEED;
      if (keys.current.d) dx += SPEED;

      if (dx !== 0 || dy !== 0) {
        setCharPos(prev => {
          let newX = prev.x + dx;
          let newY = prev.y + dy;
          
          // Map bounds
          newX = Math.max(0, Math.min(MAP_SIZE - CHAR_SIZE, newX));
          newY = Math.max(0, Math.min(MAP_SIZE - CHAR_SIZE, newY));

          // Check interaction proximity
          let foundNearby = null;
          for (let obj of OBJECTS) {
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            const charCX = newX + CHAR_SIZE / 2;
            const charCY = newY + CHAR_SIZE / 2;
            const dist = Math.hypot(centerX - charCX, centerY - charCY);
            if (dist < 100) {
              foundNearby = obj;
              if (dist < 60) {
                newX = prev.x;
                newY = prev.y;
              }
              break;
            }
          }
          setNearbyObj(foundNearby);
          return { x: newX, y: newY };
        });
        
        setIsWalking(true);
        if (dx < 0) setDirection('left');
        else if (dx > 0) setDirection('right');
        else if (dy < 0) setDirection('up');
        else if (dy > 0) setDirection('down');
      } else {
        setIsWalking(false);
      }
      
      if (keys.current.space && nearbyObj && !activeModal) {
        keys.current.space = false;
        vibrateMedium();
        setActiveModal(nearbyObj.id);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [activeModal, nearbyObj]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
      
      {/* HUD Overlay - Top Left */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
          <RPGStats />
        </div>
        
        {/* Mini Quest Log */}
        {activeQuests.length > 0 && (
          <div style={{ background: 'rgba(10, 10, 15, 0.8)', border: '2px solid #555', borderRadius: '8px', padding: '1rem', width: '220px', fontFamily: '"VT323", monospace', color: '#fff', boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.6rem', color: '#f59e0b', margin: 0, marginBottom: '0.75rem' }}>Active Quests</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeQuests.map(q => (
                <li key={q.id} style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: q.type === 'main' ? '#fbbf24' : '#9ca3af', fontSize: '0.9rem' }}>{q.type === 'main' ? '⭐' : '🗡️'}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Camera Viewport */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', background: '#090912' }}>
        {/* Zoom Wrapper */}
        <div style={{ width: '100%', height: '100%', transform: 'scale(2.5)', transformOrigin: 'center center' }}>
          
          {/* Moving Map */}
          <div style={{
          position: 'absolute',
          left: `calc(50% - ${charPos.x}px)`,
          top: `calc(50% - ${charPos.y}px)`,
          width: MAP_SIZE,
          height: MAP_SIZE,
          background: `url(/space_station_map.png) center center / cover no-repeat`,
          transition: 'none' // Handled by RAF loop
        }}>
          {/* Terminals / Interactions */}
          {OBJECTS.map(obj => (
            <div 
              key={obj.id}
              className="material-pulse"
              style={{
                position: 'absolute',
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                border: `2px dashed ${obj.color}`,
                backgroundColor: `${obj.color}33`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {nearbyObj?.id === obj.id && (
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  background: '#fff',
                  color: '#000',
                  padding: '4px 8px',
                  fontFamily: '"VT323", monospace',
                  whiteSpace: 'nowrap',
                  border: '2px solid #000',
                  zIndex: 200
                }}>
                  Space to Access
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Static Hero Character (Centered in viewport) */}
        <div
          className={isWalking ? 'char-walking' : ''}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: CHAR_SIZE,
            height: CHAR_SIZE,
            marginLeft: -CHAR_SIZE / 2,
            marginTop: -CHAR_SIZE / 2,
            backgroundImage: `url(/astronaut_walk.png)`,
            backgroundSize: '256px 256px',
            backgroundPosition: `0px ${
              direction === 'down' ? '0px' : 
              direction === 'left' ? '-64px' : 
              direction === 'right' ? '-128px' : 
              '-192px'
            }`,
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))',
            zIndex: 50,
            imageRendering: 'pixelated'
          }}
        />
        
        </div> {/* End Zoom Wrapper */}
      </div>

      {/* Map Button - Bottom Right */}
      <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 100 }}>
        <button 
          className="btn-primary" 
          onClick={() => setActiveModal('minimap')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', boxShadow: '4px 4px 0px #000', border: '2px solid #fff', borderRadius: '8px' }}
        >
          <Map size={20} /> MAP
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)} style={{ padding: '2rem' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                padding: '2rem'
              }}
            >
              <button 
                onClick={() => setActiveModal(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#ef4444', border: '3px solid #000', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50 }}
              >
                <X size={24} />
              </button>

              {activeModal === 'quest' && <QuestLog />}
              {activeModal === 'pomodoro' && <Pomodoro />}
              {activeModal === 'calendar' && <Calendar />}
              {activeModal === 'analytics' && <Analytics />}
              {activeModal === 'minimap' && (
                <div style={{ color: '#fff', textAlign: 'center', padding: '1rem' }}>
                  <h2 style={{ fontFamily: '"Press Start 2P", monospace', color: 'var(--accent-color)', marginBottom: '1rem', fontSize: '1rem' }}>Station Map</h2>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    <img src="/space_station_map.png" alt="Map" style={{ width: '100%', height: 'auto', display: 'block', border: '4px solid #fff', borderRadius: '8px' }} />
                    
                    {/* Location Labels */}
                    {OBJECTS.map(obj => (
                      <div 
                        key={obj.id}
                        style={{
                          position: 'absolute',
                          left: `${(obj.x + obj.width/2) / MAP_SIZE * 100}%`,
                          top: `${(obj.y + obj.height/2) / MAP_SIZE * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(0,0,0,0.85)',
                          border: `2px solid ${obj.color}`,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: '#fff',
                          fontFamily: '"VT323", monospace',
                          fontSize: '1.2rem',
                          whiteSpace: 'nowrap',
                          boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                          pointerEvents: 'none'
                        }}
                      >
                        📍 {obj.label}
                      </div>
                    ))}

                    {/* Current Player Marker */}
                    <div style={{
                          position: 'absolute',
                          left: `${(charPos.x + CHAR_SIZE/2) / MAP_SIZE * 100}%`,
                          top: `${(charPos.y + CHAR_SIZE/2) / MAP_SIZE * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: '1.5rem',
                          filter: 'drop-shadow(2px 2px 0px #000)',
                          zIndex: 10,
                          pointerEvents: 'none'
                    }}>🚀</div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
