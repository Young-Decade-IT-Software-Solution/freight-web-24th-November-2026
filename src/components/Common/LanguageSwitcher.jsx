import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { updateDocumentDirection } from '../../i18n';

const languages = [
  { code: 'en', name: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية (Arabic)', dir: 'rtl', flag: '🇦🇪' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
  { code: 'zh', name: '简体中文', dir: 'ltr', flag: '🇨🇳' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === (i18n.language?.slice(0, 2) || 'en')) || languages[0];

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    updateDocumentDirection(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.4rem 0.75rem',
        }}
        title="Change Language"
      >
        <Globe size={16} color="var(--slate-600)" />
        <span style={{ fontSize: '0.9rem' }}>{currentLang.flag}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInlineEnd: 0,
            background: '#fff',
            border: '1px solid var(--slate-200)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            minWidth: '180px',
            zIndex: 100,
            overflow: 'hidden',
            padding: '0.35rem',
          }}
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentLang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  border: 'none',
                  background: isSelected ? 'var(--teal-50)' : 'transparent',
                  color: isSelected ? 'var(--teal-600)' : 'var(--navy-900)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check size={16} color="var(--teal-600)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
