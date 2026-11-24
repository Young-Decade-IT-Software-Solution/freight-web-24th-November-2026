import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'var(--amber-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--amber-600)',
        }}
      >
        <AlertTriangle size={32} />
      </div>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
        404 — Page Not Found
      </h2>
      <p style={{ color: 'var(--slate-500)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
