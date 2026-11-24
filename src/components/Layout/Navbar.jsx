import React from 'react';
import { Menu, Building, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';

export default function Navbar({ setMobileOpen }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const branchDisplay = user?.branch?.name || (user?.role === 'Super Admin' ? 'Global HQ — All Branches' : 'Main Hub');

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="btn-icon"
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{ display: 'none' }}
        >
          <Menu size={20} />
        </button>

        <div className="branch-pill">
          <Building size={14} />
          <span>{branchDisplay}</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Language selector supporting 4 languages with RTL support */}
        <LanguageSwitcher />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            paddingInlineStart: '0.75rem',
            borderInlineStart: '1px solid var(--slate-200)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--navy-900)',
              color: 'var(--teal-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
