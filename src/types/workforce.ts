export type EmployeeRole = 
  | 'Head Chef' 
  | 'Senior Sous Chef' 
  | 'Line Cook' 
  | 'Kitchen Steward' 
  | 'Store Manager' 
  | 'Assistant Manager' 
  | 'Cashier' 
  | 'Front-of-House Lead' 
  | 'Server / Waitstaff' 
  | 'Delivery Lead' 
  | 'Inventory Specialist'
  | 'Operations Lead';

export type EmployeeDepartment = 
  | 'Kitchen' 
  | 'Front-of-House' 
  | 'Management' 
  | 'Logistics & Delivery' 
  | 'Inventory';

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'Split' | 'Weekend Peak' | 'General';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Probation' | 'Terminated';

export type ShiftCoverageStatus = 'OPTIMAL' | 'SHORTAGE' | 'CRITICAL_DEFICIT' | 'SURPLUS';

export type WorkforceRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Employee {
  employeeId: string;
  outletId: string;
  outletName: string;
  employeeName: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
  attendanceRate: number; // Percentage 0-100
  workingHours: number; // Hours worked in current period (e.g., month)
  overtimeHours: number; // Overtime hours worked
  productivityScore: number; // 0-100 scale
  performanceScore: number; // 0-100 scale
  shift: ShiftType;
  status: EmployeeStatus;
  hourlyRate?: number;
  phone?: string;
  email?: string;
  joinDate?: string;
  skills?: string[];
  businessId: string;
}

export interface ShiftRecord {
  shiftId: string;
  businessId: string;
  outletId: string;
  outletName: string;
  date: string;
  shiftType: ShiftType;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "16:00"
  requiredStaffCount: number;
  assignedStaffCount: number;
  assignedEmployeeIds: string[];
  coverageStatus: ShiftCoverageStatus;
  deficitCount: number; // If shortage > 0
  department: EmployeeDepartment;
  notes?: string;
}

export interface AttendanceLog {
  logId: string;
  businessId: string;
  employeeId: string;
  employeeName: string;
  outletId: string;
  outletName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Half Day';
  lateMinutes?: number;
}

export interface StaffingRequirement {
  id: string;
  businessId: string;
  outletId: string;
  outletName: string;
  department: EmployeeDepartment;
  shiftType: ShiftType;
  minHeadcountRequired: number;
  optimalHeadcount: number;
  currentAllocated: number;
  isPeakPeriod: boolean;
  notes?: string;
}

export interface WorkforceOutletMetrics {
  outletId: string;
  outletName: string;
  city: string;
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  averageAttendanceRate: number;
  averageProductivityScore: number;
  averagePerformanceScore: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  shortageIncidentsCount: number;
  shiftCoveragePercentage: number;
  workforceHealthScore: number; // 0-100
  riskLevel: WorkforceRiskLevel;
  primaryRiskReason?: string;
}

export interface StaffShortageAssessment {
  outletId: string;
  outletName: string;
  shiftType: ShiftType;
  department: EmployeeDepartment;
  requiredStaff: number;
  actualStaff: number;
  deficit: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactExplanation: string;
  suggestedAction: string;
  possibleReallocationSources?: {
    outletId: string;
    outletName: string;
    availableStaffCount: number;
    candidateNames: string[];
  }[];
}

export interface WorkforceKPIs {
  totalEmployees: number;
  activeHeadcount: number;
  onLeaveCount: number;
  overallAttendanceRate: number;
  overallProductivityScore: number;
  overallPerformanceScore: number;
  totalOvertimeHours: number;
  averageOvertimePerEmployee: number;
  activeShortagesCount: number;
  overallShiftCoverageRate: number;
  criticalOutletsCount: number;
}

export interface StaffAgentInsight {
  id: string;
  title: string;
  summary: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Positive';
  category: 'Attendance' | 'Productivity' | 'Shortage' | 'Overtime' | 'Shift Coverage' | 'Performance';
  affected_outlets: string[];
  affected_employees: string[];
  actionable_step: string;
  calculated_metrics: Record<string, string | number>;
  timestamp: string;
}

export interface StaffAgentScanResult {
  businessId: string;
  timestamp: string;
  kpis: WorkforceKPIs;
  outletMetrics: WorkforceOutletMetrics[];
  shortages: StaffShortageAssessment[];
  insights: StaffAgentInsight[];
  topPerformers: Employee[];
  attentionRequiredEmployees: Employee[];
  summaryNarrative: string;
}
