import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Generate some mock pixel-art style data for now
    const mockData = [
      { name: 'Mon', focus: 120 },
      { name: 'Tue', focus: 150 },
      { name: 'Wed', focus: 90 },
      { name: 'Thu', focus: 200 },
      { name: 'Fri', focus: 180 },
      { name: 'Sat', focus: 60 },
      { name: 'Sun', focus: 210 },
    ];
    setData(mockData);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="header" style={{ padding: '0 0 1.5rem 0' }}>
        <div>
          <h1>Analytics</h1>
          <p>Track your heroic productivity</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem', color: 'var(--accent-color)', marginBottom: '2rem', textShadow: '1px 1px 0px #000' }}>
          Weekly Focus (Minutes)
        </h2>
        
        <div style={{ flex: 1, minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontFamily: '"VT323", monospace', fontSize: '1.2rem', fill: 'var(--text-secondary)' }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontFamily: '"VT323", monospace', fontSize: '1.2rem', fill: 'var(--text-secondary)' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#2b2d42', 
                  border: '3px solid #000', 
                  borderRadius: '0px',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.6rem',
                  boxShadow: '4px 4px 0px #000'
                }} 
              />
              <Bar dataKey="focus" fill="var(--accent-color)" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
