import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <SettingsIcon size={24} color="var(--cyan-primary)" />
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Settings</h1>
      </div>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Settings configuration will be available here.</p>
      </div>
    </div>
  );
};
