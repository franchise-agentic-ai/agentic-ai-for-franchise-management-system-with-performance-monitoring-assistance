/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Outlets } from './pages/Outlets';
import { OutletDetail } from './pages/OutletDetail';
import { InventoryPage } from './pages/InventoryPage';
import { StaffPage } from './pages/StaffPage';
import { MarketingPage } from './pages/MarketingPage';
import { FinancePage } from './pages/FinancePage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { AICopilotPage } from './pages/AICopilotPage';
import { Recommendations } from './pages/Recommendations';
import { ActionCenterPage } from './pages/ActionCenterPage';
import { ReportsPage } from './pages/ReportsPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { BusinessDataHub } from './pages/BusinessDataHub';
import { IntelligenceWorkspace } from './pages/IntelligenceWorkspace';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { BookDemo } from './pages/BookDemo';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { FloatingAIAssistant } from './components/ai/FloatingAIAssistant';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/demo" element={<BookDemo />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Main Dashboard Shell */}
        <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* 1. Outlets & Sub-views */}
          <Route path="outlets" element={<Outlets />} />
          <Route path="outlets/:id" element={<OutletDetail />} />
          <Route path="performance" element={<Outlets />} />
          <Route path="outlet-performance" element={<Outlets />} />

          {/* 2. Inventory */}
          <Route path="inventory" element={<InventoryPage />} />

          {/* 3. Staff */}
          <Route path="staff" element={<StaffPage />} />

          {/* 4. Marketing */}
          <Route path="marketing" element={<MarketingPage />} />

          {/* 5. Finance */}
          <Route path="finance" element={<FinancePage />} />

          {/* 6. Risk Center */}
          <Route path="risk-center" element={<RiskCenterPage />} />
          <Route path="risk" element={<RiskCenterPage />} />
          <Route path="alerts" element={<RiskCenterPage />} />

          {/* 7. AI Copilot */}
          <Route path="copilot" element={<AICopilotPage />} />
          <Route path="intelligence" element={<IntelligenceWorkspace />} />
          <Route path="insights" element={<IntelligenceWorkspace />} />

          {/* 8. Recommendations */}
          <Route path="recommendations" element={<Recommendations />} />

          {/* 9. Action Center */}
          <Route path="action-center" element={<ActionCenterPage />} />
          <Route path="actions" element={<ActionCenterPage />} />

          {/* 10. Reports */}
          <Route path="reports" element={<ReportsPage />} />

          {/* 11. Settings & Profile */}
          <Route path="settings" element={<BusinessProfilePage />} />
          <Route path="business-profile" element={<BusinessProfilePage />} />
          <Route path="data" element={<BusinessDataHub />} />
          <Route path="team" element={<TeamManagementPage />} />
          <Route path="activity" element={<ActivityHistoryPage />} />
        </Route>

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Global Sticky AI Assistant Button & Chat Panel */}
      <FloatingAIAssistant />
    </Router>
  );
}
