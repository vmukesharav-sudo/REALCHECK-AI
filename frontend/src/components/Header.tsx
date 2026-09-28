import React from 'react';
import { 
  Search, 
  Menu
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  activeCaseId?: string;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  activeCaseId = 'RC-2026-0042',
  setMobileMenuOpen
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          width: '100%'
        }}
      >
        {/* Left Side: Mobile Menu Toggle or Empty space for desktop to balance */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="mobile-only" style={{ marginRight: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Right Side: Quick Search, Status, Case ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          
          <button
            onClick={onOpenSearch}
            className="desktop-only-flex"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Search size={14} color="var(--cyan-primary)" />
            <span>Search...</span>
            <kbd style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', borderRadius: '3px', padding: '1px 5px', fontSize: '10px', color: 'var(--text-dim)' }}>
              Ctrl+K
            </kbd>
          </button>
          <button onClick={onOpenSearch} className="mobile-only" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
             <Search size={18} color="var(--cyan-primary)" />
          </button>

          <div
            className="desktop-only-flex"
            style={{
              alignItems: 'center',
              gap: '8px',
              background: 'var(--risk-low-bg)',
              border: '1px solid var(--risk-low-border)',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: 'var(--risk-low-text)'
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--risk-low-text)', boxShadow: '0 0 8px var(--risk-low-text)' }} />
            <span>ONLINE</span>
          </div>

          <div
            className="desktop-only-flex"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--blue-soft)',
              background: 'var(--bg-body-pattern-1)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            title="Global Case Identifier"
          >
            {activeCaseId}
          </div>

        </div>
      </div>
    </header>
  );
};
