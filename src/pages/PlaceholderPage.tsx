import React from 'react';

export function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-2">Module Integration Ready</h3>
        <p className="text-slate-500 max-w-md mx-auto">This module's interface is structurally complete. Connect real data and AI models to fully activate these capabilities.</p>
      </div>
    </div>
  );
}
