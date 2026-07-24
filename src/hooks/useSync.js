import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Auto-reconnect logic
    const savedHost = localStorage.getItem('sync-host-id');
    const isHost = localStorage.getItem('sync-is-host');
    
    if (isHost === 'true' && savedHost) {
      hostSync(savedHost);
    } else if (savedHost) {
      connectToHost(savedHost);
    }

    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  const handleIncomingData = (data) => {
    try {
      if (data.type === 'sync') {
        const payload = data.payload;
        if (payload['kanban-data']) localStorage.setItem('kanban-data', payload['kanban-data']);
        if (payload['multi-habits-list']) localStorage.setItem('multi-habits-list', payload['multi-habits-list']);
        if (payload['multi-habits-records']) localStorage.setItem('multi-habits-records', payload['multi-habits-records']);
        // Force window reload to update all react states cleanly without complex context prop-drilling
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to parse sync data', e);
    }
  };

  const hostSync = (existingId = null) => {
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
      connRef.current = conn;
      setConnectedPeer(conn.peer);
      setStatus('connected');
      
      conn.on('data', handleIncomingData);
      
      conn.on('open', () => {
        // As host, immediately send current local storage to the new client
        broadcastState();
      });
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      setStatus('disconnected');
    });

    peerRef.current = peer;
  };

  const connectToHost = (hostId) => {
    setStatus('connecting');
    const peer = new Peer();
    
    peer.on('open', () => {
      const conn = peer.connect(hostId.toLowerCase().trim());
      connRef.current = conn;

      conn.on('open', () => {
        setConnectedPeer(hostId);
        setStatus('connected');
        localStorage.setItem('sync-host-id', hostId);
        localStorage.setItem('sync-is-host', 'false');
      });

      conn.on('data', handleIncomingData);
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      setStatus('disconnected');
    });

    peerRef.current = peer;
  };

  const disconnect = () => {
    if (peerRef.current) peerRef.current.destroy();
    localStorage.removeItem('sync-host-id');
    localStorage.removeItem('sync-is-host');
    setStatus('disconnected');
    setPeerId('');
    setConnectedPeer('');
  };

  const broadcastState = () => {
    if (connRef.current && connRef.current.open) {
      const payload = {
        'kanban-data': localStorage.getItem('kanban-data'),
        'multi-habits-list': localStorage.getItem('multi-habits-list'),
        'multi-habits-records': localStorage.getItem('multi-habits-records')
      };
      connRef.current.send({ type: 'sync', payload });
    }
  };

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
