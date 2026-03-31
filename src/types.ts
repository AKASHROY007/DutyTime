export interface Company {
  id: string;
  name: string;
  location: string;
  currentHours: number;
  status: 'In Progress' | 'Finalized' | 'Onboarding';
  icon: string;
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
}

export type View = 'log' | 'workspace' | 'history' | 'profile';
