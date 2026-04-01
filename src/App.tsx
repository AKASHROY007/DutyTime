import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, 
  Plus, 
  History, 
  User, 
  Building2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Save,
  ArrowLeft,
  LayoutGrid,
  Settings,
  Repeat,
  CheckCircle2,
  Circle,
  GripVertical,
  Pencil,
  Globe,
  Filter,
  X,
  Send,
  BrainCircuit,
  TrendingUp,
  Trash2,
  Factory,
  Home,
  Briefcase,
  ShoppingCart,
  Truck,
  HeartPulse,
  GraduationCap,
  Upload,
  Image as ImageIcon,
  Camera,
  Edit2
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  parseISO,
  differenceInMinutes,
  addDays,
  getDay,
  getDate
} from 'date-fns';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Company, DutyLog, View, RecurringShift, BreakRule, TodoItem } from './types';

// --- Translations ---
type Language = 'bn' | 'en';

const translations = {
  bn: {
    workspace: "আপনার ওয়ার্কস্পেস",
    workspaceDesc: "আপনার পেশাদার পরিবেশ এবং ট্র্যাক করা ঘন্টা পরিচালনা করুন।",
    newCompany: "নতুন কোম্পানি যোগ করুন",
    currentPeriod: "বর্তমান পিরিয়ড",
    status: "স্ট্যাটাস",
    hours: "ঘণ্টা",
    totalMonth: "মাসের মোট",
    history: "ইতিহাস",
    rules: "রুলস",
    profile: "প্রোফাইল",
    log: "লগ",
    accountSettings: "অ্যাকাউন্ট সেটিংস",
    exportReport: "ডিউটি রিপোর্ট এক্সপোর্ট",
    language: "ভাষা পরিবর্তন করুন",
    edit: "এডিট",
    save: "সেভ করুন",
    cancel: "বাতিল",
    companyName: "Company Name",
    location: "Project/Site Name",
    icon: "আইকন",
    logo: "লোগো",
    name: "YOUR NAME",
    email: "YOUR EMAIL",
    filters: "ফিল্টার",
    all: "সব",
    day: "দিন",
    night: "রাত",
    recurring: "পুনরাবৃত্ত",
    manual: "ম্যানুয়াল",
    shift: "শিফট",
    type: "ধরণ",
    company: "কোম্পানি",
    totalHours: "মোট ঘণ্টা",
    nightShift: "নাইট শিফট",
    pendingTasks: "পেন্ডিং কাজ",
    recurringShifts: "রিকারিং শিফট",
    breakRules: "ব্রেক রুলস",
    addRule: "রুল যোগ করুন",
    addShift: "শিফট যোগ করুন",
    startTime: "শুরু",
    endTime: "শেষ",
    frequency: "ফ্রিকোয়েন্সি",
    days: "দিনগুলো",
    dayOfMonth: "মাসের দিন",
    after: "পরে",
    duration: "সময়কাল",
    minutes: "মিনিট",
    aiAssistant: "AI অ্যাসিস্ট্যান্ট",
    aiPlaceholder: "যেমন: 'আমি আজ সকাল ৮টা থেকে বিকাল ৫টা পর্যন্ত কাজ করেছি'...",
    today: "আজ",
    mon: "সোম", tue: "মঙ্গল", wed: "বুধ", thu: "বৃহস্পতি", fri: "শুক্র", sat: "শনি", sun: "রবি",
    editCompany: "কোম্পানি এডিট করুন",
    workspaceTitle: "মাই ডিউটি",
    dutyCalendar: "ডিউটি ক্যালেন্ডার",
    monthlyTotal: "মাসের মোট",
    average: "গড়",
    hoursPerDay: "ঘণ্টা/দিন",
    newDutyLog: "নতুন ডিউটি লগ",
    logDescription: "আপনার ম্যানুয়াল ডিউটি এন্ট্রিগুলি নির্ভুলতার সাথে রেকর্ড করুন।",
    smartTranscription: "স্মার্ট ট্রান্সক্রিপশন",
    processAI: "এআই দিয়ে পূরণ করুন",
    processing: "প্রসেসিং হচ্ছে...",
    selectCompany: "কোম্পানি নির্বাচন করুন",
    date: "তারিখ",
    dayShift: "ডে শিফট",
    clockIn: "ক্লক-ইন",
    clockOut: "ক্লক-আউট",
    manualBreakOverride: "ম্যানুয়াল ব্রেক ওভাররাইড",
    breakOverrideDesc: "ব্রেক রুলস উপেক্ষা করে কাস্টম সময় দিন",
    durationMinutes: "সময়কাল (মিনিট)",
    autoBreakDesc: "কোম্পানির ব্রেক রুলস অনুযায়ী অটোমেটিক হিসাব করা হবে।",
    estimatedTotal: "আনুমানিক মোট ডিউটি",
    saveLog: "লগ সেভ করুন",
    settingsAndRules: "সেটিিংস ও রুলস",
    rulesDescription: "এর জন্য কাস্টম রুলস সেট করুন।",
    rule: "রুল",
    delete: "মুছে ফেলুন",
    workTimeHours: "কাজের সময় (ঘণ্টা)",
    breakMinutes: "ব্রেক (মিনিট)",
    addNewBreakRule: "নতুন ব্রেক রুল যোগ করুন",
    shiftNum: "শিফট",
    daily: "প্রতিদিন",
    weekly: "সাপ্তাহিক",
    monthly: "মাসিক",
    addNewRecurringShift: "নতুন পুনরাবৃত্ত শিফট যোগ করুন",
    historyDescription: "আপনার সমস্ত ডিউটি লগের বিস্তারিত তালিকা।",
    accentColor: "অ্যাকসেন্ট কালার",
    h: "ঘণ্টা",
  },
  en: {
    workspace: "Your Workspace",
    workspaceDesc: "Manage your professional environments and tracked hours.",
    newCompany: "Add New Company",
    currentPeriod: "Current Period",
    status: "Status",
    hours: "Hours",
    totalMonth: "Month Total",
    history: "History",
    rules: "Rules",
    profile: "Profile",
    log: "Log",
    accountSettings: "Account Settings",
    exportReport: "Export Duty Report",
    language: "Change Language",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    companyName: "Company Name",
    location: "Project/Site Name",
    icon: "Icon",
    logo: "Logo",
    name: "YOUR NAME",
    email: "YOUR EMAIL",
    filters: "Filters",
    all: "All",
    day: "Day",
    night: "Night",
    recurring: "Recurring",
    manual: "Manual",
    shift: "Shift",
    type: "Type",
    company: "Company",
    totalHours: "Total Hours",
    nightShift: "Night Shift",
    pendingTasks: "Pending Tasks",
    recurringShifts: "Recurring Shifts",
    breakRules: "Break Rules",
    addRule: "Add Rule",
    addShift: "Add Shift",
    startTime: "Start",
    endTime: "End",
    frequency: "Frequency",
    days: "Days",
    dayOfMonth: "Day of Month",
    after: "After",
    duration: "Duration",
    minutes: "Minutes",
    aiAssistant: "AI Assistant",
    aiPlaceholder: "e.g., 'I worked from 8am to 5pm today'...",
    today: "Today",
    mon: "MON", tue: "TUE", wed: "WED", thu: "THU", fri: "FRI", sat: "SAT", sun: "SUN",
    editCompany: "Edit Company",
    workspaceTitle: "My Duty",
    dutyCalendar: "Duty Calendar",
    monthlyTotal: "Monthly Total",
    average: "Average",
    hoursPerDay: "Hours/Day",
    newDutyLog: "New Duty Log",
    logDescription: "Record your manual duty entries with precision.",
    smartTranscription: "Smart Transcription",
    processAI: "Fill with AI",
    processing: "Processing...",
    selectCompany: "Select Company",
    date: "Date",
    dayShift: "Day Shift",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    manualBreakOverride: "Manual Break Override",
    breakOverrideDesc: "Ignore break rules and set custom time",
    durationMinutes: "Duration (Minutes)",
    autoBreakDesc: "Will be calculated automatically based on company rules.",
    estimatedTotal: "Estimated Total Duty",
    saveLog: "Save Log",
    settingsAndRules: "Settings & Rules",
    rulesDescription: "Set custom rules for",
    rule: "Rule",
    delete: "Delete",
    workTimeHours: "Work Time (Hours)",
    breakMinutes: "Break (Minutes)",
    addNewBreakRule: "Add New Break Rule",
    shiftNum: "Shift",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    addNewRecurringShift: "Add New Recurring Shift",
    historyDescription: "Detailed list of all your duty logs.",
    accentColor: "Accent Color",
    h: "h",
  }
};

const PREDEFINED_ICONS = [
  { name: 'building', icon: Building2 },
  { name: 'factory', icon: Factory },
  { name: 'home', icon: Home },
  { name: 'briefcase', icon: Briefcase },
  { name: 'shopping-cart', icon: ShoppingCart },
  { name: 'truck', icon: Truck },
  { name: 'heart-pulse', icon: HeartPulse },
  { name: 'graduation-cap', icon: GraduationCap },
];

const CompanyIcon = ({ icon, className, style }: { icon: string, className?: string, style?: React.CSSProperties }) => {
  const predefined = PREDEFINED_ICONS.find(i => i.name === icon);
  if (predefined) {
    return <predefined.icon className={className} style={style} />;
  }
  if (icon && icon.startsWith('data:image')) {
    return <img src={icon} className={cn(className, "object-cover rounded-md")} style={style} referrerPolicy="no-referrer" />;
  }
  return <Building2 className={className} style={style} />;
};

// --- Mock Data ---
const MOCK_COMPANIES: Company[] = [
  { 
    id: '1', 
    name: 'COMPANY NAME', 
    location: 'PROJECT/SITE NAME', 
    currentHours: 48.5, 
    status: 'In Progress', 
    icon: 'building',
    color: '#10b981',
    breakRules: [
      { id: 'b1', afterHours: 4, breakDurationMinutes: 30 },
      { id: 'b2', afterHours: 8, breakDurationMinutes: 60 }
    ],
    recurringShifts: [
      { id: 'r1', companyId: '1', startTime: '09:00', endTime: '17:00', shift: 'Day', frequency: 'weekly', daysOfWeek: [1, 2, 3, 4, 5] }
    ]
  },
  { id: '2', name: 'COMPANY NAME', location: 'PROJECT/SITE NAME', currentHours: 120.0, status: 'Finalized', icon: 'factory', color: '#f59e0b' },
  { id: '3', name: 'COMPANY NAME', location: 'PROJECT/SITE NAME', currentHours: 0.0, status: 'Onboarding', icon: 'home', color: '#3b82f6' },
];

const MOCK_LOGS: DutyLog[] = [
  { id: '1', companyId: '1', date: '2023-10-06', startTime: '08:30', endTime: '18:30', breakMinutes: 60, totalHours: 9.0, shift: 'Day' },
  { id: '2', companyId: '1', date: '2023-10-05', startTime: '09:00', endTime: '17:30', breakMinutes: 30, totalHours: 8.0, shift: 'Day' },
  { id: '3', companyId: '1', date: '2023-10-04', startTime: '09:00', endTime: '17:00', breakMinutes: 30, totalHours: 7.5, shift: 'Day' },
];

const MOCK_TODOS: TodoItem[] = [
  { id: 't1', companyId: '1', date: '2023-10-09', task: 'Submit report', completed: false },
  { id: 't2', companyId: '1', date: '2023-10-09', task: 'Check inventory', completed: true },
];

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  const [currentView, setCurrentView] = useState<View>('workspace');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<DutyLog[]>(MOCK_LOGS);
  const [todos, setTodos] = useState<TodoItem[]>(MOCK_TODOS);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 9, 1)); // Oct 2023 for mock consistency
  const [isEditingCompany, setIsEditingCompany] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editIcon, setEditIcon] = useState('building');
  const [editLogo, setEditLogo] = useState<string | undefined>(undefined);
  const [editColor, setEditColor] = useState('#10b981');

  const [userName, setUserName] = useState(t.name);
  const [userEmail, setUserEmail] = useState(t.email);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Update default names when language changes if not edited
  useEffect(() => {
    const prevT = translations[language === 'en' ? 'bn' : 'en'];
    if (userName === prevT.name) {
      setUserName(t.name);
    }
    if (userEmail === prevT.email) {
      setUserEmail(t.email);
    }
  }, [language, t]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const handleEditCompany = (company: Company) => {
    setIsEditingCompany(company.id);
    setEditName(company.name);
    setEditLocation(company.location);
    setEditIcon(company.icon || 'building');
    setEditLogo(company.logo);
    setEditColor(company.color || '#10b981');
  };

  const saveCompanyEdit = () => {
    if (!isEditingCompany) return;
    
    if (isEditingCompany === 'new') {
      const newCompany: Company = {
        id: Math.random().toString(),
        name: editName || 'COMPANY NAME',
        location: editLocation || 'PROJECT/SITE NAME',
        currentHours: 0,
        status: 'Onboarding',
        icon: editIcon,
        logo: editLogo,
        color: editColor,
        breakRules: [],
        recurringShifts: []
      };
      setCompanies([...companies, newCompany]);
    } else {
      setCompanies(prev => prev.map(c => 
        c.id === isEditingCompany 
          ? { ...c, name: editName || 'COMPANY NAME', location: editLocation || 'PROJECT/SITE NAME', icon: editIcon, logo: editLogo, color: editColor }
          : c
      ));
    }
    setIsEditingCompany(null);
  };

  // Generate recurring shifts for the current month
  useEffect(() => {
    if (!selectedCompanyId) return;
    
    const company = companies.find(c => c.id === selectedCompanyId);
    if (!company?.recurringShifts?.length) return;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const recurringLogs: DutyLog[] = [];

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      // Check if a log already exists for this day
      if (logs.some(l => l.companyId === selectedCompanyId && l.date === dateStr)) return;

      company.recurringShifts?.forEach(shift => {
        let shouldAdd = false;
        if (shift.frequency === 'daily') shouldAdd = true;
        else if (shift.frequency === 'weekly' && shift.daysOfWeek?.includes(getDay(day))) shouldAdd = true;
        else if (shift.frequency === 'monthly' && shift.dayOfMonth === getDate(day)) shouldAdd = true;

        if (shouldAdd) {
          const start = new Date(`2000-01-01T${shift.startTime}`);
          const end = new Date(`2000-01-01T${shift.endTime}`);
          let diff = differenceInMinutes(end, start);
          if (diff < 0) diff += 24 * 60;
          
          // Calculate break using rules
          let breakMins = 0;
          const hours = diff / 60;
          company.breakRules?.forEach(rule => {
            if (hours >= rule.afterHours) {
              breakMins = Math.max(breakMins, rule.breakDurationMinutes);
            }
          });

          recurringLogs.push({
            id: `rec-${shift.id}-${dateStr}`,
            companyId: selectedCompanyId,
            date: dateStr,
            startTime: shift.startTime,
            endTime: shift.endTime,
            breakMinutes: breakMins,
            totalHours: (diff - breakMins) / 60,
            shift: shift.shift,
            isRecurring: true
          });
        }
      });
    });

    if (recurringLogs.length > 0) {
      setLogs(prev => [...prev, ...recurringLogs]);
    }
  }, [selectedCompanyId, currentMonth, companies]);

  const handleAddLog = (newLog: Omit<DutyLog, 'id'>) => {
    const logWithId = { ...newLog, id: Math.random().toString(36).substr(2, 9) };
    setLogs([logWithId, ...logs]);
    setCurrentView('workspace');
  };

  const handleUpdateLogs = (newLogs: DutyLog[]) => {
    setLogs(newLogs);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setLogs(prev => prev.filter(l => l.companyId !== id));
    setTodos(prev => prev.filter(t => t.companyId !== id));
    if (selectedCompanyId === id) setSelectedCompanyId(null);
  };

  const handleReorderCompanies = (activeId: string, overId: string) => {
    setCompanies((items) => {
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  return (
    <div className="min-h-screen bg-[#050C0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#050C0A]/80 backdrop-blur-md border-b border-emerald-900/20 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentView('profile')}
            className="flex items-center gap-2 hover:bg-emerald-900/20 rounded-xl p-1 transition-colors"
          >
            {selectedCompanyId && (currentView === 'workspace' || currentView === 'rules') ? (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentView === 'rules') setCurrentView('workspace');
                  else setSelectedCompanyId(null);
                }}
                className="p-2 hover:bg-emerald-900/20 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-emerald-400" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-black" />
              </div>
            )}
          </button>
          <div className="flex items-center gap-3">
            {selectedCompanyId && (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: selectedCompany?.color }}
              >
                {selectedCompany?.logo ? (
                  <img src={selectedCompany.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <CompanyIcon icon={selectedCompany?.icon || 'building'} className="w-4 h-4 text-black" />
                )}
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight text-emerald-50">
              {selectedCompanyId ? selectedCompany?.name : t.workspaceTitle}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {selectedCompanyId && currentView === 'workspace' && (
            <button 
              onClick={() => setCurrentView('rules')}
              className="p-2 hover:bg-emerald-900/20 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-emerald-400" />
            </button>
          )}
          <button 
            onClick={() => setCurrentView('profile')}
            className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center overflow-hidden hover:border-emerald-500/50 transition-all"
          >
            {userAvatar ? (
              <img src={userAvatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-6 h-6 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-6 max-w-2xl mx-auto">
        {currentView === 'workspace' && !selectedCompanyId && (
          <WorkspaceView 
            companies={companies} 
            onSelect={setSelectedCompanyId} 
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
            onReorder={handleReorderCompanies}
            onAdd={() => {
              setIsEditingCompany('new');
              setEditName('');
              setEditLocation('');
            }}
            t={t}
          />
        )}
        {currentView === 'workspace' && selectedCompanyId && (
          <CalendarView 
            company={selectedCompany!} 
            companies={companies}
            logs={logs}
            todos={todos.filter(t => t.companyId === selectedCompanyId)}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onUpdateLogs={handleUpdateLogs}
            onToggleTodo={toggleTodo}
            allLogs={logs}
            t={t}
          />
        )}
        {currentView === 'log' && (
          <LogView companies={companies} onSave={handleAddLog} t={t} />
        )}
        {currentView === 'history' && (
          <HistoryView logs={logs} companies={companies} t={t} />
        )}
        {currentView === 'profile' && (
          <ProfileView 
            language={language} 
            setLanguage={setLanguage} 
            t={t} 
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userAvatar={userAvatar}
            setUserAvatar={setUserAvatar}
          />
        )}
        {currentView === 'rules' && selectedCompany && (
          <RulesView company={selectedCompany} onUpdate={handleUpdateCompany} t={t} />
        )}
      </main>

      {/* Edit Company Modal */}
      {isEditingCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0D1A16] border border-emerald-900/30 rounded-[24px] p-5 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-emerald-50">
                {isEditingCompany === 'new' ? t.newCompany : t.editCompany}
              </h3>
              <button onClick={() => setIsEditingCompany(null)} className="p-1.5 hover:bg-emerald-900/20 rounded-full">
                <X className="w-5 h-5 text-emerald-500/40" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{t.logo}</label>
                <div className="flex items-center gap-3">
                  <label className="w-14 h-14 rounded-xl border border-dashed border-emerald-900/30 flex items-center justify-center cursor-pointer hover:border-emerald-500/40 transition-all overflow-hidden bg-[#142620]">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditLogo(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {editLogo ? (
                      <img src={editLogo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 text-emerald-500/40">
                        <Upload className="w-4 h-4" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Upload</span>
                      </div>
                    )}
                  </label>
                  {editLogo && (
                    <button 
                      onClick={() => setEditLogo(undefined)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{t.icon}</label>
                <div className="grid grid-cols-4 gap-2">
                  {PREDEFINED_ICONS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setEditIcon(item.name)}
                      className={cn(
                        "p-2 rounded-lg border transition-all flex items-center justify-center",
                        editIcon === item.name 
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" 
                          : "bg-[#142620] border-emerald-900/30 text-emerald-500/40 hover:border-emerald-500/40"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{t.accentColor}</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer"
                  />
                  <div className="flex-1 bg-[#142620] border border-emerald-900/30 rounded-lg p-2 text-emerald-50 font-mono text-[10px]">
                    {editColor.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{t.companyName}</label>
                <input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#142620] border border-emerald-900/30 rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{t.location}</label>
                <input 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#142620] border border-emerald-900/30 rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsEditingCompany(null)}
                className="flex-1 py-2.5 bg-emerald-900/20 rounded-xl font-bold text-xs hover:bg-emerald-900/40 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={saveCompanyEdit}
                className="flex-1 py-2.5 bg-emerald-500 text-black rounded-xl font-bold text-xs hover:scale-[0.98] transition-transform"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0A1411]/90 backdrop-blur-xl border-t border-emerald-900/30 flex items-center justify-around px-4 z-50">
        <NavButton 
          active={currentView === 'log'} 
          onClick={() => setCurrentView('log')} 
          icon={<Plus className="w-6 h-6" />} 
          label={t.log} 
        />
        <NavButton 
          active={currentView === 'workspace'} 
          onClick={() => { setCurrentView('workspace'); setSelectedCompanyId(null); }} 
          icon={<LayoutGrid className="w-6 h-6" />} 
          label={t.workspace} 
        />
        <NavButton 
          active={currentView === 'history'} 
          onClick={() => setCurrentView('history')} 
          icon={<History className="w-6 h-6" />} 
          label={t.history} 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 px-4 py-2 rounded-2xl",
        active ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "text-emerald-500/50 hover:text-emerald-400"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

// --- Views ---

function SortableCompanyItem({ 
  company, 
  onSelect, 
  onEdit, 
  onDelete,
  t 
}: { 
  company: Company, 
  onSelect: (id: string) => void,
  onEdit: (company: Company) => void,
  onDelete: (id: string) => void,
  t: any,
  key?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group"
    >
      <div
        onClick={() => onSelect(company.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(company.id);
          }
        }}
        role="button"
        tabIndex={0}
        className="w-full text-left p-6 bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] hover:border-emerald-500/40 transition-all relative overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
              <div 
                {...attributes}
                {...listeners}
                className="p-2 -ml-2 cursor-grab active:cursor-grabbing text-emerald-500/20 hover:text-emerald-500/40 transition-colors"
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ 
                  backgroundColor: company.color,
                  boxShadow: `0 0 15px ${company.color}66`
                }}
              >
                {company.logo ? (
                  <img src={company.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <CompanyIcon icon={company.icon} className="w-6 h-6 text-black" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-emerald-50 truncate">{company.name}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(company);
                      }}
                      className="p-1.5 bg-emerald-900/20 rounded-lg hover:bg-emerald-500 hover:text-black transition-all text-emerald-500/60 group-hover:text-emerald-500"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(company.id);
                      }}
                      className="p-1.5 bg-red-900/20 rounded-lg hover:bg-red-500 hover:text-white transition-all text-red-500/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest truncate">{company.location}</p>
              </div>
            </div>
            <div className="flex gap-8 pl-9">
              <div>
                <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1">{t.currentPeriod}</p>
                <p className="text-lg font-bold text-emerald-400">{company.currentHours.toFixed(1)} {t.hours}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1">{t.status}</p>
                <p className="text-lg font-bold text-amber-400">{company.status}</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 pointer-events-none opacity-10">
            <CompanyIcon icon={company.icon} className="w-24 h-24" style={{ color: company.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceView({ 
  companies, 
  onSelect, 
  onEdit,
  onDelete,
  onReorder,
  onAdd,
  t 
}: { 
  companies: Company[], 
  onSelect: (id: string) => void,
  onEdit: (company: Company) => void,
  onDelete: (id: string) => void,
  onReorder: (activeId: string, overId: string) => void,
  onAdd: () => void,
  t: any
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">{t.workspace}</h2>
        <p className="text-emerald-500/60 font-medium">{t.workspaceDesc}</p>
      </div>

      <div className="space-y-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={companies.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {companies.map(company => (
              <SortableCompanyItem
                key={company.id}
                company={company}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                t={t}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button 
          onClick={onAdd}
          className="w-full py-6 bg-emerald-500 rounded-[32px] flex items-center justify-center gap-3 text-black font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[0.98] transition-transform"
        >
          <Plus className="w-6 h-6" />
          {t.newCompany}
        </button>
      </div>
    </div>
  );
}

function CalendarView({ 
  company, 
  companies,
  logs, 
  todos, 
  currentMonth, 
  onMonthChange, 
  onUpdateLogs, 
  onToggleTodo,
  allLogs,
  t
}: { 
  company: Company, 
  companies: Company[],
  logs: DutyLog[], 
  todos: TodoItem[], 
  currentMonth: Date, 
  onMonthChange: (d: Date) => void,
  onUpdateLogs: (logs: DutyLog[]) => void,
  onToggleTodo: (id: string) => void,
  allLogs: DutyLog[],
  t: any
}) {
  const [companyFilter, setCompanyFilter] = useState<string>(company.id);
  const [shiftFilter, setShiftFilter] = useState<'all' | 'Day' | 'Night'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'recurring' | 'manual'>('all');

  const filteredLogs = logs.filter(log => {
    const matchesCompany = companyFilter === 'all' || log.companyId === companyFilter;
    const matchesShift = shiftFilter === 'all' || log.shift === shiftFilter;
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'recurring' ? log.isRecurring : !log.isRecurring);
    return matchesCompany && matchesShift && matchesType;
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const totalHours = filteredLogs.reduce((acc, log) => acc + log.totalHours, 0);
  const averageHours = filteredLogs.length > 0 ? (totalHours / filteredLogs.length).toFixed(1) : '0.0';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeLog = allLogs.find(l => l.id === active.id);
      if (activeLog) {
        const newLogs = allLogs.map(l => 
          l.id === active.id ? { ...l, date: over.id as string } : l
        );
        onUpdateLogs(newLogs);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(() => {
            const activeCompany = companies.find(c => c.id === companyFilter) || company;
            return (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ 
                  backgroundColor: activeCompany.color,
                  boxShadow: `0 0 20px ${activeCompany.color}4D`
                }}
              >
                {activeCompany.logo ? (
                  <img src={activeCompany.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <CompanyIcon icon={activeCompany.icon} className="w-8 h-8 text-black" />
                )}
              </div>
            );
          })()}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</p>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter">{t.dutyCalendar}</h2>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button onClick={() => onMonthChange(subMonths(currentMonth, 1))} className="p-3 bg-[#0D1A16] border border-emerald-900/30 rounded-2xl hover:bg-emerald-900/40 transition-all group">
              <ChevronLeft className="w-6 h-6 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-3 bg-[#0D1A16] border border-emerald-900/30 rounded-2xl hover:bg-emerald-900/40 transition-all group">
              <ChevronRight className="w-6 h-6 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">
            {format(new Date(2023, 9, 9), 'do MMMM')}
          </div>
        </div>
      </div>

      {/* Filters - More compact */}
      <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-[#142620] border border-emerald-900/30 rounded-2xl px-4 py-2">
            <Building2 className="w-4 h-4 text-emerald-500/60" />
            <select 
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold text-emerald-50 outline-none"
            >
              <option value="all">{t.all} Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex bg-[#142620] p-1 rounded-2xl border border-emerald-900/30">
            {(['all', 'Day', 'Night'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShiftFilter(s)}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest",
                  shiftFilter === s 
                    ? "bg-emerald-500 text-black shadow-lg" 
                    : "text-emerald-500/40 hover:text-emerald-500/60"
                )}
              >
                {s === 'all' ? t.all : (s === 'Day' ? t.day : t.night)}
              </button>
            ))}
          </div>
          <div className="flex bg-[#142620] p-1 rounded-2xl border border-emerald-900/30">
            {(['all', 'recurring', 'manual'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest",
                  typeFilter === type 
                    ? "bg-emerald-500 text-black shadow-lg" 
                    : "text-emerald-500/40 hover:text-emerald-500/60"
                )}
              >
                {type === 'all' ? t.all : (type === 'recurring' ? t.recurring : t.manual)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="grid grid-cols-7 mb-6">
            {[t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayLogs = filteredLogs.filter(l => l.date === dateStr);
              const dayTodos = todos.filter(t => t.date === dateStr);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date(2023, 9, 9)); // Mock today

              return (
                <CalendarDay 
                  key={dateStr}
                  day={day}
                  dateStr={dateStr}
                  logs={dayLogs}
                  todos={dayTodos}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                />
              );
            })}
          </div>
        </div>
      </DndContext>

      {/* Monthly Stats Dashboard - Moved below calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0D1A16] border border-emerald-500/20 rounded-[32px] p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Clock className="w-32 h-32 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-emerald-500/40 uppercase tracking-widest mb-2">{t.monthlyTotal}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-bold text-emerald-400 tracking-tighter">{totalHours.toFixed(1)}</p>
            <p className="text-lg font-bold text-emerald-500/60 uppercase tracking-widest">{t.hours}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full h-1.5 bg-emerald-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${Math.min(100, (totalHours / 200) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="bg-[#0D1A16] border border-amber-500/20 rounded-[32px] p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <TrendingUp className="w-32 h-32 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-amber-500/40 uppercase tracking-widest mb-2">{t.average}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-bold text-amber-400 tracking-tighter">{averageHours}</p>
            <p className="text-lg font-bold text-amber-500/60 uppercase tracking-widest">{t.hoursPerDay}</p>
          </div>
          <p className="mt-4 text-xs font-medium text-amber-500/40 italic">Based on {filteredLogs.length} entries this month</p>
        </div>
      </div>

      {/* To-do Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">{t.todaysTasks}</h3>
        <div className="space-y-2">
          {todos.filter(todo => isSameDay(parseISO(todo.date), new Date(2023, 9, 9))).map(todo => (
            <button 
              key={todo.id}
              onClick={() => onToggleTodo(todo.id)}
              className="w-full bg-[#0D1A16] border border-emerald-900/30 rounded-2xl p-4 flex items-center gap-4 group"
            >
              {todo.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Circle className="w-6 h-6 text-emerald-900/50 group-hover:text-emerald-500/50" />
              )}
              <span className={cn("font-medium", todo.completed && "line-through text-emerald-900/50")}>
                {todo.task}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{t.recentLogs}</h3>
          <button className="text-emerald-400 text-sm font-bold hover:underline">{t.viewHistory}</button>
        </div>
        {logs.slice(0, 3).map(log => (
          <div key={log.id} className="bg-[#0D1A16] border border-emerald-900/30 rounded-[24px] p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-emerald-50">{format(parseISO(log.date), 'MMM dd, EEEE')}</p>
                <p className="text-xs text-emerald-500/60">{log.startTime} AM - {log.endTime} PM</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-emerald-50">{log.totalHours.toFixed(1)} {t.hours}</p>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider", log.isRecurring ? "text-amber-500" : "text-emerald-500/40")}>
                {log.isRecurring ? t.recurring : t.onTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CalendarDay: React.FC<{ 
  day: Date, 
  dateStr: string, 
  logs: DutyLog[], 
  todos: TodoItem[], 
  isCurrentMonth: boolean, 
  isToday: boolean 
}> = ({ day, dateStr, logs, todos, isCurrentMonth, isToday }) => {
  const { setNodeRef, isOver } = useSortable({ id: dateStr });

  const dayHours = logs.reduce((acc, l) => acc + l.totalHours, 0);
  const hasNightShift = logs.some(l => l.shift === 'Night');
  const hasPendingTodos = todos.some(t => !t.completed);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "aspect-square rounded-2xl flex flex-col items-center justify-between p-2 transition-all relative group overflow-hidden",
        !isCurrentMonth && "opacity-20",
        isToday ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/50" : "bg-[#142620] hover:bg-emerald-900/40 border border-emerald-900/20",
        isOver && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#050C0A]"
      )}
    >
      <div className="w-full flex justify-between items-start">
        <span className={cn("text-[10px] font-bold", isToday ? "text-black" : "text-emerald-500/40")}>{format(day, 'd')}</span>
        {hasPendingTodos && <div className={cn("w-1.5 h-1.5 rounded-full", isToday ? "bg-black" : "bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]")} />}
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1">
        {dayHours > 0 && (
          <span className={cn("text-xs font-black tracking-tighter", isToday ? "text-black" : "text-emerald-400")}>
            {dayHours.toFixed(1)}
          </span>
        )}
        {dayHours > 0 && (
          <span className={cn("text-[8px] font-bold uppercase tracking-widest", isToday ? "text-black/60" : "text-emerald-500/40")}>
            Hrs
          </span>
        )}
      </div>

      {/* Shift Indicators */}
      <div className="w-full flex gap-1 justify-center">
        {dayHours > 0 && !hasNightShift && <div className={cn("h-0.5 flex-1 rounded-full", isToday ? "bg-black/40" : "bg-emerald-500/40")} />}
        {hasNightShift && <div className={cn("h-0.5 flex-1 rounded-full", isToday ? "bg-black/40" : "bg-amber-500/40")} />}
      </div>

      {/* Drag handle for logs */}
      {logs.length > 0 && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[2px] rounded-2xl cursor-grab active:cursor-grabbing transition-opacity">
          <GripVertical className={cn("w-4 h-4", isToday ? "text-black" : "text-emerald-400")} />
        </div>
      )}
    </div>
  );
}

function LogView({ companies, onSave, t }: { companies: Company[], onSave: (log: Omit<DutyLog, 'id'>) => void, t: any }) {
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    companyId: companies[0]?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '17:00',
    breakMinutes: 60,
    shift: 'Day' as const,
    breakOverride: false
  });

  const selectedCompany = companies.find(c => c.id === formData.companyId);

  const handleSmartTranscription = async () => {
    if (!transcription.trim()) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract duty log details from this text: "${transcription}". 
        Return JSON with: date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), breakMinutes (number), shift (Day/Night).
        If not found, use defaults: today, 08:00, 17:00, 60, Day.`,
        config: { responseMimeType: "application/json" }
      });
      const result = await model;
      const data = JSON.parse(result.text);
      setFormData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalHours = useMemo(() => {
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    let diff = differenceInMinutes(end, start);
    if (diff < 0) diff += 24 * 60; // Handle overnight
    
    let breakMins = formData.breakMinutes;
    if (!formData.breakOverride && selectedCompany?.breakRules) {
      const hours = diff / 60;
      let ruleBreak = 0;
      selectedCompany.breakRules.forEach(rule => {
        if (hours >= rule.afterHours) {
          ruleBreak = Math.max(ruleBreak, rule.breakDurationMinutes);
        }
      });
      breakMins = ruleBreak;
    }

    return Math.max(0, (diff - breakMins) / 60);
  }, [formData, selectedCompany]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">{t.newDutyLog}</h2>
        <p className="text-emerald-500/60 font-medium">{t.logDescription}</p>
      </div>

      <div className="space-y-6">
        {/* AI Transcription */}
        <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-emerald-400 font-bold flex items-center gap-2">
              {t.smartTranscription}
              <Sparkles className="w-4 h-4" />
            </h3>
          </div>
          <textarea 
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder={t.aiPlaceholder}
            className="w-full h-24 bg-[#050C0A] border border-emerald-900/30 rounded-2xl p-4 text-emerald-50 placeholder:text-emerald-900/40 focus:border-emerald-500/50 outline-none transition-all resize-none"
          />
          <button 
            onClick={handleSmartTranscription}
            disabled={isProcessing || !transcription.trim()}
            className="w-full py-3 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold hover:bg-emerald-900/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? t.processing : t.processAI}
          </button>
        </div>

        {/* Manual Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6 col-span-full">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">{t.selectCompany}</label>
            <select 
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-transparent text-xl font-bold text-emerald-50 outline-none"
            >
              {companies.map(c => <option key={c.id} value={c.id} className="bg-[#0D1A16]">{c.name}</option>)}
            </select>
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">{t.date}</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-transparent text-lg font-bold text-emerald-50 outline-none" 
            />
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">{t.shift}</label>
            <div className="flex items-center gap-2 text-lg font-bold text-emerald-50">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <select 
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="bg-transparent outline-none"
              >
                <option value="Day" className="bg-[#0D1A16]">{t.dayShift}</option>
                <option value="Night" className="bg-[#0D1A16]">{t.nightShift}</option>
              </select>
            </div>
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">{t.clockIn}</label>
            <input 
              type="time" 
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-transparent text-3xl font-bold text-emerald-400 outline-none" 
            />
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">{t.clockOut}</label>
            <input 
              type="time" 
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full bg-transparent text-3xl font-bold text-amber-400 outline-none" 
            />
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6 col-span-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-50">{t.manualBreakOverride}</h4>
                <p className="text-xs text-emerald-500/40">{t.breakOverrideDesc}</p>
              </div>
              <button 
                onClick={() => setFormData({ ...formData, breakOverride: !formData.breakOverride })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  formData.breakOverride ? "bg-emerald-500" : "bg-emerald-900/30"
                )}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.breakOverride ? "right-1" : "left-1")} />
              </button>
            </div>
            {formData.breakOverride ? (
              <div className="flex items-center gap-4 bg-[#050C0A] p-4 rounded-2xl border border-emerald-900/20">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider">{t.durationMinutes}</p>
                  <input 
                    type="number" 
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent text-xl font-bold text-emerald-50 outline-none" 
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-900/20">
                <p className="text-xs text-emerald-500/60 italic">{t.autoBreakDesc}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <p className="text-emerald-500/60 font-medium">{t.estimatedTotal}</p>
          <p className="text-4xl font-bold text-emerald-400">
            {totalHours.toFixed(2).replace('.', ':')} <span className="text-sm font-medium text-emerald-500/60 uppercase">HRS</span>
          </p>
        </div>

          <button 
            onClick={() => onSave({ ...formData, totalHours, breakMinutes: formData.breakOverride ? formData.breakMinutes : 0 })}
            className="w-full py-6 rounded-[32px] flex items-center justify-center gap-3 text-black font-bold text-xl transition-transform hover:scale-[0.98]"
            style={{ 
              backgroundColor: selectedCompany?.color || '#10b981',
              boxShadow: `0 0 30px ${(selectedCompany?.color || '#10b981')}33`
            }}
          >
            <Save className="w-6 h-6" />
            {t.saveLog}
          </button>
      </div>
    </div>
  );
}

function RulesView({ company, onUpdate, t }: { company: Company, onUpdate: (c: Company) => void, t: any }) {
  const [activeTab, setActiveTab] = useState<'breaks' | 'recurring'>('breaks');

  const addBreakRule = () => {
    const newRule: BreakRule = { id: Math.random().toString(), afterHours: 4, breakDurationMinutes: 30 };
    onUpdate({ ...company, breakRules: [...(company.breakRules || []), newRule] });
  };

  const addRecurringShift = () => {
    const newShift: RecurringShift = { 
      id: Math.random().toString(), 
      companyId: company.id, 
      startTime: '09:00', 
      endTime: '17:00', 
      shift: 'Day', 
      frequency: 'weekly', 
      daysOfWeek: [1, 2, 3, 4, 5] 
    };
    onUpdate({ ...company, recurringShifts: [...(company.recurringShifts || []), newShift] });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">{t.settingsAndRules}</h2>
        <p className="text-emerald-500/60 font-medium">{t.rulesDescription} {company.name}</p>
      </div>

      <div className="flex bg-[#0D1A16] p-1 rounded-2xl border border-emerald-900/30">
        <button 
          onClick={() => setActiveTab('breaks')}
          className={cn("flex-1 py-3 rounded-xl font-bold transition-all", activeTab === 'breaks' ? "text-black shadow-lg" : "text-emerald-500/60")}
          style={activeTab === 'breaks' ? { backgroundColor: company.color } : {}}
        >
          {t.breakRules}
        </button>
        <button 
          onClick={() => setActiveTab('recurring')}
          className={cn("flex-1 py-3 rounded-xl font-bold transition-all", activeTab === 'recurring' ? "text-black shadow-lg" : "text-emerald-500/60")}
          style={activeTab === 'recurring' ? { backgroundColor: company.color } : {}}
        >
          {t.recurringShifts}
        </button>
      </div>

      {activeTab === 'breaks' && (
        <div className="space-y-4">
          {company.breakRules?.map((rule, idx) => (
            <div key={rule.id} className="bg-[#0D1A16] border border-emerald-900/30 rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500/40 uppercase tracking-widest">{t.rule} #{idx + 1}</span>
                <button 
                  onClick={() => onUpdate({ ...company, breakRules: company.breakRules?.filter(r => r.id !== rule.id) })}
                  className="text-rose-500 text-xs font-bold"
                >
                  {t.delete}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1 block">{t.workTimeHours}</label>
                  <input 
                    type="number" 
                    value={rule.afterHours}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdate({ ...company, breakRules: company.breakRules?.map(r => r.id === rule.id ? { ...r, afterHours: val } : r) });
                    }}
                    className="w-full bg-[#050C0A] border border-emerald-900/20 rounded-xl p-3 text-emerald-50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1 block">{t.breakMinutes}</label>
                  <input 
                    type="number" 
                    value={rule.breakDurationMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onUpdate({ ...company, breakRules: company.breakRules?.map(r => r.id === rule.id ? { ...r, breakDurationMinutes: val } : r) });
                    }}
                    className="w-full bg-[#050C0A] border border-emerald-900/20 rounded-xl p-3 text-emerald-50 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addBreakRule}
            className="w-full py-4 border-2 border-dashed border-emerald-900/30 rounded-[24px] flex items-center justify-center gap-2 font-bold transition-all"
            style={{ color: company.color, borderColor: `${company.color}33` }}
          >
            <Plus className="w-5 h-5" />
            {t.addNewBreakRule}
          </button>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="space-y-4">
          {company.recurringShifts?.map((shift, idx) => (
            <div key={shift.id} className="bg-[#0D1A16] border border-emerald-900/30 rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500/40 uppercase tracking-widest">{t.shiftNum} #{idx + 1}</span>
                <button 
                  onClick={() => onUpdate({ ...company, recurringShifts: company.recurringShifts?.filter(s => s.id !== shift.id) })}
                  className="text-rose-500 text-xs font-bold"
                >
                  {t.delete}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1 block">{t.start}</label>
                  <input type="time" value={shift.startTime} className="w-full bg-[#050C0A] border border-emerald-900/20 rounded-xl p-3 text-emerald-50 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1 block">{t.end}</label>
                  <input type="time" value={shift.endTime} className="w-full bg-[#050C0A] border border-emerald-900/20 rounded-xl p-3 text-emerald-50 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">{t.frequency}</label>
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly'].map(f => (
                    <button 
                      key={f}
                      onClick={() => onUpdate({ ...company, recurringShifts: company.recurringShifts?.map(s => s.id === shift.id ? { ...s, frequency: f as any } : s) })}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold border transition-all", shift.frequency === f ? "bg-emerald-500 border-emerald-500 text-black" : "border-emerald-900/30 text-emerald-500/60")}
                    >
                      {f === 'daily' ? t.daily : f === 'weekly' ? t.weekly : t.monthly}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addRecurringShift}
            className="w-full py-4 border-2 border-dashed border-emerald-900/30 rounded-[24px] flex items-center justify-center gap-2 font-bold transition-all"
            style={{ color: company.color, borderColor: `${company.color}33` }}
          >
            <Repeat className="w-5 h-5" />
            {t.addNewRecurringShift}
          </button>
        </div>
      )}
    </div>
  );
}

function HistoryView({ logs, companies, t }: { logs: DutyLog[], companies: Company[], t: any }) {
  const filteredLogs = logs.filter(log => companies.some(c => c.id === log.companyId));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {filteredLogs.length > 0 && (
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">{t.history}</h2>
          <p className="text-emerald-500/60 font-medium">{t.historyDescription}</p>
        </div>
      )}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-[#0D1A16] border border-emerald-900/30 rounded-[32px]">
            <History className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
            <p className="text-emerald-500/40 font-bold uppercase tracking-widest">No logs found</p>
            <p className="text-emerald-500/20 text-xs mt-2">Add duty logs to see your history here</p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const company = companies.find(c => c.id === log.companyId);
            return (
              <div key={log.id} className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: company?.color || '#10b981' }}
                    >
                      {company?.logo ? (
                        <img src={company.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <CompanyIcon icon={company?.icon || 'building'} className="w-6 h-6 text-black" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-emerald-50">{company?.name}</h4>
                      <p className="text-xs font-bold text-emerald-500/40 uppercase tracking-widest">{company?.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">{log.totalHours.toFixed(1)}{t.h}</p>
                    <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider">{log.shift === 'Day' ? t.dayShift : t.nightShift}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-emerald-900/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500/40" />
                    <span className="text-sm font-medium text-emerald-500/60">{format(parseISO(log.date), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500/40" />
                    <span className="text-sm font-medium text-emerald-500/60">{log.startTime} - {log.endTime}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ProfileView({ 
  language, 
  setLanguage, 
  t,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userAvatar,
  setUserAvatar
}: { 
  language: Language, 
  setLanguage: (l: Language) => void, 
  t: any,
  userName: string,
  setUserName: (n: string) => void,
  userEmail: string,
  setUserEmail: (e: string) => void,
  userAvatar: string | null,
  setUserAvatar: (a: string | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="relative inline-block group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-32 h-32 rounded-full bg-emerald-900/40 border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden mx-auto transition-all group-hover:border-emerald-500/50">
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-20 h-20 text-emerald-400" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#050C0A]">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
      </div>

      <div className="space-y-2">
        {isEditing ? (
          <div className="space-y-4 max-w-xs mx-auto">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#0D1A16] border border-emerald-500/30 rounded-xl px-4 py-2 text-center text-2xl font-bold focus:outline-none focus:border-emerald-500"
              placeholder={t.name}
            />
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-[#0D1A16] border border-emerald-500/30 rounded-xl px-4 py-2 text-center text-emerald-500/60 focus:outline-none focus:border-emerald-500"
              placeholder={t.email}
            />
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-emerald-500 text-black px-6 py-2 rounded-xl font-bold text-sm w-full"
            >
              {t.save}
            </button>
          </div>
        ) : (
          <div className="group cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{userName}</h2>
              <Edit2 className="w-4 h-4 text-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-emerald-500/60 font-medium">{userEmail}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 text-left">
        <div className="w-full p-4 bg-[#0D1A16] border border-emerald-900/30 rounded-[20px] flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold text-sm">{t.language}</span>
          </div>
          <div className="flex bg-[#142620] p-1 rounded-lg border border-emerald-900/30">
            <button 
              onClick={() => setLanguage('bn')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                language === 'bn' ? "bg-emerald-500 text-black shadow-lg" : "text-emerald-500/40 hover:text-emerald-400"
              )}
            >
              বাংলা
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                language === 'en' ? "bg-emerald-500 text-black shadow-lg" : "text-emerald-500/40 hover:text-emerald-400"
              )}
            >
              EN
            </button>
          </div>
        </div>
        <button className="w-full p-4 bg-[#0D1A16] border border-emerald-900/30 rounded-[20px] flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold text-sm">{t.accountSettings}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-500/40" />
        </button>
        <button className="w-full p-4 bg-[#0D1A16] border border-emerald-900/30 rounded-[20px] flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold text-sm">{t.exportReport}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-500/40" />
        </button>
      </div>
    </div>
  );
}
