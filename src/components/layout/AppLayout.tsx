import React from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalHeader } from './GlobalHeader';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { GlobalFooter } from './GlobalFooter';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* 1. STICKY TOP GLOBAL WEBSITE HEADER */}
      <GlobalHeader />

      {/* 2. DASHBOARD SHELL: Left Sidebar & Main Content scroll together with the page */}
      <div className="flex flex-1 w-full">
        {/* Left Operational Tree Sidebar (normal flow, not sticky, moves with the page) */}
        <div className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950">
          <Sidebar />
        </div>

        {/* Right Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Dashboard Application Top Header */}
          <TopNav />

          {/* Main Dashboard Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* 3. GLOBAL WEBSITE FOOTER (Normal Document Flow at Bottom) */}
      <GlobalFooter />
    </div>
  );
}
