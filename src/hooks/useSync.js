import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';

// 4-word phrase dictionaries for easy typing
const words = ['apple', 'horse', 'blue', 'tree', 'sun', 'moon', 'star', 'fire', 'water', 'earth', 'wind', 'cloud', 'bird', 'fish', 'lion', 'bear', 'tiger', 'wolf', 'fox', 'deer', 'cat', 'dog', 'mouse', 'rabbit', 'snake', 'frog', 'toad', 'bug', 'ant', 'bee', 'fly', 'moth', 'spider', 'crab', 'clam', 'snail', 'worm', 'rock', 'sand', 'dirt', 'mud', 'clay', 'dust', 'ash', 'smoke', 'steam', 'ice', 'snow', 'rain', 'hail', 'fog', 'dew', 'frost', 'storm', 'wind', 'wave', 'tide', 'river', 'lake', 'pond', 'pool', 'sea', 'ocean', 'gulf', 'bay', 'cove', 'cape', 'isle', 'island', 'reef', 'bank', 'shoal', 'marsh', 'swamp', 'bog', 'fen', 'moor', 'heath', 'plain', 'field', 'meadow', 'pasture', 'park', 'garden', 'yard', 'lawn', 'plot', 'tract', 'farm', 'ranch', 'estate', 'manor', 'villa', 'house', 'home', 'hut', 'tent', 'camp', 'fort', 'base', 'post', 'station'];

const generatePhrase = () => {
  const getW = () => words[Math.floor(Math.random() * words.length)];
  return `${getW()}-${getW()}-${getW()}-${getW()}`;
};

export default function useSync() {
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState('disconnected'); // 'disconnected', 'hosting', 'connecting', 'connected'
  const [connectedPeer, setConnectedPeer] = useState('');
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const isRemoteProcessingRef = useRef(false);

  const broadcastState = useCallback(() => {
    if (connRef.current && connRef.current.open) {
      const payload = {
        'kanban-data': localStorage.getItem('kanban-data'),
        'multi-habits-list': localStorage.getItem('multi-habits-list'),
        'multi-habits-records': localStorage.getItem('multi-habits-records')
      };
      connRef.current.send({ type: 'sync', payload });
    }
  }, []);

  const handleIncomingData = useCallback((data) => {
    try {
      if (data.type === 'sync') {
        isRemoteProcessingRef.current = true;
        const payload = data.payload;
        let updated = false;
        if (payload['kanban-data']) {
          localStorage.setItem('kanban-data', payload['kanban-data']);
          updated = true;
        }
        if (payload['multi-habits-list']) {
          localStorage.setItem('multi-habits-list', payload['multi-habits-list']);
          updated = true;
        }
        if (payload['multi-habits-records']) {
          localStorage.setItem('multi-habits-records', payload['multi-habits-records']);
          updated = true;
        }
        if (updated) {
          window.dispatchEvent(new CustomEvent('sync-data-updated', { detail: payload }));
        }
        setTimeout(() => {
          isRemoteProcessingRef.current = false;
        }, 100);
      } else if (data.type === 'ping') {
        if (connRef.current && connRef.current.open) {
          connRef.current.send({ type: 'pong' });
        }
      }
    } catch (e) {
      console.error('Failed to parse sync data', e);
      isRemoteProcessingRef.current = false;
    }
  }, []);

  const setupConnection = useCallback((conn, targetPeerId) => {
    connRef.current = conn;
    setConnectedPeer(targetPeerId || conn.peer);
    setStatus('connected');

    conn.on('data', handleIncomingData);

    conn.on('close', () => {
      console.log('Sync connection closed');
      connRef.current = null;
      setStatus('disconnected');
      setConnectedPeer('');
    });

    conn.on('error', (err) => {
      console.error('Sync connection error:', err);
      connRef.current = null;
      setStatus('disconnected');
      setConnectedPeer('');
    });

    // Immediately exchange initial state both ways on connection establishment
    broadcastState();
  }, [broadcastState, handleIncomingData]);

  const hostSync = useCallback((existingId = null) => {
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
    }
    setStatus('connecting');
    const id = existingId || generatePhrase();
    
    const peer = new Peer(id);
    
    peer.on('open', (newId) => {
      setPeerId(newId);
      setStatus('hosting');
      localStorage.setItem('sync-host-id', newId);
      localStorage.setItem('sync-is-host', 'true');
    });

    peer.on('connection', (conn) => {
      if (conn.open) {
        setupConnection(conn);
      } else {
        conn.on('open', () => setupConnection(conn));
      }
    });

    peer.on('error', (err) => {
      console.error('PeerJS host error:', err);
      setStatus('disconnected');
    });

    peerRef.current = peer;
  }, [setupConnection]);

  const connectToHost = useCallback((hostId) => {
    if (!hostId) return;
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
    }
    setStatus('connecting');
    const cleanHostId = hostId.toLowerCase().trim();
    const peer = new Peer();
    
    peer.on('open', () => {
      const conn = peer.connect(cleanHostId, { reliable: true });
      
      if (conn.open) {
        setupConnection(conn, cleanHostId);
        localStorage.setItem('sync-host-id', cleanHostId);
        localStorage.setItem('sync-is-host', 'false');
      } else {
        conn.on('open', () => {
          setupConnection(conn, cleanHostId);
          localStorage.setItem('sync-host-id', cleanHostId);
          localStorage.setItem('sync-is-host', 'false');
        });
      }
    });

    peer.on('error', (err) => {
      console.error('PeerJS client error:', err);
      setStatus('disconnected');
    });

    peerRef.current = peer;
  }, [setupConnection]);

  const disconnect = useCallback(() => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    localStorage.removeItem('sync-host-id');
    localStorage.removeItem('sync-is-host');
    setStatus('disconnected');
    setPeerId('');
    setConnectedPeer('');
  }, []);

  // 1. Initial Auto-Connect & Auto-Reconnect on Visibility Change (Foreground resume)
  useEffect(() => {
    const checkAndConnect = () => {
      const savedHost = localStorage.getItem('sync-host-id');
      const isHost = localStorage.getItem('sync-is-host');

      if (savedHost && (!connRef.current || !connRef.current.open)) {
        if (isHost === 'true') {
          hostSync(savedHost);
        } else {
          connectToHost(savedHost);
        }
      }
    };

    checkAndConnect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndConnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [hostSync, connectToHost]);

  // 2. Listen for local data changes and broadcast live in real-time
  useEffect(() => {
    const handleLocalChange = () => {
      if (!isRemoteProcessingRef.current) {
        broadcastState();
      }
    };

    window.addEventListener('local-data-changed', handleLocalChange);
    return () => window.removeEventListener('local-data-changed', handleLocalChange);
  }, [broadcastState]);

  // 3. Heartbeat / Ping interval to keep connection alive & detect dropouts
  useEffect(() => {
    const interval = setInterval(() => {
      if (connRef.current && connRef.current.open) {
        try {
          connRef.current.send({ type: 'ping' });
        } catch (e) {
          console.error('Ping failed:', e);
        }
      } else {
        // If saved host exists but connection isn't open, attempt silent reconnect
        const savedHost = localStorage.getItem('sync-host-id');
        const isHost = localStorage.getItem('sync-is-host');
        if (savedHost && (status === 'disconnected' || !connRef.current)) {
          if (isHost === 'true') {
            hostSync(savedHost);
          } else {
            connectToHost(savedHost);
          }
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [status, hostSync, connectToHost]);

  return {
    status,
    peerId,
    connectedPeer,
    hostSync,
    connectToHost,
    disconnect,
    broadcastState
  };
}
