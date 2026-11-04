import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ isAdmin = false, title, breadcrumbs = [], children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isAdmin={isAdmin}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="main-content">
        <Navbar
          title={title}
          breadcrumbs={breadcrumbs}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
