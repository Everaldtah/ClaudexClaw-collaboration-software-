import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

export function useWebSocket() {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [agents, setAgents] = useState({
    claude_code: { status: 'idle', messageCount: 0, lastSeen: null, currentTask: null },
    clawbot:     { status: 'idle', messageCount: 0, lastSeen: null, currentTask: null },
  });
  const [stats, setStats] = useState({ totalMessages: 0, totalSessions: 0 });
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('[WS] Connected');
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };

    ws.onmessage = (evt) => {
      try {
        const { type, data } = JSON.parse(evt.data);
        switch (type) {
          case 'init':
            setMessages(data.messages || []);
            setSessions(data.sessions || []);
            setAgents(prev => ({ ...prev, ...data.agents }));
            setStats(data.stats || {});
            break;
          case 'message':
            setMessages(prev => [...prev.slice(-500), data]);
            setStats(prev => ({ ...prev, totalMessages: (prev.totalMessages || 0) + 1 }));
            break;
          case 'sessions':
            setSessions(data);
            setStats(prev => ({ ...prev, totalSessions: data.length }));
            break;
          case 'agents':
            setAgents(prev => ({ ...prev, ...data }));
            break;
        }
      } catch (e) {
        console.error('[WS] Parse error', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('[WS] Disconnected — reconnecting in 3s...');
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected, messages, sessions, agents, stats };
}
