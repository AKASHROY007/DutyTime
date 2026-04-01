export interface Company {
  id: string;
  name: string;
  location: string;
  currentHours: number;
  status: 'In Progress' | 'Finalized' | 'Onboarding';
  icon: string;
  logo?: string;
  color: string;
  breakRules?: BreakRule[];
  recurringShifts?: RecurringShift[];
}

export interface BreakRule {
  id: string;
  afterHours: number;
  breakDurationMinutes: number;
}

export interface RecurringShift {
  id: string;
  companyId: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  shift: 'Day' | 'Night';
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

export interface TodoItem {
  id: string;
  companyId: string;
  date: string; // ISO date
  task: string;
  completed: boolean;
}

export interface DutyLog {
  id: string;
  companyId: string;
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  totalHours: number;
  shift: 'Day' | 'Night';
  notes?: string;
  isRecurring?: boolean;
}

export type View = 'log' | 'workspace' | 'history' | 'profile' | 'rules';
