import React, { useState, useEffect, useMemo } from 'react';
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
  LayoutGrid
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
  differenceInMinutes
} from 'date-fns';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Company, DutyLog, View } from './types';

// --- Mock Data ---
const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Dummy Company', location: 'MEDICAL CENTER ALPHA', currentHours: 48.5, status: 'In Progress', icon: 'building' },
  { id: '2', name: 'Dummy Company', location: 'GLOBAL LOGISTICS HUB', currentHours: 120.0, status: 'Finalized', icon: 'factory' },
  { id: '3', name: 'Dummy Company', location: 'TECH INNOVATION LAB', currentHours: 0.0, status: 'Onboarding', icon: 'home' },
];

const MOCK_LOGS: DutyLog[] = [
  { id: '1', companyId: '1', date: '2023-10-06', startTime: '08:30', endTime: '18:30', breakMinutes: 0, totalHours: 10.0, shift: 'Day' },
  { id: '2', companyId: '1', date: '2023-10-05', startTime: '09:00', endTime: '17:30', breakMinutes: 0, totalHours: 8.5, shift: 'Day' },
  { id: '3', companyId: '1', date: '2023-10-04', startTime: '09:00', endTime: '17:00', breakMinutes: 0, totalHours: 8.0, shift: 'Day' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('workspace');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<DutyLog[]>(MOCK_LOGS);
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 9, 1)); // Oct 2023 for mock consistency

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const handleAddLog = (newLog: Omit<DutyLog, 'id'>) => {
    const logWithId = { ...newLog, id: Math.random().toString(36).substr(2, 9) };
    setLogs([logWithId, ...logs]);
    setCurrentView('workspace');
  };

  return (
    <div className="min-h-screen bg-[#050C0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#050C0A]/80 backdrop-blur-md border-b border-emerald-900/20 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {selectedCompanyId && currentView === 'workspace' ? (
            <button 
              onClick={() => setSelectedCompanyId(null)}
              className="p-2 hover:bg-emerald-900/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
            </button>
          ) : (
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-black" />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight text-emerald-50">
            {selectedCompanyId && currentView === 'workspace' ? selectedCompany?.name : 'DutyFlow'}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
          <User className="w-6 h-6 text-emerald-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-6 max-w-2xl mx-auto">
        {currentView === 'workspace' && !selectedCompanyId && (
          <WorkspaceView companies={companies} onSelect={setSelectedCompanyId} />
        )}
        {currentView === 'workspace' && selectedCompanyId && (
          <CalendarView 
            company={selectedCompany!} 
            logs={logs.filter(l => l.companyId === selectedCompanyId)}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}
        {currentView === 'log' && (
          <LogView companies={companies} onSave={handleAddLog} />
        )}
        {currentView === 'history' && (
          <HistoryView logs={logs} companies={companies} />
        )}
        {currentView === 'profile' && (
          <ProfileView />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0A1411]/90 backdrop-blur-xl border-t border-emerald-900/30 flex items-center justify-around px-4 z-50">
        <NavButton 
          active={currentView === 'log'} 
          onClick={() => setCurrentView('log')} 
          icon={<Plus className="w-6 h-6" />} 
          label="লগ" 
        />
        <NavButton 
          active={currentView === 'workspace'} 
          onClick={() => { setCurrentView('workspace'); setSelectedCompanyId(null); }} 
          icon={<LayoutGrid className="w-6 h-6" />} 
          label="ওয়ার্কস্পেস" 
        />
        <NavButton 
          active={currentView === 'history'} 
          onClick={() => setCurrentView('history')} 
          icon={<History className="w-6 h-6" />} 
          label="ইতিহাস" 
        />
        <NavButton 
          active={currentView === 'profile'} 
          onClick={() => setCurrentView('profile')} 
          icon={<User className="w-6 h-6" />} 
          label="প্রোফাইল" 
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

function WorkspaceView({ companies, onSelect }: { companies: Company[], onSelect: (id: string) => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">আপনার ওয়ার্কস্পেস</h2>
        <p className="text-emerald-500/60 font-medium">আপনার পেশাদার পরিবেশ এবং ট্র্যাক করা ঘন্টা পরিচালনা করুন।</p>
      </div>

      <div className="space-y-4">
        {companies.map(company => (
          <button
            key={company.id}
            onClick={() => onSelect(company.id)}
            className="w-full text-left p-6 bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] hover:border-emerald-500/40 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Building2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-50">{company.name}</h3>
                  <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest">{company.location}</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1">বর্তমান পিরিয়ড</p>
                    <p className="text-lg font-bold text-emerald-400">{company.currentHours.toFixed(1)} ঘণ্টা</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-1">স্ট্যাটাস</p>
                    <p className="text-lg font-bold text-amber-400">{company.status}</p>
                  </div>
                </div>
              </div>
              <Building2 className="w-24 h-24 text-emerald-900/10 absolute -right-4 -top-4" />
            </div>
          </button>
        ))}

        <button className="w-full py-6 bg-emerald-500 rounded-[32px] flex items-center justify-center gap-3 text-black font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[0.98] transition-transform">
          <Plus className="w-6 h-6" />
          নতুন কোম্পানি যোগ করুন
        </button>
      </div>
    </div>
  );
}

function CalendarView({ company, logs, currentMonth, onMonthChange }: { company: Company, logs: DutyLog[], currentMonth: Date, onMonthChange: (d: Date) => void }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const totalHours = logs.reduce((acc, log) => acc + log.totalHours, 0);
  const averageHours = logs.length > 0 ? (totalHours / logs.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">{format(currentMonth, 'MMMM yyyy')}</p>
          <h2 className="text-3xl font-bold tracking-tight">ডিউটি ক্যালেন্ডার</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onMonthChange(subMonths(currentMonth, 1))} className="p-2 bg-emerald-900/20 rounded-xl hover:bg-emerald-900/40 transition-colors">
            <ChevronLeft className="w-6 h-6 text-emerald-400" />
          </button>
          <button onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-2 bg-emerald-900/20 rounded-xl hover:bg-emerald-900/40 transition-colors">
            <ChevronRight className="w-6 h-6 text-emerald-400" />
          </button>
        </div>
      </div>

      <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
        <div className="grid grid-cols-7 mb-4">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-emerald-500/40 tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayLogs = logs.filter(l => isSameDay(parseISO(l.date), day));
            const dayHours = dayLogs.reduce((acc, l) => acc + l.totalHours, 0);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date(2023, 9, 9)); // Mock today

            return (
              <div 
                key={idx} 
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all relative",
                  !isCurrentMonth && "opacity-20",
                  isToday ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-[#142620] hover:bg-emerald-900/40"
                )}
              >
                <span className="text-xs font-bold">{format(day, 'd')}</span>
                {dayHours > 0 && (
                  <span className={cn("text-[8px] font-bold", isToday ? "text-black/60" : "text-emerald-400")}>
                    {dayHours}h
                  </span>
                )}
                {isToday && <span className="text-[6px] font-black uppercase tracking-tighter mt-0.5">TODAY</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
          <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2">মাসের মোট</p>
          <p className="text-4xl font-bold text-emerald-400">{totalHours.toFixed(1)} <span className="text-sm font-medium text-emerald-500/60">ঘণ্টা</span></p>
        </div>
        <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
          <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2">গড়</p>
          <p className="text-4xl font-bold text-amber-400">{averageHours} <span className="text-sm font-medium text-amber-500/60">ঘণ্টা/দিন</span></p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">সাম্প্রতিক লগ</h3>
          <button className="text-emerald-400 text-sm font-bold hover:underline">ইতিহাস দেখুন</button>
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
              <p className="text-xl font-bold text-emerald-50">{log.totalHours.toFixed(1)} ঘণ্টা</p>
              <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider">সময়মতো</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogView({ companies, onSave }: { companies: Company[], onSave: (log: Omit<DutyLog, 'id'>) => void }) {
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    companyId: companies[0]?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '17:00',
    breakMinutes: 60,
    shift: 'Day' as const,
    breakOverride: true
  });

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
    if (formData.breakOverride) diff -= formData.breakMinutes;
    return Math.max(0, diff / 60);
  }, [formData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">নতুন ডিউটি লগ</h2>
        <p className="text-emerald-500/60 font-medium">আপনার ম্যানুয়াল ডিউটি এন্ট্রিগুলি নির্ভুলতার সাথে রেকর্ড করুন।</p>
      </div>

      <div className="space-y-6">
        {/* AI Transcription */}
        <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-emerald-400 font-bold flex items-center gap-2">
              স্মার্ট ট্রান্সক্রিপশন
              <Sparkles className="w-4 h-4" />
            </h3>
          </div>
          <textarea 
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="যেমন: 'আজ আমি ডামি কোম্পানিতে সকাল ৮টা থেকে বিকেল ৫টা পর্যন্ত কাজ করেছি...'"
            className="w-full h-24 bg-[#050C0A] border border-emerald-900/30 rounded-2xl p-4 text-emerald-50 placeholder:text-emerald-900/40 focus:border-emerald-500/50 outline-none transition-all resize-none"
          />
          <button 
            onClick={handleSmartTranscription}
            disabled={isProcessing || !transcription.trim()}
            className="w-full py-3 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold hover:bg-emerald-900/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? 'প্রসেসিং হচ্ছে...' : 'এআই দিয়ে পূরণ করুন'}
          </button>
        </div>

        {/* Manual Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6 col-span-full">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">কোম্পানি নির্বাচন করুন</label>
            <select 
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-transparent text-xl font-bold text-emerald-50 outline-none"
            >
              {companies.map(c => <option key={c.id} value={c.id} className="bg-[#0D1A16]">{c.name}</option>)}
            </select>
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">তারিখ</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-transparent text-lg font-bold text-emerald-50 outline-none" 
            />
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">শিফট</label>
            <div className="flex items-center gap-2 text-lg font-bold text-emerald-50">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <select 
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="bg-transparent outline-none"
              >
                <option value="Day" className="bg-[#0D1A16]">ডে শিফট</option>
                <option value="Night" className="bg-[#0D1A16]">নাইট শিফট</option>
              </select>
            </div>
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">ক্লক-ইন</label>
            <input 
              type="time" 
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-transparent text-3xl font-bold text-emerald-400 outline-none" 
            />
          </div>

          <div className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
            <label className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider mb-2 block">ক্লক-আউট</label>
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
                <h4 className="font-bold text-emerald-50">ম্যানুয়াল ব্রেক ওভাররাইড</h4>
                <p className="text-xs text-emerald-500/40">মোট ঘণ্টা থেকে ব্রেক সময় বাদ দিন</p>
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
            {formData.breakOverride && (
              <div className="flex items-center gap-4 bg-[#050C0A] p-4 rounded-2xl border border-emerald-900/20">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider">সময়কাল (মিনিট)</p>
                  <input 
                    type="number" 
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent text-xl font-bold text-emerald-50 outline-none" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <p className="text-emerald-500/60 font-medium">আনুমানিক মোট ডিউটি</p>
          <p className="text-4xl font-bold text-emerald-400">
            {totalHours.toFixed(2).replace('.', ':')} <span className="text-sm font-medium text-emerald-500/60 uppercase">HRS</span>
          </p>
        </div>

        <button 
          onClick={() => onSave({ ...formData, totalHours })}
          className="w-full py-6 bg-emerald-500 rounded-[32px] flex items-center justify-center gap-3 text-black font-bold text-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[0.98] transition-transform"
        >
          <Save className="w-6 h-6" />
          লগ সেভ করুন
        </button>
      </div>
    </div>
  );
}

function HistoryView({ logs, companies }: { logs: DutyLog[], companies: Company[] }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">ইতিহাস</h2>
        <p className="text-emerald-500/60 font-medium">আপনার সমস্ত ডিউটি লগের বিস্তারিত তালিকা।</p>
      </div>
      <div className="space-y-4">
        {logs.map(log => {
          const company = companies.find(c => c.id === log.companyId);
          return (
            <div key={log.id} className="bg-[#0D1A16] border border-emerald-900/30 rounded-[32px] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-emerald-50">{company?.name}</h4>
                    <p className="text-xs font-bold text-emerald-500/40 uppercase tracking-widest">{company?.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">{log.totalHours.toFixed(1)}h</p>
                  <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-wider">{log.shift} Shift</p>
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
        })}
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="relative inline-block">
        <div className="w-32 h-32 rounded-full bg-emerald-900/40 border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden mx-auto">
          <User className="w-20 h-20 text-emerald-400" />
        </div>
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#050C0A]">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">আকাশ চন্দ্র</h2>
        <p className="text-emerald-500/60 font-medium">akashchondro2@gmail.com</p>
      </div>
      <div className="grid grid-cols-1 gap-4 text-left">
        <button className="w-full p-6 bg-[#0D1A16] border border-emerald-900/30 rounded-[24px] flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <LayoutGrid className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold">অ্যাকাউন্ট সেটিংস</span>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-500/40" />
        </button>
        <button className="w-full p-6 bg-[#0D1A16] border border-emerald-900/30 rounded-[24px] flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <History className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold">ডিউটি রিপোর্ট এক্সপোর্ট</span>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-500/40" />
        </button>
      </div>
    </div>
  );
}
