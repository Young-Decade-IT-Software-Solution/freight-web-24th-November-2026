import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-wrapper">
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
