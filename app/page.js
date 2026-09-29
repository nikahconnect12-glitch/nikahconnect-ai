'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [inputProfile, setInputProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const handleMatch = async () => {
    if (!inputProfile.trim()) return alert('Please paste a profile first!');
    setLoading(true);
    setMatches([]);

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputProfile }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      } else {
        alert(data.error || 'No matches found');
      }
    } catch (err) {
      alert('Error fetching matches');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1e3a8a' }}>🌸 Nikah Connect - AI Matching Dashboard</h1>
      
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h3>Paste Client Profile Text Below:</h3>
        <textarea
          rows={10}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          placeholder="Paste profile received on WhatsApp..."
          value={inputProfile}
          onChange={(e) => setInputProfile(e.target.value)}
        />
        <button
          onClick={handleMatch}
          disabled={loading}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '14px',
            background: loading ? '#94a3b8' : '#2563eb',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔍 Analyzing Profile & Finding Matches...' : '⚡ Find Matching Profiles'}
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        {matches.length > 0 && <h2>Found {matches.length} Matching Profiles:</h2>}
        
        {matches.map((item) => (
          <div key={item.profile_id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>ID: {item.profile_id}</span>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                🎯 {item.match_percentage}% Match
              </span>
            </div>

            <p style={{ color: '#475569', fontSize: '14px', margin: '10px 0' }}>
              <strong>AI Match Reason:</strong> {item.match_reason}
            </p>

            <pre style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', maxHeight: '250px', whiteSpace: 'pre-wrap' }}>
              {item.formatted_text}
            </pre>

            <button
              onClick={() => handleCopy(item.profile_id, item.formatted_text)}
              style={{
                background: copiedId === item.profile_id ? '#16a34a' : '#0f172a',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {copiedId === item.profile_id ? '✓ Copied to Clipboard!' : '📋 Copy Profile for WhatsApp'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
