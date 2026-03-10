import { Sparkles, LogOut } from 'lucide-react'

export default function Header({ session, onSignOut }) {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--neutral-200)',
      padding: 'var(--spacing-2) var(--spacing-3)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-2)'
        }}>
          <Sparkles size={28} color="var(--primary-600)" />
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--neutral-900)',
              lineHeight: '1.2'
            }}>
              PromptEnhancer
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--neutral-600)',
              margin: 0
            }}>
              AI-Powered Prompt Rewriting
            </p>
          </div>
        </div>

        {session && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--neutral-600)'
            }}>
              {session.user.email}
            </span>
            <button
              onClick={onSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-1)',
                padding: '8px 16px',
                background: 'var(--neutral-100)',
                border: '1px solid var(--neutral-300)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--neutral-700)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--neutral-200)'
                e.target.style.borderColor = 'var(--neutral-400)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--neutral-100)'
                e.target.style.borderColor = 'var(--neutral-300)'
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
