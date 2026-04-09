/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Filter, 
  X, 
  User, 
  UserPlus,
  Send, 
  Bot, 
  Scale, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  Gavel,
  Music,
  Volume2,
  Upload,
  CheckSquare,
  Check,
  HelpCircle,
  Zap,
  Database,
  Download,
  Play,
  Receipt,
  Wallet,
  TrendingDown,
  Printer,
  CreditCard,
  PlusCircle,
  BarChart3,
  Shield,
  Star,
  Award,
  Lock,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Keyboard } from '@capacitor/keyboard';
import { format, parseISO, isToday, isPast, isFuture, addMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Case, Client, Session, Message, CaseStatus, TimelineEvent, Task, LawyerProfile, Payment } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'صلاح محمد الجوفي', phone: '7777716573', email: 'salah@example.com' },
  { id: '2', name: 'أحمد علي حسن', phone: '7771234567', email: 'ahmed@example.com' },
];

const INITIAL_CASES: Case[] = [
  {
    id: '1',
    caseNumber: '1',
    title: 'القتل العمد',
    type: 'جنائية',
    court: 'المشنة',
    clientId: '1',
    clientName: 'صلاح محمد الجوفي',
    clientPhone: '7777716573',
    clientEmail: 'salah@example.com',
    status: 'نشطة',
    startDate: '2026-03-18',
    totalFees: 10000,
    paidFees: 4000,
    progress: 33,
    priority: 'عالية',
    timeline: [
      { id: 't1', date: '2026-03-18', title: 'تم استلام القضية', description: 'استلام ملف القضية والوكالة', isCompleted: true },
      { id: 't2', date: '2026-03-20', title: 'تم جدولة 1 جلسة', description: 'المرافعة جارية أمام المحكمة', isCompleted: false },
      { id: 't3', date: '2026-03-25', title: 'في انتظار إتمام التحصيل', description: 'لم يكتمل التحصيل بعد', isCompleted: false },
    ],
    tasks: []
  },
  {
    id: '2',
    caseNumber: '2',
    title: 'نزاع عقاري',
    type: 'مدنية',
    court: 'غرب إب',
    clientId: '2',
    clientName: 'أحمد علي حسن',
    clientPhone: '7771234567',
    clientEmail: 'ahmed@example.com',
    status: 'معلقة',
    startDate: '2026-02-10',
    totalFees: 5000,
    paidFees: 2000,
    progress: 60,
    priority: 'متوسطة',
    timeline: [
      { id: 't1', date: '2026-02-10', title: 'بدء القضية', description: 'تقديم عريضة الدعوى', isCompleted: true },
      { id: 't2', date: '2026-02-25', title: 'رد المدعى عليه', description: 'استلام الرد الكتابي', isCompleted: true },
    ],
    tasks: []
  },
  {
    id: '3',
    caseNumber: '3',
    title: 'قضية طلاق',
    type: 'أحوال شخصية',
    court: 'محكمة الاستئناف',
    clientId: '1',
    clientName: 'صلاح محمد الجوفي',
    clientPhone: '7777716573',
    clientEmail: 'salah@example.com',
    status: 'مغلقة',
    startDate: '2025-12-05',
    totalFees: 3000,
    paidFees: 3000,
    progress: 100,
    priority: 'منخفضة',
    timeline: [
      { id: 't1', date: '2025-12-05', title: 'تقديم الطلب', description: 'بدء الإجراءات القانونية', isCompleted: true },
      { id: 't2', date: '2026-01-15', title: 'صدور الحكم', description: 'تم الفصل في القضية', isCompleted: true },
    ],
    tasks: []
  }
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 's1',
    caseId: '1',
    caseTitle: 'القتل العمد',
    clientId: '1',
    clientName: 'صلاح محمد الجوفي',
    clientPhone: '7777716573',
    clientEmail: 'salah@example.com',
    date: '2026-03-18',
    time: '10:00',
    description: 'جلسة مرافعة أولى'
  }
];

const CHART_DATA = [
  { name: 'الأحد', cases: 20 },
  { name: 'الاثنين', cases: 40 },
  { name: 'الثلاثاء', cases: 35 },
  { name: 'الأربعاء', cases: 60 },
  { name: 'الخميس', cases: 50 },
  { name: 'الجمعة', cases: 70 },
  { name: 'السبت', cases: 85 },
];

// Pre-defined silent beep to unlock audio context reliably
const SILENT_BEEP = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

const PREDEFINED_SOUNDS = [
  { id: 'emergency', name: 'تنبيه طوارئ صاخب جداً 🚨', url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3' },
  { id: 'professional', name: 'نغمة مكتب محاماة (رسمية)', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'samsung', name: 'نغمة سامسونج (محاكاة)', url: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3' },
  { id: 'classic', name: 'جرس محكمة كلاسيكي', url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3' },
  { id: 'digital', name: 'تنبيه رقمي ذكي', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { id: 'modern', name: 'نغمة حديثة (هادئة)', url: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3' }
];

// --- IndexedDB Storage for Large Files (Audio) ---
const DB_NAME = 'LawyerAppDB';
const STORE_NAME = 'audioStore';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = () => reject(request.error);
  });
};

const saveAudioToDB = async (key: string, base64Str: string): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(base64Str, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch(e) { console.error(e); return false; }
};

const getAudioFromDB = async (key: string): Promise<string | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch(e) { console.error(e); return null; }
};

const deleteAudioFromDB = async (key: string): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch(e) { console.error(e); return false; }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('lawyer_is_logged_in') === 'true';
  });
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fingerprintEnabled, setFingerprintEnabled] = useState(() => {
    return localStorage.getItem('lawyer_fingerprint_enabled') === 'true';
  });

  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('lawyer_credentials');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = () => {
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('يرجى إدخال البريد أو رقم الهاتف وكلمة المرور');
      return;
    }

    if (!credentials) {
      // First login - save these credentials
      const newCreds = { identifier: loginIdentifier.trim(), password: loginPassword.trim() };
      setCredentials(newCreds);
      localStorage.setItem('lawyer_credentials', JSON.stringify(newCreds));
      setIsLoggedIn(true);
      sessionStorage.setItem('lawyer_is_logged_in', 'true');
      setLoginError('');
      return;
    }

    if (loginIdentifier.trim() === credentials.identifier && loginPassword.trim() === credentials.password) {
      setIsLoggedIn(true);
      sessionStorage.setItem('lawyer_is_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('المعرف أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('lawyer_is_logged_in');
  };

  const handleFingerprintLogin = () => {
    // Simulate biometric prompt for web
    // In a real mobile app/PWA, you'd use WebAuthn API or native bridges
    setTimeout(() => {
      // Simulate success
      setIsLoggedIn(true);
      sessionStorage.setItem('lawyer_is_logged_in', 'true');
      setLoginError('');
    }, 800);
  };

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100dvh');

  useEffect(() => {
    // 1. Web visualViewport detection (Works in Chrome Android Browser)
    const handleViewportResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.8);
      } else {
        setViewportHeight(`${window.innerHeight}px`);
        setIsKeyboardOpen(window.innerHeight < window.screen.height * 0.8);
      }
    };
    
    // Set initial
    handleViewportResize();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    } else {
      window.addEventListener('resize', handleViewportResize);
    }

    // 2. Capacitor Custom Native Fallback 
    let showListener: any, hideListener: any;
    try {
      showListener = Keyboard.addListener('keyboardWillShow', info => {
        setIsKeyboardOpen(true);
      });
      hideListener = Keyboard.addListener('keyboardWillHide', () => {
        setIsKeyboardOpen(false);
      });
    } catch (e) {
      console.log('Not running in native capacitor');
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      } else {
        window.addEventListener('resize', handleViewportResize);
      }
      try {
        if (showListener) showListener.then((l: any) => l.remove());
        if (hideListener) hideListener.then((l: any) => l.remove());
      } catch (e) {}
    };
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('lawyer_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('lawyer_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('lawyer_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('lawyer_payments');
    if (saved) return JSON.parse(saved);
    // Generate initial payments from existing cases
    return [
      { id: 'p1', caseId: '1', amount: 2000, date: '2026-03-18', time: '10:30', note: 'دفعة أولى عند التوكيل', type: 'دفعة' },
      { id: 'p2', caseId: '1', amount: 2000, date: '2026-03-25', time: '14:00', note: 'دفعة ثانية', type: 'دفعة' },
      { id: 'p3', caseId: '2', amount: 2000, date: '2026-02-10', time: '09:00', note: 'دفعة أولى', type: 'دفعة' },
      { id: 'p4', caseId: '3', amount: 3000, date: '2025-12-05', time: '11:00', note: 'سداد كامل', type: 'دفعة' },
    ] as Payment[];
  });

  const [selectedClientStatement, setSelectedClientStatement] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [showAddCase, setShowAddCase] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showNotificationsBox, setShowNotificationsBox] = useState(false);

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [alarmSession, setAlarmSession] = useState<Session | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  const notificationsList = useMemo(() => {
    const list: any[] = [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    cases.forEach(c => {
      (c.tasks || []).forEach(t => {
        if (!t.isCompleted) {
          list.push({ type: 'task', id: t.id, title: t.title, subtitle: `قضية: ${c.title}`, date: t.dueDate });
        }
      });
    });
    sessions.forEach(s => {
      if (s.date <= todayStr) {
        list.push({ type: 'session', id: s.id, title: s.description || 'موعد جلسة', subtitle: `قضية: ${s.caseTitle}`, date: s.date });
      }
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cases, sessions]);
  const [triggeredSessions, setTriggeredSessions] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('lawyer_triggered_sessions');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [triggeredTasks, setTriggeredTasks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('lawyer_triggered_tasks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [selectedSound, setSelectedSound] = useState<string>(PREDEFINED_SOUNDS[0].url);
  const [customSound, setCustomSound] = useState<string | null>(null);

  useEffect(() => {
    const loadAudioFromDB = async () => {
      const dbCustom = await getAudioFromDB('lawyer_custom_sound');
      if (dbCustom) setCustomSound(dbCustom);

      const savedSelection = localStorage.getItem('lawyer_selected_sound');
      if (savedSelection === 'CUSTOM_DB') {
        const dbSelected = await getAudioFromDB('lawyer_selected_sound');
        if (dbSelected) {
          setSelectedSound(dbSelected);
        } else {
          setSelectedSound(PREDEFINED_SOUNDS[0].url);
        }
      } else if (savedSelection) {
        if (savedSelection.includes('pixabay.com') && !savedSelection.includes('download')) {
          setSelectedSound(PREDEFINED_SOUNDS[0].url);
        } else {
          setSelectedSound(savedSelection);
        }
      }
    };
    loadAudioFromDB();
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [caseFilters, setCaseFilters] = useState({
    status: 'الكل',
    type: 'الكل'
  });
  const [sessionFilters, setSessionFilters] = useState({
    status: 'الكل',
    startDate: '',
    endDate: ''
  });
  const [hasInteracted, setHasInteracted] = useState(() => {
    return localStorage.getItem('lawyer_has_interacted') === 'true';
  });
  const [showWelcome, setShowWelcome] = useState(!hasInteracted);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Notification Preferences State
  const [notifyOnTaskAssignment, setNotifyOnTaskAssignment] = useState(() => {
    const saved = localStorage.getItem('lawyer_notify_task_assignment');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [notifyOnTaskDueDate, setNotifyOnTaskDueDate] = useState(() => {
    const saved = localStorage.getItem('lawyer_notify_task_due_date');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile>(() => {
    const saved = localStorage.getItem('lawyer_profile');
    return saved ? JSON.parse(saved) : {
      name: 'المحامي محمد الكامل',
      title: 'محامي ومستشار قانوني',
      email: 'alkamelabdulaziz52@gmail.com',
      phone: '7777716573',
      address: 'اليمن - إب - شارع العدين',
      specialization: 'القانون الجنائي والمدني',
      experience: 'أكثر من 10 سنوات في المحاماة والقضاء',
      bio: 'محامي متخصص في القضايا الجنائية والمدنية، أسعى دائماً لتحقيق العدالة وتقديم أفضل الاستشارات القانونية لعملائي.',
      profilePicture: 'https://picsum.photos/seed/lawyer/200/200',
      stats: {
        casesCount: '124',
        successRate: '98%',
        years: '10+',
        wonCases: '92',
        activeCases: '18',
        hoursLogged: '1,240',
        clientSatisfaction: '4.9/5'
      }
    };
  });

  const [alarmAudioVolume, setAlarmAudioVolume] = useState(() => {
    return Number(localStorage.getItem('lawyer_alarm_volume')) || 1.0;
  });

  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesized Alarm Engine (Works Offline/APK)
  const playSynthesizedAlarm = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const playBeep = (time: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(alarmAudioVolume * 0.5, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    // Create a professional pulsing alarm pattern
    const now = ctx.currentTime;
    for (let i = 0; i < 10; i++) {
      const start = now + (i * 0.5);
      playBeep(start, 880, 0.2);
      playBeep(start + 0.1, 440, 0.2);
    }
  }, [alarmAudioVolume]);

  // Data Management (Backup/Restore)
  const exportData = () => {
    const data = {
      clients,
      cases,
      sessions,
      lawyerProfile,
      settings: {
        selectedSound,
        alarmAudioVolume,
        notifyOnTaskAssignment,
        notifyOnTaskDueDate
      },
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawyer_system_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.clients) setClients(data.clients);
        if (data.cases) setCases(data.cases);
        if (data.sessions) setSessions(data.sessions);
        if (data.lawyerProfile) setLawyerProfile(data.lawyerProfile);
        alert("تم استعادة البيانات بنجاح!");
      } catch (err) {
        alert("خطأ في ملف النسخة الاحتياطية");
      }
    };
    reader.readAsText(file);
  };

  // AI Consultant State
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('lawyer_ai_messages');
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'أهلاً بك يا سيادة المحامي محمد الكامل. أنا مساعدك القانوني الذكي، بروفيسور في القضاء وجميع أنواع القوانين. كيف يمكنني مساعدتك اليوم في استشاراتك القانونية؟' }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Persistence Logic
  useEffect(() => {
    localStorage.setItem('lawyer_ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('lawyer_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('lawyer_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('lawyer_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('lawyer_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('lawyer_triggered_sessions', JSON.stringify(Array.from(triggeredSessions)));
  }, [triggeredSessions]);

  useEffect(() => {
    localStorage.setItem('lawyer_triggered_tasks', JSON.stringify(Array.from(triggeredTasks)));
  }, [triggeredTasks]);

  useEffect(() => {
    if (selectedSound.length > 200) {
      localStorage.setItem('lawyer_selected_sound', 'CUSTOM_DB');
      saveAudioToDB('lawyer_selected_sound', selectedSound);
    } else {
      localStorage.setItem('lawyer_selected_sound', selectedSound);
    }
  }, [selectedSound]);

  useEffect(() => {
    if (customSound) {
      saveAudioToDB('lawyer_custom_sound', customSound);
    } else {
      deleteAudioFromDB('lawyer_custom_sound');
    }
  }, [customSound]);

  useEffect(() => {
    localStorage.setItem('lawyer_notify_task_assignment', JSON.stringify(notifyOnTaskAssignment));
  }, [notifyOnTaskAssignment]);

  useEffect(() => {
    localStorage.setItem('lawyer_notify_task_due_date', JSON.stringify(notifyOnTaskDueDate));
  }, [notifyOnTaskDueDate]);

  useEffect(() => {
    localStorage.setItem('lawyer_profile', JSON.stringify(lawyerProfile));
  }, [lawyerProfile]);

  const stopAlarm = useCallback(async () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      // Resume background silent loop to keep app alive for the next alarm!
      alarmAudioRef.current.src = SILENT_BEEP;
      alarmAudioRef.current.volume = 0.01;
      alarmAudioRef.current.play().catch(e => console.log('Background resume failed:', e));
    }

    // Stop synthesized backup alarm if active
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    
    // Release Wake Lock
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch (err) {
        console.error(err);
      }
    }

    setIsAlarmActive(false);
    setAlarmSession(null);
  }, [wakeLock]);

  const delaySession = useCallback(() => {
    if (alarmSession) {
      const [hours, minutes] = alarmSession.time.split(':').map(Number);
      const newTime = format(addMinutes(new Date().setHours(hours, minutes), 5), 'HH:mm');
      setSessions(prev => prev.map(s => s.id === alarmSession.id ? { ...s, time: newTime } : s));
      setTriggeredSessions(prev => {
        const next = new Set(prev);
        next.delete(alarmSession.id);
        return next;
      });
      stopAlarm();
    }
  }, [alarmSession, stopAlarm]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ALARM_ACTION') {
        if (event.data.action === 'enter') {
          stopAlarm();
        } else if (event.data.action === 'delay') {
          delaySession();
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, [stopAlarm, delaySession]);

  // Alarm Logic
  useEffect(() => {
    localStorage.setItem('lawyer_alarm_volume', alarmAudioVolume.toString());
    if (alarmAudioRef.current) {
      alarmAudioRef.current.volume = alarmAudioVolume;
    }
  }, [alarmAudioVolume]);

  // Global interaction listener to ensure audio is unlocked for the current session
  useEffect(() => {
    const handleGlobalInteraction = () => {
      if (hasInteracted) return;
      
      // BACKGROUND AUDIO HACK: We play a silent audio file on a continuous loop
      // This prevents mobile browsers (iOS/Android) from fully suspending the app
      // when the screen locks, allowing the custom alarm to sound loudly later!
      const bgAudio = new Audio(SILENT_BEEP);
      bgAudio.loop = true;
      bgAudio.volume = 0.01;
      
      bgAudio.play().then(() => {
        console.log("Background audio context unlocked and looping successfully");
        setHasInteracted(true);
        localStorage.setItem('lawyer_has_interacted', 'true');
        
        // Initialize the main alarm audio object with the active background element
        if (!alarmAudioRef.current) {
          alarmAudioRef.current = bgAudio;
        }
      }).catch(e => {
        console.log("Audio unlock failed:", e);
      });
      
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
    };

    if (!hasInteracted) {
      window.addEventListener('click', handleGlobalInteraction);
      window.addEventListener('touchstart', handleGlobalInteraction);
    }
    
    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
    };
  }, [hasInteracted, selectedSound, alarmAudioVolume]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentDate = format(now, 'yyyy-MM-dd');

      const sessionToAlarm = sessions.find(s => {
        const key = `${s.id}-${s.date}-${s.time}`;
        return s.date === currentDate && 
               s.time === currentTime && 
               !triggeredSessions.has(key);
      });

      if (sessionToAlarm && !isAlarmActive) {
        setAlarmSession(sessionToAlarm);
        setIsAlarmActive(true);
        const key = `${sessionToAlarm.id}-${sessionToAlarm.date}-${sessionToAlarm.time}`;
        setTriggeredSessions(prev => new Set(prev).add(key));

        // Request Wake Lock to keep screen on
        if ('wakeLock' in navigator) {
          try {
            const lock = await (navigator as any).wakeLock.request('screen');
            setWakeLock(lock);
          } catch (err) {
            console.error(`${err.name}, ${err.message}`);
          }
        }

        // Vibrate aggressively
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }

        // Capacitor Native Notification
        try {
          LocalNotifications.schedule({
            notifications: [{
              id: new Date().getTime(),
              title: "🔔 تنبيه: موعد جلسة الآن!",
              body: `القضية: ${sessionToAlarm.caseTitle}\nالموكل: ${sessionToAlarm.clientName}`,
              schedule: { at: new Date() },
              sound: "beep.wav",
            }]
          });
        } catch(e) { console.log('Capacitor Notification failed:', e); }

        // Browser Notification (Fallback)
        if ("Notification" in window && Notification.permission === "granted") {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification("🔔 تنبيه: موعد جلسة الآن!", {
              body: `القضية: ${sessionToAlarm.caseTitle}\nاضغط هنا للدخول وسيتوقف رنين المنبه المستمر.`,
              icon: "/favicon.ico",
              requireInteraction: true,
              silent: true, // We make the notification silent because our custom app sound WILL play!
              vibrate: [200, 100, 200, 500, 200, 100],
              actions: [
                { action: 'enter', title: 'دخول الجلسة وإيقاف الصوت' },
                { action: 'delay', title: 'تأجيل لمده 5 دقائق' }
              ]
            } as any);
          });
        }

        // Play alarm sound
        if (!alarmAudioRef.current) {
          alarmAudioRef.current = new Audio(selectedSound);
          alarmAudioRef.current.loop = true;
          alarmAudioRef.current.volume = alarmAudioVolume;
        } else if (alarmAudioRef.current.src !== selectedSound) {
          alarmAudioRef.current.src = selectedSound;
          alarmAudioRef.current.volume = alarmAudioVolume;
          alarmAudioRef.current.load();
        }
        
        alarmAudioRef.current.play().catch(e => {
          console.log('Audio play failed, playing synthesized backup', e);
          // ONLY play fallback if main audio fails to play
          playSynthesizedAlarm();
        });
      }

      // Task Due Date Notifications
      if (notifyOnTaskDueDate && "Notification" in window && Notification.permission === "granted") {
        const todayStr = format(now, 'yyyy-MM-dd');
        cases.forEach(c => {
          (c.tasks || []).forEach(t => {
            if (t.dueDate === todayStr && !t.isCompleted) {
              const taskKey = `task-${t.id}-${todayStr}`;
              if (!triggeredTasks.has(taskKey)) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification("موعد مهمة اليوم!", {
                    body: `المهمة: ${t.title}\nفي قضية: ${c.title}`,
                    icon: "/favicon.ico",
                    vibrate: [100, 50, 100],
                    tag: taskKey
                  } as any);
                });
                setTriggeredTasks(prev => new Set(prev).add(taskKey));
              }
            }
          });
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessions, cases, isAlarmActive, triggeredSessions, triggeredTasks, hasInteracted, selectedSound, notifyOnTaskDueDate]);

  const SoundStatus = () => (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${hasInteracted ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${hasInteracted ? 'bg-success animate-pulse' : 'bg-warning'}`} />
        {hasInteracted ? 'الصوت مفعل' : 'الصوت غير مفعل'}
      </div>
      {!hasInteracted && (
        <button 
          onClick={enableSystem}
          className="text-[10px] bg-primary text-white px-2 py-1 rounded-md hover:bg-primary/80 transition-all font-bold animate-pulse"
        >
          تفعيل الصوت 🔊
        </button>
      )}
    </div>
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("حجم الملف كبير جداً. يرجى اختيار ملف أقل من 5 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const base64 = event.target?.result as string;
          setCustomSound(base64);
          setSelectedSound(base64);
        } catch (error) {
          alert("فشلت عملية رفع النغمة.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const testNotification = async () => {
    if (!("Notification" in window)) {
      alert("هذا المتصفح لا يدعم الإشعارات.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("نظام المحامي الذكي", {
        body: "تم تفعيل الإشعارات بنجاح! ستصلك تنبيهات الجلسات هنا.",
        icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
        badge: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
        silent: false,
        vibrate: [200, 100, 200],
        tag: 'test-notification'
      } as any);
      
      // Force play test sound
      if (alarmAudioRef.current) {
        const originalLoop = alarmAudioRef.current.loop;
        alarmAudioRef.current.loop = false;
        alarmAudioRef.current.play().then(() => {
          setTimeout(() => {
            if (alarmAudioRef.current) alarmAudioRef.current.loop = originalLoop;
          }, 3000);
        }).catch(e => console.log('Test sound failed', e));
      }
    }
  };

  const enableSystem = async () => {
    setHasInteracted(true);
    localStorage.setItem('lawyer_has_interacted', 'true');
    setShowWelcome(false);
    
    try {
      if ("Notification" in window) {
        await Notification.requestPermission();
      }
      await LocalNotifications.requestPermissions();
    } catch (e) { console.log('Notification permission request failed:', e); }
    
    // Use a silent beep to unlock the context immediately and reliably
    const unlockAudio = new Audio(SILENT_BEEP);
    unlockAudio.play().then(() => {
      console.log("Audio context unlocked via welcome modal");
      
      // Now initialize the main alarm audio
      if (!alarmAudioRef.current) {
        alarmAudioRef.current = new Audio(selectedSound);
        alarmAudioRef.current.loop = true;
        alarmAudioRef.current.volume = alarmAudioVolume;
        alarmAudioRef.current.load();
      } else {
        alarmAudioRef.current.src = selectedSound;
        alarmAudioRef.current.load();
      }
    }).catch(e => {
      console.log("Audio context unlock failed", e);
    });
    
    testNotification();
  };

  const handleDeleteCase = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'حذف القضية',
      message: 'هل أنت متأكد من رغبتك في حذف هذه القضية؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        setCases(prev => prev.filter(c => c.id !== id));
        setSelectedCase(null);
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleDeleteClient = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'حذف العميل',
      message: 'هل أنت متأكد من رغبتك في حذف هذا العميل؟ سيتم حذف جميع البيانات المرتبطة به.',
      onConfirm: () => {
        setClients(prev => prev.filter(c => c.id !== id));
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleDeleteSession = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'حذف الجلسة',
      message: 'هل أنت متأكد من رغبتك في حذف هذه الجلسة؟',
      onConfirm: () => {
        setSessions(prev => prev.filter(s => s.id !== id));
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleAddClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: Math.random().toString(36).substr(2, 9) };
    setClients(prev => [...prev, newClient]);
    setShowAddClient(false);
  };

  const handleUpdateClient = (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    setEditingClient(null);
  };

  const handleAddCase = (newCase: Case) => {
    setCases(prev => [...prev, newCase]);
    setShowAddCase(false);
  };

  const handleUpdateCaseStatus = (caseId: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status } : c));
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleUpdateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setEditingCase(null);
    if (selectedCase?.id === updatedCase.id) {
      setSelectedCase(updatedCase);
    }
  };

  const handleAddSession = (session: Omit<Session, 'id'>) => {
    const newSession = { ...session, id: Math.random().toString(36).substr(2, 9) };
    setSessions(prev => [...prev, newSession]);
    setShowAddSession(false);
  };

  const handleUpdateSession = (session: Session) => {
    setSessions(prev => prev.map(s => s.id === session.id ? session : s));
    setEditingSession(null);
  };

  const updateCaseProgress = (caseId: string, progress: number) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, progress } : c));
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, progress } : null);
    }
  };

  const addTimelineEvent = (caseId: string, event: Omit<TimelineEvent, 'id'>) => {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, timeline: [...c.timeline, newEvent] } : c));
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, timeline: [...prev.timeline, newEvent] } : null);
    }
  };

  const addTask = (caseId: string, task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, tasks: [...(c.tasks || []), newTask] } : c));
    
    const targetCase = cases.find(c => c.id === caseId);
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null);
    }

    // Trigger notification if enabled
    if (notifyOnTaskAssignment && "Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("مهمة جديدة مسندة", {
          body: `تم إسناد مهمة: ${newTask.title}\nفي قضية: ${targetCase?.title || 'غير معروف'}`,
          icon: "/favicon.ico",
          vibrate: [100, 50, 100],
        } as any);
      });
    }
  };

  const toggleTask = (caseId: string, taskId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { 
      ...c, 
      tasks: (c.tasks || []).map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) 
    } : c));
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { 
        ...prev, 
        tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) 
      } : null);
    }
  };

  const deleteTask = (caseId: string, taskId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { 
      ...c, 
      tasks: (c.tasks || []).filter(t => t.id !== taskId) 
    } : c));
    if (selectedCase?.id === caseId) {
      setSelectedCase(prev => prev ? { 
        ...prev, 
        tasks: (prev.tasks || []).filter(t => t.id !== taskId) 
      } : null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg: Message = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // قراءة المفتاح من الخزنة الآمنة .env (Vite Environment)
      let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: 'عذراً، لم يتم ضبط مفتاح الذكاء الاصطناعي (API KEY). يرجى ضبطه في الإعدادات لتفعيل المستشار الذكي.' }]);
        setIsTyping(false);
        return;
      }
      // Prepare context about cases and clients
      const casesContext = cases.map(c => `- قضية رقم ${c.caseNumber}: ${c.title} (الموكل: ${c.clientName}, الحالة: ${c.status}, المحكمة: ${c.court})`).join('\n');
      const clientsContext = clients.map(cl => `- العميل: ${cl.name} (هاتف: ${cl.phone})`).join('\n');
      
      const systemInstruction = `أنت بروفيسور في القضاء وجميع أنواع القوانين. اسمك هو 'المستشار الذكي للمحامي محمد الكامل'. مهمتك هي تقديم استشارات قانونية دقيقة وعميقة.
إذا سألك المستخدم عن أي شيء خارج نطاق القانون، يجب أن ترد حصراً بـ: 'أعتذر لأنني مساعد القاضي والمحامي محمد الكامل لا أستطيع أن أتحدث إلا عن القوانين بشكل عام غير ذلك لا أستطيع'.
تحدث دائماً بلغة عربية فصحى وقانونية رصينة.

لديك وصول إلى قائمة القضايا والعملاء الحالية في النظام. إذا كانت استفسارات المستخدم تتعلق بقضية أو عميل موجود، قم بالإشارة إليهم واقترح الإجراءات المناسبة.

القضايا الحالية:
${casesContext}

العملاء الحاليون:
${clientsContext}`;

      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-lite-latest'
      ];

      let lastError = null;
      let modelResponseText = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }]
              },
              contents: [
                {
                  parts: [{ text: userText }]
                }
              ]
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            console.warn(`Model ${modelName} failed:`, response.status);
            let parsedError = errText;
            try {
              const jsonErr = JSON.parse(errText);
              parsedError = jsonErr.error?.message || errText;
            } catch(e) {}
            
            lastError = new Error(`خطأ من الخادم (Status ${response.status}): ${parsedError}`);
            
            // If it's a 503 (High Demand) or 404 (Not Found), try the next model!
            if (response.status === 503 || response.status === 404) {
              continue; 
            } else {
              // For other errors (like 400 bad request or 403 invalid key), throw immediately
              throw lastError;
            }
          }
          
          const data = await response.json();
          modelResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من صياغة إجابة مناسبة لك.';
          // It worked! Break the loop
          break;
        } catch (iterationError) {
          lastError = iterationError;
          // If we caught an immediate error (like network down), just throw it
          if (iterationError instanceof TypeError) {
            throw iterationError;
          }
        }
      }

      if (!modelResponseText && lastError) {
        throw lastError; // If all models failed, throw the last error to be caught by the outer block
      }

      const modelMsg: Message = { role: 'model', text: modelResponseText! };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error('AI Advisor Error:', error);
      const errMsg = error?.message || String(error);
      setMessages(prev => [...prev, { role: 'model', text: `رسالة الخطأ التفصيلية: ${errMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handlers


  // Handlers

  // Handlers

  // Handlers


  const ClientModal = ({ client, onClose, onSave }: { client?: Client | null, onClose: () => void, onSave: (c: any) => void }) => {
    const [formData, setFormData] = useState({
      name: client?.name || '',
      phone: client?.phone || '',
      email: client?.email || '',
    });

    return (
      <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] md:h-auto">
          <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold">{client ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs text-white/50 pr-1">الاسم الكامل</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/50 pr-1">رقم الهاتف</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/50 pr-1">البريد الإلكتروني</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
            </div>
            <button onClick={() => onSave(client ? { ...client, ...formData } : formData)} className="w-full bg-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">حفظ البيانات</button>
            <div className={cn("w-full transition-all duration-300 pointer-events-none md:hidden", isKeyboardOpen ? "h-[45vh]" : "h-0")} />
          </div>
        </motion.div>
      </div>
    );
  };

  const SessionModal = ({ session, onClose, onSave }: { session?: Session | null, onClose: () => void, onSave: (s: any) => void }) => {
    const [formData, setFormData] = useState({
      caseId: session?.caseId || '',
      caseTitle: session?.caseTitle || '',
      clientId: session?.clientId || '',
      clientName: session?.clientName || '',
      clientPhone: session?.clientPhone || '',
      clientEmail: session?.clientEmail || '',
      date: session?.date || format(new Date(), 'yyyy-MM-dd'),
      time: session?.time || '09:00',
      description: session?.description || '',
    });

    const handleCaseSelect = (caseId: string) => {
      const selected = cases.find(c => c.id === caseId);
      if (selected) {
        setFormData({
          ...formData,
          caseId: selected.id,
          caseTitle: selected.title,
          clientId: selected.clientId,
          clientName: selected.clientName,
          clientPhone: selected.clientPhone,
          clientEmail: selected.clientEmail || '',
        });
      } else {
        setFormData({
          ...formData,
          caseId: '',
          caseTitle: '',
          clientId: '',
          clientName: '',
          clientPhone: '',
          clientEmail: '',
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] md:h-auto">
          <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold">{session ? 'تعديل الجلسة' : 'إضافة جلسة جديدة'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs text-white/50 pr-1">اختر القضية</label>
              <select 
                value={formData.caseId} 
                onChange={e => handleCaseSelect(e.target.value)} 
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none"
              >
                <option value="">-- اختر القضية --</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title} (موكل: {c.clientName})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">التاريخ</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">الوقت</label>
                <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <p className="text-xs text-white/40">بيانات الموكل (تلقائي):</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{formData.clientName || '---'}</span>
                <span className="text-xs text-white/50">{formData.clientPhone || '---'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/50 pr-1">الوصف</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none h-24" placeholder="اكتب تفاصيل الجلسة هنا..." />
            </div>
            <button 
              onClick={() => onSave(session ? { ...session, ...formData } : formData)} 
              disabled={!formData.caseId}
              className={cn(
                "w-full py-3 rounded-xl font-bold shadow-lg transition-all",
                formData.caseId ? "bg-primary shadow-primary/20 hover:bg-primary/90" : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              حفظ الجلسة
            </button>
            <div className={cn("w-full transition-all duration-300 pointer-events-none md:hidden", isKeyboardOpen ? "h-[45vh]" : "h-0")} />
          </div>
        </motion.div>
      </div>
    );
  };

  const CaseModal = ({ caseData, onClose, onSave }: { caseData?: Case | null, onClose: () => void, onSave: (c: any) => void }) => {
    const [formData, setFormData] = useState({
      title: caseData?.title || '',
      type: caseData?.type || 'جنائية',
      court: caseData?.court || '',
      clientName: caseData?.clientName || '',
      clientPhone: caseData?.clientPhone || '',
      clientEmail: caseData?.clientEmail || '',
      totalFees: caseData?.totalFees || '',
      paidFees: caseData?.paidFees || '',
      priority: caseData?.priority || 'متوسطة',
    });
    const [suggestedClients, setSuggestedClients] = useState<Client[]>([]);

    const handleClientInput = (val: string) => {
      setFormData({ ...formData, clientName: val });
      if (val.trim()) {
        const matches = clients.filter(c => c.name.includes(val));
        setSuggestedClients(matches);
      } else {
        setSuggestedClients([]);
      }
    };

    const selectClient = (c: Client) => {
      setFormData({ ...formData, clientName: c.name, clientPhone: c.phone, clientEmail: c.email || '' });
      setSuggestedClients([]);
    };

    const handleSubmit = () => {
      if (caseData) {
        onSave({ 
          ...caseData, 
          ...formData, 
          totalFees: Number(formData.totalFees),
          paidFees: Number(formData.paidFees),
          priority: formData.priority as any
        });
      } else {
        const newCase: Case = {
          id: Math.random().toString(36).substr(2, 9),
          caseNumber: (cases.length + 1).toString(),
          title: formData.title,
          type: formData.type,
          court: formData.court,
          clientId: 'custom',
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientEmail: formData.clientEmail,
          status: 'نشطة',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          totalFees: Number(formData.totalFees),
          paidFees: Number(formData.paidFees) || 0,
          progress: 0,
          priority: formData.priority as any,
          timeline: [
            { id: 't1', date: format(new Date(), 'yyyy-MM-dd'), title: 'تم استلام القضية', description: 'بدء العمل على ملف القضية', isCompleted: true }
          ],
          tasks: []
        };
        onSave(newCase);
      }
    };

    return (
      <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col h-[90vh] md:h-auto">
          <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold">{caseData ? 'تعديل القضية' : 'إضافة قضية جديدة'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs text-white/50 pr-1">عنوان القضية</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">نوع القضية</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none">
                  <option value="جنائية">جنائية</option>
                  <option value="مدنية">مدنية</option>
                  <option value="أحوال شخصية">أحوال شخصية</option>
                  <option value="تجارية">تجارية</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">المحكمة</label>
                <input type="text" value={formData.court} onChange={(e) => setFormData({ ...formData, court: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs text-white/50 pr-1">اسم الموكل</label>
              <input type="text" value={formData.clientName} onChange={(e) => handleClientInput(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              {suggestedClients.length > 0 && (
                <div className="absolute top-full right-0 left-0 bg-card border border-border rounded-xl mt-1 z-10 shadow-xl overflow-hidden">
                  {suggestedClients.map(c => (
                    <button key={c.id} onClick={() => selectClient(c)} className="w-full text-right px-4 py-2 hover:bg-primary/10 text-sm transition-colors">{c.name} - {c.phone}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">رقم الهاتف</label>
                <input type="text" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">البريد الإلكتروني</label>
                <input type="email" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">الأولوية</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} 
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="عالية">عالية</option>
                  <option value="متوسطة">متوسطة</option>
                  <option value="منخفضة">منخفضة</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">تاريخ البدء</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">إجمالي الأتعاب</label>
                <input type="number" value={formData.totalFees} onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 pr-1">المبلغ المدفوع</label>
                <input type="number" value={formData.paidFees} onChange={(e) => setFormData({ ...formData, paidFees: e.target.value })} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex justify-between items-center">
              <span className="text-xs text-white/50">المبلغ المتبقي:</span>
              <span className="font-bold text-danger">{(Number(formData.totalFees) || 0) - (Number(formData.paidFees) || 0)} ريال</span>
            </div>
            <button onClick={handleSubmit} className="w-full bg-primary py-3 rounded-xl font-bold mt-4 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">حفظ البيانات</button>
            <div className={cn("w-full transition-all duration-300 pointer-events-none md:hidden", isKeyboardOpen ? "h-[45vh]" : "h-0")} />
          </div>
        </motion.div>
      </div>
    );
  };

  const AlarmModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Calm Visual Alarm Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border-4 border-danger w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.4)] relative z-10"
      >
        <div className="p-8 text-center space-y-6">
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-danger rounded-full blur-2xl"
            />
            <div className="w-24 h-24 bg-danger/20 rounded-full flex items-center justify-center mx-auto relative z-10">
              <motion.div
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Bell size={48} className="text-danger" />
              </motion.div>
            </div>
          </div>

          <div>
            <motion.h2 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-3xl md:text-4xl font-black text-danger uppercase tracking-tighter"
            >
              تنبيه: موعد جلسة!
            </motion.h2>
            <p className="text-white/80 mt-2 font-bold">يرجى الانتباه، حان وقت الجلسة الآن</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-3xl space-y-3 text-right border border-white/10 shadow-inner">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">القضية:</span>
              <span className="font-bold text-lg">{alarmSession?.caseTitle}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">الموكل:</span>
              <span className="font-bold text-lg">{alarmSession?.clientName}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">الوقت:</span>
              <span className="font-bold text-lg text-secondary">{alarmSession?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">رقم الموكل:</span>
              <span className="font-bold">{alarmSession?.clientPhone}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopAlarm}
              className="bg-primary py-5 rounded-2xl font-black text-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
            >
              <ArrowLeft size={24} />
              دخول الجلسة الآن
            </motion.button>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={delaySession}
                className="bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Clock size={20} />
                تأجيل 5 دقائق
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Re-initialize audio on manual click to ensure it's fresh and unlocked
                  const audio = new Audio(selectedSound);
                  audio.loop = true;
                  audio.volume = alarmAudioVolume;
                  audio.play().then(() => {
                    alarmAudioRef.current = audio;
                    setHasInteracted(true);
                    localStorage.setItem('lawyer_has_interacted', 'true');
                  }).catch(e => {
                    console.log('Manual play failed', e);
                    alert("عذراً، المتصفح يمنع الصوت. يرجى التأكد من رفع صوت الجهاز وإلغاء وضع الصامت.");
                  });
                }}
                className="bg-danger/20 border border-danger/30 text-danger py-4 rounded-2xl font-bold hover:bg-danger/30 transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <Volume2 size={20} />
                تشغيل الصوت يدوياً
              </motion.button>
            </div>
          </div>

          <div className="p-4 bg-warning/10 rounded-2xl border border-warning/20 mx-8 mb-4">
            <p className="text-[10px] text-warning/80 leading-relaxed text-center">
              ملاحظة: المتصفحات تمنع الصوت تلقائياً. إذا لم تسمع صوتاً، اضغط على الزر الوامض أعلاه وتأكد من أن هاتفك ليس في وضع الصامت.
            </p>
          </div>
          
          <button 
            onClick={stopAlarm}
            className="w-full text-white/30 hover:text-white/50 transition-all text-sm py-2 underline underline-offset-4"
          >
            تجاهل التنبيه (إيقاف الصوت)
          </button>
        </div>
      </motion.div>
    </div>
  );

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto text-danger">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{confirmModal.title}</h3>
            <p className="text-white/60 text-sm mt-2">{confirmModal.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
              className="bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all"
            >
              إلغاء
            </button>
            <button 
              onClick={confirmModal.onConfirm}
              className="bg-danger hover:bg-danger/90 py-3 rounded-xl font-bold transition-all shadow-lg shadow-danger/20"
            >
              تأكيد الحذف
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Wake Lock implementation to keep screen on during alarm
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock is active');
        }
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    if (isAlarmActive) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().then(() => {
          wakeLock = null;
          console.log('Wake Lock released');
        });
      }
    };
  }, [isAlarmActive]);

  // Continuous Alarm Loop to ensure repeating until dismissed
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAlarmActive) {
      interval = setInterval(() => {
        // Force the main audio element to keep playing if it paused for any reason
        if (alarmAudioRef.current && alarmAudioRef.current.paused) {
          alarmAudioRef.current.play().catch(e => {
            console.log('Continuous loop play failed, using fallback', e);
            playSynthesizedAlarm();
          });
        }
      }, 5000); // Repeat every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAlarmActive, playSynthesizedAlarm]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[100dvh] bg-bg flex flex-col p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 mx-auto mt-12 md:mt-24 mb-12"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 mb-6">
              <Scale size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">المحامي محمد الكامل</h1>
            <p className="text-white/50 mt-2">نظام الإدارة القانونية الرقمي</p>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-sm text-white/60">رقم الهاتف أو البريد الإلكتروني</label>
              <input 
                type="text" 
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                placeholder="أدخل المعرف..."
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">كلمة المرور الشخصية</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                  placeholder="••••••••"
                  className="w-full bg-bg border border-border rounded-xl pl-12 pr-4 py-3 focus:border-primary focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-danger text-xs text-center">{loginError}</p>}
            <button 
              onClick={handleLogin}
              className="w-full bg-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              دخول آمن للمنصة
              <ArrowLeft size={20} />
            </button>

            {fingerprintEnabled && (
              <button 
                onClick={handleFingerprintLogin}
                className="w-full bg-white/5 py-4 rounded-xl font-bold text-white/80 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Fingerprint size={20} className="text-amber-500" />
                الدخول ببصمة الإصبع
              </button>
            )}

            <button className="w-full text-center text-sm text-white/40 hover:text-primary transition-colors">
              هل تواجه مشكلة في الوصول؟ 🔐
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const NotificationBell = () => (
    <div className="relative z-50">
      <button 
        onClick={() => setShowNotificationsBox(!showNotificationsBox)}
        className={cn("p-2 rounded-xl transition-all relative", showNotificationsBox ? "bg-primary text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white")}
      >
        <Bell size={20} />
        {notificationsList.length > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-danger border border-card rounded-full animate-pulse" />}
      </button>
      <AnimatePresence>
        {showNotificationsBox && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] max-w-[90vw]"
          >
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-sm">التنبيهات النشطة</h3>
              <span className="text-xs bg-danger text-white px-2 py-0.5 rounded-full font-bold">{notificationsList.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 hide-scrollbar">
              {notificationsList.length > 0 ? (
                notificationsList.map((n, i) => (
                  <div key={`${n.id}-${i}`} className="p-3 bg-bg rounded-lg border border-border flex flex-col gap-1 hover:bg-white/5 transition-colors text-right">
                    <div className="flex items-center gap-2">
                      {n.type === 'task' ? <CheckSquare size={14} className="text-accent shrink-0" /> : <Calendar size={14} className="text-secondary shrink-0" />}
                      <span className="font-bold text-sm leading-tight">{n.title}</span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate pr-6">{n.subtitle}</p>
                    <p className={`text-[9px] font-bold mt-1 pr-6 ${n.type === 'task' ? 'text-accent' : 'text-secondary'}`}>{n.date}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-white/40 text-xs">لا توجد تنبيهات حالية</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-[100dvh] bg-bg text-white w-full">
      {/* Welcome Modal for Interaction */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border p-8 rounded-3xl max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Bell size={40} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold mb-4">تفعيل نظام التنبيهات</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                لضمان وصول تنبيهات الجلسات إليك بصوت نغمة سامسونج المخصصة، يرجى الضغط على الزر أدناه لتفعيل أذونات الصوت والإشعارات في المتصفح.
              </p>
              <button 
                onClick={enableSystem}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={24} />
                تفعيل الآن
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


            {/* Mobile Top Header */}
            <div className={cn(
              "md:hidden sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-40 px-4 pb-4 pt-14 safe-top transition-all duration-300",
              isKeyboardOpen && "hidden"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm truncate w-40">{lawyerProfile?.name || 'المحامي'}</h1>
                    <p className="text-[10px] text-white/50">النظام الذكي</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            </div>

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
            
            <main 
              className={cn(
                "md:pr-64 p-4 md:p-6 transition-all duration-300 flex flex-col w-full",
                isKeyboardOpen ? "pb-4" : "pb-24"
              )}
              style={{ minHeight: viewportHeight, height: viewportHeight }}
            >
              <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col relative z-30 h-full">
                <div className="justify-end items-center gap-3 mb-4 shrink-0 hidden md:flex">
                  <NotificationBell />
                  <SoundStatus />
                </div>
          {activeTab === 'dashboard' && (
            <Dashboard 
              cases={cases} 
              clients={clients} 
              sessions={sessions} 
            />
          )}
          {activeTab === 'cases' && (
            <CasesView 
              cases={cases}
              caseFilters={caseFilters}
              setCaseFilters={setCaseFilters}
              searchQuery={searchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              setShowAddCase={setShowAddCase}
              setSelectedCase={setSelectedCase}
              handleUpdateCaseStatus={handleUpdateCaseStatus}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView 
              profile={lawyerProfile} 
              onUpdate={setLawyerProfile} 
            />
          )}
          {activeTab === 'ai' && (
            <AIView 
              messages={messages} 
              input={input} 
              setInput={setInput} 
              handleSendMessage={handleSendMessage} 
              isTyping={isTyping} 
              isKeyboardOpen={isKeyboardOpen}
            />
          )}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">العملاء</h2>
                  <p className="text-white/50">إدارة بيانات الموكلين</p>
                </div>
                <button 
                  onClick={() => setShowAddClient(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Plus size={20} />
                  عميل جديد
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => (
                  <div key={client.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-primary">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold">{client.name}</h3>
                        <div className="space-y-0.5">
                          <p className="text-xs text-white/50 flex items-center gap-1.5">
                            <Phone size={12} className="opacity-40" />
                            {client.phone}
                          </p>
                          {client.email && (
                            <p className="text-xs text-white/50 flex items-center gap-1.5">
                              <Mail size={12} className="opacity-40" />
                              {client.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setEditingClient(client)}
                        className="p-2 text-white/20 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-white/20 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">التقويم</h2>
                  <p className="text-white/50">مواعيد الجلسات القادمة المرتبطة بالقضايا</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={enableSystem}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-xl border border-white/10 transition-all text-sm"
                  >
                    <Bell size={16} />
                    تفعيل التنبيهات والصوت
                  </button>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
                    <Search size={16} className="text-white/40" />
                    <input 
                      type="text" 
                      placeholder="بحث في الجلسات..." 
                      value={sessionSearchQuery}
                      onChange={(e) => setSessionSearchQuery(e.target.value)}
                      className="bg-transparent text-sm focus:outline-none w-32 md:w-48"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
                    <Filter size={16} className="text-white/40" />
                    <select 
                      value={sessionFilters.status}
                      onChange={(e) => setSessionFilters({ ...sessionFilters, status: e.target.value })}
                      className="bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="الكل">كل الحالات</option>
                      <option value="نشطة">نشطة</option>
                      <option value="مغلقة">مغلقة</option>
                      <option value="معلقة">معلقة</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
                    <Calendar size={16} className="text-white/40" />
                    <input 
                      type="date" 
                      value={sessionFilters.startDate}
                      onChange={(e) => setSessionFilters({ ...sessionFilters, startDate: e.target.value })}
                      className="bg-transparent text-sm focus:outline-none cursor-pointer text-white/70"
                      placeholder="من تاريخ"
                    />
                    <span className="text-white/20">|</span>
                    <input 
                      type="date" 
                      value={sessionFilters.endDate}
                      onChange={(e) => setSessionFilters({ ...sessionFilters, endDate: e.target.value })}
                      className="bg-transparent text-sm focus:outline-none cursor-pointer text-white/70"
                      placeholder="إلى تاريخ"
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddSession(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Plus size={20} />
                    جلسة جديدة
                  </button>
                </div>
              </header>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="space-y-4">
                  {(() => {
    const filteredSessions = sessions.filter(s => {
      const linkedCase = cases.find(c => c.id === s.caseId);
      const matchesStatus = sessionFilters.status === 'الكل' || linkedCase?.status === sessionFilters.status;
      const matchesSearch = s.caseTitle.toLowerCase().includes(sessionSearchQuery.toLowerCase()) || 
                           s.clientName.toLowerCase().includes(sessionSearchQuery.toLowerCase());
      
      const sessionDate = s.date;
      const matchesStartDate = !sessionFilters.startDate || sessionDate >= sessionFilters.startDate;
      const matchesEndDate = !sessionFilters.endDate || sessionDate <= sessionFilters.endDate;
      
      return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
    });

    return filteredSessions.length > 0 ? filteredSessions.map(session => (
      <div key={session.id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
        <div className="w-16 text-center border-l border-white/10 ml-2">
          <p className="text-xs text-white/40 uppercase tracking-wider">{format(parseISO(session.date), 'MMM', { locale: ar })}</p>
          <p className="text-2xl font-bold text-primary">{format(parseISO(session.date), 'dd')}</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-lg">{session.caseTitle}</h4>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">جلسة</span>
            {(() => {
              const linkedCase = cases.find(c => c.id === session.caseId);
              return linkedCase && (
                <>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded",
                    linkedCase.status === 'نشطة' ? "bg-primary/20 text-primary" :
                    linkedCase.status === 'مغلقة' ? "bg-success/20 text-success" :
                    "bg-warning/20 text-warning"
                  )}>
                    {linkedCase.status}
                  </span>
                  <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded">رقم: {linkedCase.caseNumber}</span>
                </>
              );
            })()}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-secondary" />
              <span>{session.clientName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-accent" />
              <span>{session.time}</span>
            </div>
            {(() => {
              const linkedCase = cases.find(c => c.id === session.caseId);
              return linkedCase?.court && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  <span>{linkedCase.court}</span>
                </div>
              );
            })()}
          </div>
          <p className="text-xs text-white/30 mt-2 italic">"{session.description}"</p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => setEditingSession(session)}
            className="p-2 text-white/20 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="تعديل"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteSession(session.id)}
            className="p-2 text-white/20 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    )) : (
      <div className="py-20 text-center text-white/20">
        <Calendar size={48} className="mx-auto mb-4 opacity-10" />
        <p>لا توجد جلسات تطابق خيارات التصفية</p>
      </div>
    );
                  })()}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'docs' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-white/30">
              <FileText size={64} className="mb-4 opacity-20" />
              <p className="text-xl">قريباً: نظام إدارة الوثائق</p>
            </div>
          )}
          {activeTab === 'statements' && (
            <AccountStatementsView
              cases={cases}
              clients={clients}
              payments={payments}
              setPayments={setPayments}
              selectedClientId={selectedClientStatement}
              setSelectedClientId={setSelectedClientStatement}
              lawyerProfile={lawyerProfile}
            />
          )}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
              <header>
                <h2 className="text-2xl font-bold">إعدادات النظام</h2>
                <p className="text-white/50">تخصيص التنبيهات وتفضيلات التطبيق</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Bell size={20} />
                    </div>
                    <h3 className="font-bold text-lg">نغمة التنبيه</h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-white/50 mb-4">اختر نغمة التنبيه التي تظهر عند حلول موعد الجلسة:</p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {PREDEFINED_SOUNDS.map((sound) => (
                        <button
                          key={sound.id}
                          onClick={() => setSelectedSound(sound.url)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                            selectedSound === sound.url 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-white/5 border-white/5 hover:bg-white/10 text-white/70"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Music size={18} />
                            <span className="font-medium">{sound.name}</span>
                          </div>
                          {selectedSound === sound.url && <CheckCircle2 size={18} />}
                        </button>
                      ))}

                      {customSound && (
                        <button
                          onClick={() => setSelectedSound(customSound)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                            selectedSound === customSound 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-white/5 border-white/5 hover:bg-white/10 text-white/70"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Music size={18} />
                            <span className="font-medium">نغمة مخصصة</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomSound(null);
                                if (selectedSound === customSound) {
                                  setSelectedSound(PREDEFINED_SOUNDS[0].url);
                                }
                              }}
                              className="p-1 hover:bg-danger/20 text-danger rounded-md"
                            >
                              <Trash2 size={16} />
                            </button>
                            {selectedSound === customSound && <CheckCircle2 size={18} />}
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-white/50 mb-3">أو قم برفع نغمة خاصة بك (MP3/WAV):</p>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-white/30" />
                          <p className="mb-2 text-sm text-white/50">اضغط لرفع ملف صوتي</p>
                          <p className="text-xs text-white/30">MP3, WAV (بحد أقصى 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                      <Volume2 size={20} />
                    </div>
                    <h3 className="font-bold text-lg">تجربة الصوت</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-white/50">يمكنك تجربة النغمة المختارة حالياً للتأكد من أنها تعمل بشكل صحيح:</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/40 px-1">
                        <span>مستوى الصوت</span>
                        <span>{Math.round(alarmAudioVolume * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={alarmAudioVolume}
                        onChange={(e) => setAlarmAudioVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => {
                          const audio = new Audio(selectedSound);
                          audio.volume = alarmAudioVolume;
                          audio.play().catch(e => {
                            console.error("Audio test failed", e);
                            playSynthesizedAlarm();
                          });
                        }}
                        className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all"
                      >
                        <Play size={20} className="text-secondary" />
                        <span>تجربة النغمة المختارة</span>
                      </button>
                      
                      <button
                        onClick={playSynthesizedAlarm}
                        className="py-4 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary rounded-xl flex items-center justify-center gap-3 transition-all"
                      >
                        <Zap size={20} />
                        <span>تجربة نغمة النظام المدمجة (للـ APK)</span>
                      </button>
                    </div>

                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="text-warning shrink-0" size={20} />
                        <div className="space-y-1">
                          <p className="text-xs text-warning/80 leading-relaxed font-bold">
                            تنبيه هام حول الصوت:
                          </p>
                          <p className="text-xs text-warning/80 leading-relaxed">
                            المتصفحات تمنع تشغيل الصوت تلقائياً. يرجى الضغط على "تفعيل الصوت" أعلاه أو التفاعل مع أي جزء في الصفحة لضمان عمل التنبيهات الصوتية.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
                      <div className="flex gap-3">
                        <HelpCircle className="text-info shrink-0" size={20} />
                        <div className="space-y-1">
                          <p className="text-xs text-info/80 leading-relaxed font-bold">
                            دليل حل مشاكل الصوت:
                          </p>
                          <ul className="text-[10px] text-info/80 list-disc pr-4 space-y-1">
                            <li>تأكد من أن مفتاح الصامت في جانب الهاتف مغلق.</li>
                            <li>ارفع مستوى صوت "الوسائط" أو "التنبيهات" لأقصى درجة.</li>
                            <li>تأكد من أن المتصفح (Chrome/Safari) لديه إذن "الصوت".</li>
                            <li>اضغط على زر "تفعيل الصوت" أعلاه لتجديد الإذن.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-success/10 rounded-lg text-success">
                      <Database size={20} />
                    </div>
                    <h3 className="font-bold text-lg">إدارة البيانات والنسخ الاحتياطي</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-white/50">بما أن التطبيق يعمل محلياً، يرجى أخذ نسخة احتياطية من بياناتك بانتظام:</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={exportData}
                        className="bg-success hover:bg-success/90 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-success/20"
                      >
                        <Download size={18} />
                        تصدير نسخة احتياطية (Backup)
                      </button>
                      
                      <label className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10 cursor-pointer">
                        <Upload size={18} />
                        استيراد نسخة احتياطية (Restore)
                        <input type="file" className="hidden" accept=".json" onChange={importData} />
                      </label>
                    </div>
                    
                    <p className="text-[10px] text-white/30 text-center italic">
                      سيتم تحميل ملف بصيغة JSON يحتوي على كافة بياناتك (العملاء، القضايا، الجلسات).
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                      <Bell size={20} />
                    </div>
                    <h3 className="font-bold text-lg">تفضيلات التنبيهات</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-white/50">تحكم في أنواع التنبيهات التي ترغب في استلامها:</p>
                    
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <UserPlus size={18} className="text-primary" />
                          <div>
                            <p className="font-medium">تنبيه عند إسناد مهمة</p>
                            <p className="text-[10px] text-white/40">استلام إشعار عند إضافة مهمة جديدة لك في قضية</p>
                          </div>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            setNotifyOnTaskAssignment(!notifyOnTaskAssignment);
                          }}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300",
                            notifyOnTaskAssignment ? "bg-primary" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                            notifyOnTaskAssignment ? "right-7" : "right-1"
                          )} />
                        </div>
                      </label>

                      <label className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-secondary" />
                          <div>
                            <p className="font-medium">تنبيه عند اقتراب موعد مهمة</p>
                            <p className="text-[10px] text-white/40">استلام إشعار يومي للمهام التي يحين موعدها اليوم</p>
                          </div>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            setNotifyOnTaskDueDate(!notifyOnTaskDueDate);
                          }}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300",
                            notifyOnTaskDueDate ? "bg-secondary" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                            notifyOnTaskDueDate ? "right-7" : "right-1"
                          )} />
                        </div>
                      </label>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        ملاحظة: تنبيهات المهام تعتمد على إشعارات المتصفح. تأكد من منح الإذن للموقع لإرسال الإشعارات من إعدادات المتصفح.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <Fingerprint size={20} />
                    </div>
                    <h3 className="font-bold text-lg">بصمة الإصبع وأمان الدخول</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-white/50 leading-relaxed">
                      يمكّنك تفعيل بصمة الإصبع من الدخول بسرعة وأمان للتطبيق دون الحاجة لكتابة كلمة المرور في كل مرة.
                    </p>
                    
                    <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Fingerprint size={24} className={fingerprintEnabled ? "text-purple-400" : "text-white/40"} />
                        <div>
                          <p className="font-bold text-sm">تسجيل الدخول بالبصمة</p>
                          <p className="text-[10px] text-white/50 mt-1">تفعيل التعرف على البصمة</p>
                        </div>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full transition-colors relative", fingerprintEnabled ? "bg-purple-500" : "bg-white/10")}>
                        <div className={cn("absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all shadow-md", fingerprintEnabled ? "left-1" : "left-7")} />
                      </div>
                      {/* Hidden actual checkbox to keep accessibility */}
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={fingerprintEnabled}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setFingerprintEnabled(val);
                          localStorage.setItem('lawyer_fingerprint_enabled', String(val));
                          if(val) {
                            alert('تم تفعيل الدخول بالبصمة. سيتم استخدام بصمتك أو الوجه المخزن في جهازك عند تسجيل الدخول.');
                          }
                        }}
                      />
                    </label>

                    {fingerprintEnabled && (
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mt-4">
                        <p className="text-[10px] text-purple-200/80 leading-relaxed">
                          تم تفعيل الدخول السريع. يمكنك الآن استخدام بصمة الإصبع الموجودة في جهازك متى ما تم تسجيل الخروج.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                      <Lock size={20} />
                    </div>
                    <h3 className="font-bold text-lg">بيانات الدخول</h3>
                  </div>

                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newIdentifier = formData.get('identifier') as string;
                    const newPassword = formData.get('password') as string;
                    if (newIdentifier && newPassword) {
                      const newCreds = { identifier: newIdentifier, password: newPassword };
                      setCredentials(newCreds);
                      localStorage.setItem('lawyer_credentials', JSON.stringify(newCreds));
                      alert('تم تحديث بيانات الدخول بنجاح');
                    }
                  }}>
                    <div className="space-y-2">
                      <label className="text-xs text-white/50 pr-1 block">البريد الإلكتروني أو رقم الهاتف</label>
                      <input 
                        name="identifier"
                        type="text" 
                        required
                        defaultValue={credentials?.identifier || ''}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none text-left"
                        placeholder="البريد أو الهاتف"
                        dir="ltr"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs text-white/50 pr-1 block">كلمة المرور الجديدة</label>
                      <input 
                        name="password"
                        type="text" 
                        required
                        defaultValue={credentials?.password || ''}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none text-left"
                        placeholder="كلمة المرور الجديدة"
                        dir="ltr"
                      />
                    </div>
                    
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all">
                      حفظ بيانات الدخول
                    </button>
                    
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl mt-4 flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 text-amber-500 mt-0.5" />
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        تذكر بيانات الدخول الجديدة. سيتم طلبها في المرة القادمة التي تسجل فيها دخولك للتطبيق. إذا نسيتها ولم تستطع الدخول، ستحتاج لمسح بيانات المتصفح لإعادة تعيينها.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* شريط تمرير سحري يحمي محتواك من الاختفاء خلف الأزرار السفلية والكيبورد */}
          <div className={cn(
            "w-full shrink-0 opacity-0 pointer-events-none transition-all duration-300",
            isKeyboardOpen ? "h-[50vh]" : "h-32 md:h-16"
          )}>فضاوة السحب النهائي</div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDetails 
            caseData={selectedCase} 
            setSelectedCase={setSelectedCase}
            handleDeleteCase={handleDeleteCase}
            updateCaseProgress={updateCaseProgress}
            addTimelineEvent={addTimelineEvent}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            onEdit={() => setEditingCase(selectedCase)}
          />
        )}
        {showAddCase && <CaseModal onClose={() => setShowAddCase(false)} onSave={handleAddCase} />}
        {editingCase && <CaseModal caseData={editingCase} onClose={() => setEditingCase(null)} onSave={handleUpdateCase} />}
        
        {showAddClient && <ClientModal onClose={() => setShowAddClient(false)} onSave={handleAddClient} />}
        {editingClient && <ClientModal client={editingClient} onClose={() => setEditingClient(null)} onSave={handleUpdateClient} />}
        
        {showAddSession && <SessionModal onClose={() => setShowAddSession(false)} onSave={handleAddSession} />}
        {editingSession && <SessionModal session={editingSession} onClose={() => setEditingSession(null)} onSave={handleUpdateSession} />}

        {isAlarmActive && <AlarmModal />}
        {confirmModal.show && <ConfirmationModal />}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div 
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 w-full bg-[#15151e] border-t border-border z-[200] px-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300",
          isKeyboardOpen ? "translate-y-full" : "translate-y-0 h-16 pb-0"
        )}
      >
        <MobileNavItem icon={<LayoutDashboard size={22} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Briefcase size={22} />} active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} />
        <MobileNavItem icon={<Receipt size={22} />} active={activeTab === 'statements'} onClick={() => setActiveTab('statements')} />
        <MobileNavItem icon={<Bot size={22} />} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        <MobileNavItem icon={<Calendar size={22} />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <MobileNavItem icon={<User size={22} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <MobileNavItem icon={<Users size={22} />} active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
      </div>
    </div>
  );
}

const CaseDetails = ({ 
  caseData, 
  setSelectedCase, 
  handleDeleteCase, 
  updateCaseProgress, 
  addTimelineEvent,
  addTask,
  toggleTask,
  deleteTask,
  onEdit
}: { 
  caseData: Case, 
  setSelectedCase: (c: Case | null) => void, 
  handleDeleteCase: (id: string) => void, 
  updateCaseProgress: (id: string, progress: number) => void, 
  addTimelineEvent: (id: string, event: any) => void,
  addTask: (id: string, task: any) => void,
  toggleTask: (caseId: string, taskId: string) => void,
  deleteTask: (caseId: string, taskId: string) => void,
  onEdit: () => void
}) => {
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), isCompleted: false });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: format(new Date(), 'yyyy-MM-dd'), assignee: '', isCompleted: false });
  const [showAddTask, setShowAddTask] = useState(false);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    addTimelineEvent(caseData.id, newEvent);
    setNewEvent({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), isCompleted: false });
    setShowAddEvent(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    addTask(caseData.id, newTask);
    setNewTask({ title: '', dueDate: format(new Date(), 'yyyy-MM-dd'), assignee: '', isCompleted: false });
    setShowAddTask(false);
  };

  return (
    <div className="fixed inset-0 bg-bg/95 backdrop-blur-md z-50 flex items-center justify-center md:p-4">
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      className="bg-card border-t md:border border-border w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-3xl overflow-hidden flex flex-col"
    >
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-white/5 sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold truncate max-w-[150px] md:max-w-none">{caseData.title}</h2>
            <p className="text-white/50 text-xs md:text-sm">#{caseData.caseNumber} - {caseData.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onEdit}
            className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-primary"
            title="تعديل القضية"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteCase(caseData.id)}
            className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-danger"
            title="حذف القضية"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <DetailCard label="تاريخ البدء" value={caseData.startDate} icon={<Calendar size={16} />} />
          <DetailCard label="المحكمة" value={caseData.court} icon={<Gavel size={16} />} />
          <DetailCard 
            label="الأولوية" 
            value={caseData.priority} 
            icon={<AlertCircle size={16} />} 
            color={caseData.priority === 'عالية' ? 'danger' : caseData.priority === 'متوسطة' ? 'accent' : 'secondary'} 
          />
          <DetailCard label="رقم القضية" value={caseData.caseNumber} icon={<FileText size={16} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    سير القضية
                  </h3>
                  <button 
                    onClick={() => setShowAddEvent(!showAddEvent)}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1"
                  >
                    <Plus size={14} />
                    إضافة حدث
                  </button>
                </div>

                <AnimatePresence>
                  {showAddEvent && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddEvent}
                      className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/40">عنوان الحدث</label>
                          <input 
                            type="text" 
                            value={newEvent.title}
                            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                            placeholder="مثلاً: جلسة مرافعة"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/40">التاريخ</label>
                          <input 
                            type="date" 
                            value={newEvent.date}
                            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/40">الوصف</label>
                        <textarea 
                          value={newEvent.description}
                          onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none h-20"
                          placeholder="تفاصيل إضافية..."
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newEvent.isCompleted}
                            onChange={e => setNewEvent({...newEvent, isCompleted: e.target.checked})}
                            className="w-4 h-4 rounded border-border bg-bg text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-white/60">تم الإنجاز</span>
                        </label>
                        <div className="flex-1 flex justify-end gap-2">
                          <button 
                            type="button"
                            onClick={() => setShowAddEvent(false)}
                            className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                          >
                            إلغاء
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all"
                          >
                            حفظ الحدث
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              <div className="space-y-6 relative before:absolute before:right-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {caseData.timeline.map((event, idx) => (
                  <div key={event.id} className="relative pr-10">
                    <div className={cn(
                      "absolute right-0 top-1.5 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center z-10",
                      event.isCompleted ? "bg-secondary" : "bg-white/20"
                    )}>
                      {event.isCompleted && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <h4 className={cn("font-bold", event.isCompleted ? "text-white" : "text-white/40")}>{event.title}</h4>
                    <p className="text-sm text-white/50 mt-1">{event.description}</p>
                    <span className="text-[10px] text-white/30 block mt-1">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <CheckSquare size={20} className="text-secondary" />
                    المهام المطلوبة
                  </h3>
                  <button 
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="text-xs bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-all flex items-center gap-1"
                  >
                    <Plus size={14} />
                    إضافة مهمة
                  </button>
                </div>

                <AnimatePresence>
                  {showAddTask && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddTask}
                      className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/40">عنوان المهمة</label>
                          <input 
                            type="text" 
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-secondary outline-none"
                            placeholder="مثلاً: مراجعة المستندات"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/40">تاريخ الاستحقاق</label>
                          <input 
                            type="date" 
                            value={newTask.dueDate}
                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-secondary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/40">المسؤول</label>
                        <input 
                          type="text" 
                          value={newTask.assignee}
                          onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-secondary outline-none"
                          placeholder="اسم المحامي المسؤول..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => setShowAddTask(false)}
                          className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                        >
                          إلغاء
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-secondary/90 transition-all"
                        >
                          حفظ المهمة
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {(caseData.tasks || []).length === 0 ? (
                    <p className="text-center text-white/30 py-4 text-sm">لا توجد مهام حالياً</p>
                  ) : (
                    (caseData.tasks || []).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleTask(caseData.id, task.id)}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all",
                              task.isCompleted ? "bg-secondary border-secondary" : "border-white/20 hover:border-secondary"
                            )}
                          >
                            {task.isCompleted && <Check size={12} className="text-white" />}
                          </button>
                          <div>
                            <p className={cn("text-sm font-medium", task.isCompleted && "text-white/30 line-through")}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-white/40 flex items-center gap-1">
                                <Calendar size={10} />
                                {task.dueDate}
                              </span>
                              {task.assignee && (
                                <span className="text-[10px] text-white/40 flex items-center gap-1">
                                  <User size={10} />
                                  {task.assignee}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteTask(caseData.id, task.id)}
                          className="p-1.5 text-white/20 hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-secondary" />
                تحديث الإنجاز
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">النسبة الحالية</span>
                  <span className="font-bold text-secondary">{caseData.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={caseData.progress}
                  onChange={(e) => updateCaseProgress(caseData.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                الموكل
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">الاسم</p>
                  <p className="font-medium">{caseData.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">رقم الهاتف</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={14} className="text-white/30" />
                    {caseData.clientPhone}
                  </p>
                </div>
                {caseData.clientEmail && (
                  <div>
                    <p className="text-xs text-white/40 mb-1">البريد الإلكتروني</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail size={14} className="text-white/30" />
                      {caseData.clientEmail}
                    </p>
                  </div>
                )}
                <button className="w-full py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                  تواصل الآن
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <DollarSign size={20} className="text-secondary" />
                  الموقف المالي
                </h3>
                <button 
                  onClick={onEdit}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-primary transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">الإجمالي</span>
                  <span className="font-bold">{caseData.totalFees} ريال</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">المدفوع</span>
                  <span className="text-secondary font-bold">{caseData.paidFees} ريال</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                  <span className="text-white/50">المتبقي</span>
                  <span className="text-danger font-bold">{caseData.totalFees - caseData.paidFees} ريال</span>
                </div>
                <button 
                  onClick={onEdit}
                  className="w-full py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-bold hover:bg-secondary/20 transition-colors mt-2"
                >
                  تحديث المدفوعات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
  );
};

const CasesView = ({ 
  cases, 
  caseFilters, 
  setCaseFilters, 
  searchQuery, 
  showFilters, 
  setShowFilters, 
  setShowAddCase, 
  setSelectedCase,
  handleUpdateCaseStatus
}: { 
  cases: Case[], 
  caseFilters: any, 
  setCaseFilters: (f: any) => void, 
  searchQuery: string, 
  showFilters: boolean, 
  setShowFilters: (b: boolean) => void, 
  setShowAddCase: (b: boolean) => void, 
  setSelectedCase: (c: Case) => void,
  handleUpdateCaseStatus: (id: string, status: CaseStatus) => void
}) => {
  const filteredCases = cases.filter(c => {
    const matchesStatus = caseFilters.status === 'الكل' || c.status === caseFilters.status;
    const matchesType = caseFilters.type === 'الكل' || c.type === caseFilters.type;
    const matchesSearch = c.title.includes(searchQuery) || c.clientName.includes(searchQuery) || c.caseNumber.includes(searchQuery);
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">القضايا</h2>
          <p className="text-white/50">إدارة جميع القضايا الموكلة إليك</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2.5 rounded-xl border transition-all flex items-center gap-2",
              showFilters ? "bg-primary border-primary text-white" : "bg-card border-border text-white/60 hover:bg-white/5"
            )}
          >
            <Filter size={20} />
            <span className="hidden md:block">تصفية</span>
          </button>
          <button 
            onClick={() => setShowAddCase(true)}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <Plus size={20} />
            قضية جديدة
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-white/50 pr-1">الحالة</label>
                <div className="flex flex-wrap gap-2">
                  {['الكل', 'نشطة', 'مغلقة', 'معلقة'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setCaseFilters({ ...caseFilters, status: s })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs transition-all",
                        caseFilters.status === s ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/50 pr-1">النوع</label>
                <div className="flex flex-wrap gap-2">
                  {['الكل', 'جنائية', 'مدنية', 'أحوال شخصية', 'تجارية'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setCaseFilters({ ...caseFilters, type: t })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs transition-all",
                        caseFilters.type === t ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map(c => (
          <div 
            key={c.id} 
            onClick={() => setSelectedCase(c)}
            className="bg-card border border-border p-5 rounded-2xl hover:border-primary/50 cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg">#{c.caseNumber}</span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-lg",
                  c.status === 'نشطة' ? "bg-secondary/20 text-secondary" : 
                  c.status === 'مغلقة' ? "bg-white/10 text-white/40" : "bg-accent/20 text-accent"
                )}>{c.status}</span>
              </div>
              {c.status !== 'مغلقة' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateCaseStatus(c.id, 'مغلقة');
                  }}
                  className="p-1.5 bg-white/5 hover:bg-success/20 text-white/40 hover:text-success rounded-lg transition-all"
                  title="إغلاق القضية"
                >
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>{c.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gavel size={14} />
                <span>{c.court}</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">نسبة الإنجاز</span>
                <span className="font-bold">{c.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${c.progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
        ))}
        {filteredCases.length === 0 && (
          <div className="col-span-full py-20 text-center text-white/30">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد قضايا تطابق خيارات التصفية</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ cases, clients, sessions }: { 
  cases: Case[], 
  clients: Client[], 
  sessions: Session[] 
}) => (
  <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">لوحة التحكم</h2>
        <p className="text-white/50 mt-1 text-sm md:text-base">أهلاً بك يا سيادة المحامي محمد الكامل</p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative flex-1 lg:flex-none">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="بحث..." 
            className="bg-card border border-border rounded-xl pr-10 pl-4 py-2.5 w-full lg:w-64 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={<Briefcase className="text-primary" />} label="القضايا النشطة" value={cases.filter(c => c.status === 'نشطة').length} color="primary" />
      <StatCard icon={<Users className="text-secondary" />} label="العملاء" value={clients.length} color="secondary" />
      <StatCard icon={<Calendar className="text-accent" />} label="الجلسات القادمة" value={sessions.length} color="accent" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          ملخص القضايا
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262635" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#15151e', border: '1px solid #262635', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="cases" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            أقرب الجلسات
          </h3>
          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">{sessions.length} جلسات</span>
        </div>
        <div className="space-y-4">
          {sessions.length > 0 ? sessions.slice(0, 3).map(session => (
            <div key={session.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex flex-col items-center justify-center text-accent shrink-0">
                <span className="text-[10px] font-bold leading-none">{format(parseISO(session.date), 'dd')}</span>
                <span className="text-[8px] uppercase">{format(parseISO(session.date), 'MMM', { locale: ar })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{session.caseTitle}</p>
                <p className="text-[10px] text-white/40 truncate">الموكل: {session.clientName}</p>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-accent">{session.time}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-48 text-white/30">
              <Calendar size={40} className="mb-3 opacity-20" />
              <p className="text-sm">لا توجد جلسات قادمة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <div className="bg-card border border-border p-6 rounded-2xl group hover:border-primary/50 transition-all duration-300">
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", 
      color === 'primary' ? "bg-primary/10" : color === 'secondary' ? "bg-secondary/10" : "bg-accent/10")}>
      {icon}
    </div>
    <p className="text-white/50 text-sm font-medium">{label}</p>
    <h4 className="text-3xl font-bold mt-1">{value}</h4>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, handleLogout }: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void, 
  handleLogout: () => void 
}) => (
  <div className="hidden md:flex fixed right-0 top-0 h-full w-64 bg-card border-l border-border flex-col py-6 z-40">
    <div className="px-6 mb-10 flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
        <Scale className="text-white" size={24} />
      </div>
      <div className="hidden md:block">
        <h1 className="font-bold text-sm leading-tight">المحامي محمد الكامل</h1>
        <p className="text-[10px] text-white/50">نظام الإدارة القانونية الرقمي</p>
      </div>
    </div>

    <nav className="flex-1 px-3 space-y-2">
      <SidebarItem icon={<LayoutDashboard size={20} />} label="الرئيسية" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
      <SidebarItem icon={<Briefcase size={20} />} label="القضايا" active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} />
      <SidebarItem icon={<Users size={20} />} label="العملاء" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
      <SidebarItem icon={<Receipt size={20} />} label="كشف الحساب" active={activeTab === 'statements'} onClick={() => setActiveTab('statements')} />
      <SidebarItem icon={<Calendar size={20} />} label="التقويم" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
      <SidebarItem icon={<User size={20} />} label="الملف الشخصي" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      <SidebarItem icon={<Bot size={20} />} label="المستشار الذكي" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
      <SidebarItem icon={<FileText size={20} />} label="الوثائق" active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
    </nav>

    <div className="px-3 mt-auto space-y-2">
      <SidebarItem icon={<Settings size={20} />} label="الإعدادات" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors"
      >
        <LogOut size={20} />
        <span className="hidden md:block font-medium">تسجيل الخروج</span>
      </button>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
      active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/60 hover:bg-white/5 hover:text-white"
    )}
  >
    <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>{icon}</span>
    <span className="hidden md:block font-medium">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-3 rounded-xl transition-all",
      active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40"
    )}
  >
    {icon}
  </button>
);

const DetailCard = ({ label, value, icon, color }: { label: string, value: string, icon: any, color?: string }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
    <div className="flex items-center gap-2 text-white/40 mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className={cn(
      "font-bold", 
      color === 'secondary' ? "text-secondary" : 
      color === 'danger' ? "text-danger" : 
      color === 'accent' ? "text-accent" : 
      color === 'primary' ? "text-primary" : "text-white"
    )}>{value}</p>
  </div>
);

const AIView = ({ messages, input, setInput, handleSendMessage, isTyping, isKeyboardOpen }: { 
  messages: Message[], 
  input: string, 
  setInput: (val: string) => void, 
  handleSendMessage: () => void, 
  isTyping: boolean,
  isKeyboardOpen?: boolean
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-card border border-border rounded-2xl md:rounded-3xl overflow-hidden animate-in fade-in duration-500 shadow-2xl relative",
      isKeyboardOpen ? "h-full min-h-0" : "min-h-[50vh]"
    )}>
      {/* Persistent Header */}
      <header className={cn(
        "p-4 md:p-6 border-b border-border bg-white/5 backdrop-blur-md flex items-center justify-between sticky top-0 z-20",
        isKeyboardOpen && "hidden md:flex"
      )}>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <Bot size={24} className="md:w-7 md:h-7" />
            </div>
            <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-secondary border-2 border-card rounded-full animate-pulse"></span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">المستشار الذكي</h2>
            <p className="text-[10px] md:text-xs text-secondary font-medium flex items-center gap-1.5">
              بروفيسور في القضاء • متصل الآن
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 hide-scrollbar scroll-smooth bg-gradient-to-b from-transparent to-white/[0.02]"
      >
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex gap-3 w-full",
              m.role === 'user' ? "flex-row" : "flex-row-reverse"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-md border-2",
              m.role === 'user' 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "bg-secondary/10 border-secondary/20 text-secondary"
            )}>
              {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-lg transition-all relative",
              m.role === 'user' 
                ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                : "bg-white/5 text-white/90 rounded-tl-none border border-white/10 shadow-black/20 backdrop-blur-sm"
            )}>
              {/* Role Label */}
              <div className={cn(
                "text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50",
                m.role === 'user' ? "text-white/70" : "text-secondary"
              )}>
                {m.role === 'user' ? "أنت" : "المستشار الذكي"}
              </div>
              
              <div className="whitespace-pre-wrap font-medium">{m.text}</div>
              
              <div className={cn(
                "text-[10px] mt-2 font-medium opacity-40 flex items-center gap-1",
                m.role === 'user' ? "justify-start" : "justify-end"
              )}>
                <Clock size={10} />
                {format(new Date(), 'HH:mm')}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 flex-row"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 text-white/90 p-3 md:p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-secondary/50 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-secondary/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-secondary/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Input Area */}
      <div className="p-4 md:p-6 border-t border-border bg-card/50 backdrop-blur-xl sticky bottom-0 z-20">
        <div className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative group">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب استشارتك هنا..."
                className="w-full bg-bg border border-border rounded-2xl px-4 py-3 md:py-4 text-sm focus:outline-none focus:border-primary transition-all resize-none max-h-32 hide-scrollbar group-hover:border-white/20"
              />
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <button className="p-1.5 text-white/20 hover:text-white/60 transition-colors">
                <Clock size={16} />
              </button>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-3.5 md:p-4 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0"
          >
            <Send size={20} />
          </motion.button>
        </div>
        <p className="text-[10px] text-center text-white/20 mt-3">
          المستشار الذكي قد يخطئ، يرجى مراجعة الاستشارات الهامة.
        </p>
        <div className={cn("w-full transition-all duration-300 pointer-events-none md:hidden", isKeyboardOpen ? "h-6" : "h-0")} />
      </div>
    </div>
  );
};

const ProfileView = ({ profile, onUpdate }: { profile: LawyerProfile, onUpdate: (p: LawyerProfile) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LawyerProfile>(profile);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">الملف الشخصي</h2>
          <p className="text-white/50">إدارة معلوماتك الشخصية والمهنية</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <Edit3 size={20} />
            تعديل الملف
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
              className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave}
              className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-secondary/20 transition-all"
            >
              <Check size={20} />
              حفظ التغييرات
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
            
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-card shadow-2xl mx-auto bg-white/5">
                  {formData.profilePicture ? (
                    <img 
                      src={formData.profilePicture} 
                      alt={formData.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      <User size={64} />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Upload size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-1">{formData.name}</h3>
              <p className="text-primary font-medium text-sm mb-6">{formData.title}</p>
              
              <div className="flex justify-center gap-4 border-t border-white/5 pt-6">
                <div className="text-center">
                  {isEditing ? (
                    <input type="text" value={formData.stats?.casesCount || "124"} onChange={e => setFormData({...formData, stats: {...formData.stats, casesCount: e.target.value} as any})} className="w-16 text-center bg-bg border border-border rounded-lg text-lg font-bold outline-none focus:border-primary" />
                  ) : (
                    <p className="text-lg font-bold">{formData.stats?.casesCount || "124"}</p>
                  )}
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">قضية</p>
                </div>
                <div className="w-px h-8 bg-white/5 self-center" />
                <div className="text-center">
                  {isEditing ? (
                    <input type="text" value={formData.stats?.successRate || "98%"} onChange={e => setFormData({...formData, stats: {...formData.stats, successRate: e.target.value} as any})} className="w-16 text-center bg-bg border border-border rounded-lg text-lg font-bold outline-none focus:border-primary" />
                  ) : (
                    <p className="text-lg font-bold">{formData.stats?.successRate || "98%"}</p>
                  )}
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">نجاح</p>
                </div>
                <div className="w-px h-8 bg-white/5 self-center" />
                <div className="text-center">
                  {isEditing ? (
                    <input type="text" value={formData.stats?.years || "10+"} onChange={e => setFormData({...formData, stats: {...formData.stats, years: e.target.value} as any})} className="w-16 text-center bg-bg border border-border rounded-lg text-lg font-bold outline-none focus:border-primary" />
                  ) : (
                    <p className="text-lg font-bold">{formData.stats?.years || "10+"}</p>
                  )}
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">سنوات</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
            <h4 className="font-bold flex items-center gap-2">
              <Phone size={18} className="text-secondary" />
              معلومات الاتصال
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-white/40">
                  <Mail size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/40">البريد الإلكتروني</p>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-bg border border-border rounded-lg px-2 py-1 text-sm mt-1 focus:border-primary outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-white/40">
                  <Phone size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/40">رقم الهاتف</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-bg border border-border rounded-lg px-2 py-1 text-sm mt-1 focus:border-primary outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-white/40">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/40">العنوان</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-bg border border-border rounded-lg px-2 py-1 text-sm mt-1 focus:border-primary outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Professional Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 space-y-8">
            <section className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Scale size={22} className="text-primary" />
                التفاصيل المهنية
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 pr-1">الاسم الكامل</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-medium">
                      {formData.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/40 pr-1">المسمى الوظيفي</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-medium">
                      {formData.title}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/40 pr-1">التخصص الرئيسي</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.specialization} 
                      onChange={e => setFormData({...formData, specialization: e.target.value})}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-medium">
                      {formData.specialization}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/40 pr-1">سنوات الخبرة</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.experience} 
                      onChange={e => setFormData({...formData, experience: e.target.value})}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-primary outline-none"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-medium">
                      {formData.experience}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <FileText size={22} className="text-accent" />
                النبذة التعريفية
              </h4>
              <div className="space-y-2">
                {isEditing ? (
                  <textarea 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    rows={6}
                    className="w-full bg-bg border border-border rounded-2xl px-4 py-3 focus:border-primary outline-none resize-none"
                  />
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-white/70 leading-relaxed italic">
                    "{formData.bio}"
                  </div>
                )}
              </div>
            </section>

            <section className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">إحصائيات الأداء</h4>
                <TrendingUp size={18} className="text-secondary" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-xs text-white/40 mb-1">القضايا المربوحة</p>
                  {isEditing ? (
                    <input type="text" value={formData.stats?.wonCases || "92"} onChange={e => setFormData({...formData, stats: {...formData.stats, wonCases: e.target.value} as any})} className="w-full text-center bg-bg border border-border rounded-lg text-xl font-bold text-success outline-none focus:border-success py-1" />
                  ) : (
                    <p className="text-xl font-bold text-success">{formData.stats?.wonCases || "92"}</p>
                  )}
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-xs text-white/40 mb-1">قيد التنفيذ</p>
                  {isEditing ? (
                    <input type="text" value={formData.stats?.activeCases || "18"} onChange={e => setFormData({...formData, stats: {...formData.stats, activeCases: e.target.value} as any})} className="w-full text-center bg-bg border border-border rounded-lg text-xl font-bold text-primary outline-none focus:border-primary py-1" />
                  ) : (
                    <p className="text-xl font-bold text-primary">{formData.stats?.activeCases || "18"}</p>
                  )}
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-xs text-white/40 mb-1">ساعات المرافعة</p>
                  {isEditing ? (
                    <input type="text" value={formData.stats?.hoursLogged || "1,240"} onChange={e => setFormData({...formData, stats: {...formData.stats, hoursLogged: e.target.value} as any})} className="w-full text-center bg-bg border border-border rounded-lg text-xl font-bold text-accent outline-none focus:border-accent py-1" />
                  ) : (
                    <p className="text-xl font-bold text-accent">{formData.stats?.hoursLogged || "1,240"}</p>
                  )}
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-xs text-white/40 mb-1">رضا العملاء</p>
                  {isEditing ? (
                    <input type="text" value={formData.stats?.clientSatisfaction || "4.9/5"} onChange={e => setFormData({...formData, stats: {...formData.stats, clientSatisfaction: e.target.value} as any})} className="w-full text-center bg-bg border border-border rounded-lg text-xl font-bold text-secondary outline-none focus:border-secondary py-1" />
                  ) : (
                    <p className="text-xl font-bold text-secondary">{formData.stats?.clientSatisfaction || "4.9/5"}</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// كشف الحساب - Account Statements View
// ====================================================
const AccountStatementsView = ({
  cases,
  clients,
  payments,
  setPayments,
  selectedClientId,
  setSelectedClientId,
  lawyerProfile
}: {
  cases: Case[];
  clients: Client[];
  payments: Payment[];
  setPayments: (p: Payment[]) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  lawyerProfile: LawyerProfile;
}) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [addPaymentCaseId, setAddPaymentCaseId] = useState('');
  const [newPayment, setNewPayment] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    note: '',
    type: 'دفعة' as 'دفعة' | 'استرداد'
  });
  const [statementSearchQuery, setStatementSearchQuery] = useState('');
  const [printMode, setPrintMode] = useState(false);

  // Get unique clients who have cases
  const clientsWithCases = useMemo(() => {
    const clientIds = new Set(cases.map(c => c.clientId));
    const clientsFromCases = cases.reduce((acc, c) => {
      if (!acc.find(cl => cl.name === c.clientName)) {
        acc.push({ id: c.clientId, name: c.clientName, phone: c.clientPhone, email: c.clientEmail });
      }
      return acc;
    }, [] as { id: string; name: string; phone: string; email?: string }[]);
    return clientsFromCases.filter(cl => 
      cl.name.includes(statementSearchQuery)
    );
  }, [cases, statementSearchQuery]);

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clientsWithCases.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId, clientsWithCases]);

  const clientCases = useMemo(() => {
    if (!selectedClientId) return [];
    return cases.filter(c => c.clientId === selectedClientId);
  }, [cases, selectedClientId]);

  const clientPayments = useMemo(() => {
    const caseIds = clientCases.map(c => c.id);
    return payments
      .filter(p => caseIds.includes(p.caseId))
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
  }, [payments, clientCases]);

  const totalFees = useMemo(() => clientCases.reduce((sum, c) => sum + c.totalFees, 0), [clientCases]);
  const totalPaid = useMemo(() => {
    return clientPayments.reduce((sum, p) => p.type === 'دفعة' ? sum + p.amount : sum - p.amount, 0);
  }, [clientPayments]);
  const totalRemaining = totalFees - totalPaid;

  const handleAddPayment = () => {
    if (!newPayment.amount || !addPaymentCaseId) return;
    const payment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      caseId: addPaymentCaseId,
      amount: Number(newPayment.amount),
      date: newPayment.date,
      time: newPayment.time,
      note: newPayment.note,
      type: newPayment.type
    };
    setPayments([...payments, payment]);
    setNewPayment({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), note: '', type: 'دفعة' });
    setAddPaymentCaseId('');
    setShowAddPayment(false);
  };

  const handleDeletePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const printStatement = () => {
    window.print();
  };

  if (printMode && selectedClient) {
    return (
      <div className="print-statement bg-white text-black p-8 min-h-screen" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black">{lawyerProfile.name}</h1>
              <p className="text-gray-600">{lawyerProfile.title}</p>
              <p className="text-gray-500 text-sm mt-1">{lawyerProfile.address}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mb-2 mr-auto">
                <Scale className="text-white" size={32} />
              </div>
              <p className="text-gray-500 text-xs">{lawyerProfile.phone}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black border-2 border-gray-800 inline-block px-8 py-2 rounded">
              كشف حساب موكل
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              تاريخ الإصدار: {format(new Date(), 'yyyy-MM-dd')} الساعة {format(new Date(), 'HH:mm')}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <h3 className="font-black text-lg mb-4 border-b border-gray-200 pb-2">بيانات الموكل</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">الاسم: </span><span className="font-bold">{selectedClient.name}</span></div>
              <div><span className="text-gray-500">الهاتف: </span><span className="font-bold">{selectedClient.phone}</span></div>
              {selectedClient.email && <div><span className="text-gray-500">البريد: </span><span className="font-bold">{selectedClient.email}</span></div>}
              <div><span className="text-gray-500">عدد القضايا: </span><span className="font-bold">{clientCases.length}</span></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-black text-lg mb-4 border-b-2 border-gray-800 pb-2">القضايا المرتبطة</h3>
            {clientCases.map(c => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{c.title} (رقم: {c.caseNumber})</h4>
                    <p className="text-gray-500 text-sm">{c.type} - {c.court} | بدأت: {c.startDate}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${c.status === 'نشطة' ? 'bg-green-100 text-green-800' : c.status === 'مغلقة' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex gap-6 mt-2 text-sm">
                  <span>إجمالي الأتعاب: <strong>{c.totalFees.toLocaleString()} ريال</strong></span>
                  <span>المسدد: <strong className="text-green-700">{c.paidFees.toLocaleString()} ريال</strong></span>
                  <span>المتبقي: <strong className="text-red-700">{(c.totalFees - c.paidFees).toLocaleString()} ريال</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h3 className="font-black text-lg mb-4 border-b-2 border-gray-800 pb-2">سجل المدفوعات</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-right">#</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">التاريخ والوقت</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">القضية</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">النوع</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">المبلغ</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">البيان</th>
                </tr>
              </thead>
              <tbody>
                {[...clientPayments].reverse().map((p, idx) => {
                  const linkedCase = cases.find(c => c.id === p.caseId);
                  return (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2">{idx + 1}</td>
                      <td className="border border-gray-300 px-3 py-2">{p.date} {p.time}</td>
                      <td className="border border-gray-300 px-3 py-2">{linkedCase?.title || '---'}</td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className={p.type === 'دفعة' ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{p.type}</span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 font-bold">
                        {p.type === 'استرداد' ? '-' : '+'}{p.amount.toLocaleString()} ريال
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{p.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-900 text-white rounded-xl p-6 mb-8">
            <h3 className="font-black text-lg mb-4">الملخص المالي</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">إجمالي الأتعاب المتفق عليه</p>
                <p className="text-2xl font-black">{totalFees.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">ريال يمني</p>
              </div>
              <div className="bg-green-900/50 rounded-lg p-4">
                <p className="text-green-400 text-xs mb-1">إجمالي المبالغ المسددة</p>
                <p className="text-2xl font-black text-green-400">{totalPaid.toLocaleString()}</p>
                <p className="text-green-400 text-xs">ريال يمني</p>
              </div>
              <div className="bg-red-900/50 rounded-lg p-4">
                <p className="text-red-400 text-xs mb-1">المبلغ المتبقي</p>
                <p className="text-2xl font-black text-red-400">{totalRemaining.toLocaleString()}</p>
                <p className="text-red-400 text-xs">ريال يمني</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 text-center text-gray-500 text-xs">
            <p>تم إصدار هذا الكشف آلياً بواسطة نظام {lawyerProfile.name} للإدارة القانونية</p>
            <p className="mt-1">بتاريخ {format(new Date(), 'dd/MM/yyyy')} الساعة {format(new Date(), 'HH:mm:ss')}</p>
          </div>

          <div className="mt-8 text-center no-print">
            <button
              onClick={() => setPrintMode(false)}
              className="bg-gray-800 text-white px-6 py-3 rounded-xl mr-3"
            >
              رجوع
            </button>
            <button
              onClick={printStatement}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              طباعة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center text-amber-400">
              <Receipt size={22} />
            </div>
            كشف الحساب
          </h2>
          <p className="text-white/50 mt-1 text-sm">متابعة المدفوعات والرصيد المالي للموكلين</p>
        </div>
        {selectedClient && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddPayment(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <PlusCircle size={20} />
              إضافة دفعة
            </button>
            <button
              onClick={() => setPrintMode(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/10 transition-all"
            >
              <Printer size={18} />
              طباعة الكشف
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Clients Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2">
                <Search size={16} className="text-white/40" />
                <input
                  type="text"
                  placeholder="ابحث عن موكل..."
                  value={statementSearchQuery}
                  onChange={e => setStatementSearchQuery(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none flex-1"
                />
              </div>
            </div>
            <div className="divide-y divide-border max-h-[50vh] md:max-h-[70vh] overflow-y-auto">
              {clientsWithCases.length === 0 ? (
                <div className="py-12 text-center text-white/30">
                  <Users size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">لا يوجد موكلون</p>
                </div>
              ) : (
                clientsWithCases.map(client => {
                  const theirCases = cases.filter(c => c.clientId === client.id);
                  const theirPayments = payments.filter(p => theirCases.map(c => c.id).includes(p.caseId));
                  const theirTotal = theirCases.reduce((s, c) => s + c.totalFees, 0);
                  const theirPaid = theirPayments.reduce((s, p) => p.type === 'دفعة' ? s + p.amount : s - p.amount, 0);
                  const isActive = selectedClientId === client.id;

                  return (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClientId(isActive ? null : client.id)}
                      className={`w-full text-right p-4 transition-all hover:bg-white/5 ${isActive ? 'bg-amber-500/10 border-r-2 border-amber-500' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/40'}`}>
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isActive ? 'text-amber-400' : ''}`}>{client.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{theirCases.length} قضية</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-danger font-bold">{(theirTotal - theirPaid).toLocaleString()} ريال متبقي</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!selectedClient ? (
            <div className="flex flex-col items-center justify-center h-80 bg-card border border-border rounded-2xl text-white/30">
              <Receipt size={64} className="mb-4 opacity-20" />
              <p className="text-xl font-bold">اختر موكلاً لعرض كشف حسابه</p>
              <p className="text-sm mt-2 opacity-60">انقر على اسم الموكل من القائمة الجانبية</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-l from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 font-black text-2xl border border-amber-500/30">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-amber-400">{selectedClient.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <Phone size={12} />
                          {selectedClient.phone}
                        </span>
                        {selectedClient.email && (
                          <span className="text-xs text-white/50 flex items-center gap-1">
                            <Mail size={12} />
                            {selectedClient.email}
                          </span>
                        )}
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                          {clientCases.length} قضية
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-white/30">
                    <p>تاريخ التقرير: {format(new Date(), 'dd/MM/yyyy')} الساعة {format(new Date(), 'HH:mm')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <Wallet size={20} className="text-white/60" />
                    </div>
                    <p className="text-sm text-white/50">إجمالي الأتعاب</p>
                  </div>
                  <p className="text-3xl font-black">{totalFees.toLocaleString()}</p>
                  <p className="text-xs text-white/30 mt-1">ريال يمني</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-success/30 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-success" />
                    </div>
                    <p className="text-sm text-white/50">المبلغ المسدد</p>
                  </div>
                  <p className="text-3xl font-black text-success">{totalPaid.toLocaleString()}</p>
                  <p className="text-xs text-success/50 mt-1">
                    {totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0}% من الإجمالي
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="bg-card border border-danger/30 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center">
                      <TrendingDown size={20} className="text-danger" />
                    </div>
                    <p className="text-sm text-white/50">المبلغ المتبقي</p>
                  </div>
                  <p className="text-3xl font-black text-danger">{totalRemaining.toLocaleString()}</p>
                  <p className="text-xs text-danger/50 mt-1">ريال يمني</p>
                </motion.div>
              </div>

              {/* Progress Bar */}
              {totalFees > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold">نسبة السداد</span>
                    <span className={`text-sm font-black ${totalRemaining <= 0 ? 'text-success' : 'text-amber-400'}`}>
                      {totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((totalPaid / totalFees) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${totalRemaining <= 0 ? 'bg-success' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30 mt-2">
                    <span>0</span>
                    <span>{totalFees.toLocaleString()} ريال</span>
                  </div>
                </div>
              )}

              {/* Cases Section */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h4 className="font-bold flex items-center gap-2">
                    <Briefcase size={18} className="text-primary" />
                    القضايا المرتبطة ({clientCases.length})
                  </h4>
                </div>
                <div className="divide-y divide-border">
                  {clientCases.map(c => {
                    const casePayments = payments.filter(p => p.caseId === c.id);
                    const casePaid = casePayments.reduce((s, p) => p.type === 'دفعة' ? s + p.amount : s - p.amount, 0);
                    const caseStartDate = c.startDate;
                    return (
                      <div key={c.id} className="p-5 hover:bg-white/3 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${c.status === 'نشطة' ? 'bg-primary' : c.status === 'مغلقة' ? 'bg-success' : 'bg-warning'}`} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold">{c.title}</h5>
                                <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded">#{c.caseNumber}</span>
                                <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded">{c.type}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${c.status === 'نشطة' ? 'bg-primary/20 text-primary' : c.status === 'مغلقة' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                  {c.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/40">
                                <span className="flex items-center gap-1"><Gavel size={12} /> {c.court}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> بدأت: {caseStartDate}</span>
                                <span className="flex items-center gap-1"><Receipt size={12} /> {casePayments.length} دفعة</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left space-y-1 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-white/40">الأتعاب</p>
                              <p className="font-black">{c.totalFees.toLocaleString()} ريال</p>
                            </div>
                            <div className="flex gap-3">
                              <div className="text-center">
                                <p className="text-[10px] text-success">مسدد</p>
                                <p className="font-bold text-success text-sm">{casePaid.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-danger">متبقي</p>
                                <p className="font-bold text-danger text-sm">{(c.totalFees - casePaid).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            style={{ width: `${c.totalFees > 0 ? Math.min((casePaid / c.totalFees) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h4 className="font-bold flex items-center gap-2">
                    <CreditCard size={18} className="text-amber-400" />
                    سجل المدفوعات ({clientPayments.length})
                  </h4>
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all flex items-center gap-1 border border-amber-500/20"
                  >
                    <Plus size={14} />
                    إضافة دفعة
                  </button>
                </div>

                {clientPayments.length === 0 ? (
                  <div className="py-16 text-center text-white/30">
                    <DollarSign size={48} className="mx-auto mb-3 opacity-20" />
                    <p>لا توجد مدفوعات مسجلة بعد</p>
                    <p className="text-xs mt-1 opacity-60">اضغط "إضافة دفعة" لتسجيل أول دفعة</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {clientPayments.map((payment, idx) => {
                      const linkedCase = cases.find(c => c.id === payment.caseId);
                      // Running balance (from oldest to newest, reversed here)
                      return (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="p-4 hover:bg-white/3 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment.type === 'دفعة' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                              {payment.type === 'دفعة' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${payment.type === 'دفعة' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                  {payment.type}
                                </span>
                                <span className="text-sm font-medium">{payment.note || 'لا يوجد بيان'}</span>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/40">
                                <span className="flex items-center gap-1">
                                  <Briefcase size={11} />
                                  {linkedCase?.title || 'قضية غير محددة'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />
                                  {payment.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  {payment.time}
                                </span>
                              </div>
                            </div>
                            <div className="text-left flex items-center gap-3">
                              <div>
                                <p className={`text-lg font-black ${payment.type === 'دفعة' ? 'text-success' : 'text-danger'}`}>
                                  {payment.type === 'استرداد' ? '-' : '+'}{payment.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-white/30 text-left">ريال</p>
                              </div>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="p-1.5 text-white/20 hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="حذف"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAddPayment && (
          <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] md:h-auto"
            >
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard size={20} className="text-amber-400" />
                  إضافة دفعة جديدة
                </h2>
                <button onClick={() => setShowAddPayment(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                {/* Select Case */}
                <div className="space-y-1">
                  <label className="text-xs text-white/50 pr-1">القضية</label>
                  <select
                    value={addPaymentCaseId}
                    onChange={e => setAddPaymentCaseId(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- اختر القضية --</option>
                    {(selectedClient
                      ? clientCases
                      : cases
                    ).map(c => (
                      <option key={c.id} value={c.id}>{c.title} - {c.clientName}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-xs text-white/50 pr-1">نوع الحركة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['دفعة', 'استرداد'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setNewPayment({ ...newPayment, type: t })}
                        className={`py-2.5 rounded-xl border font-bold text-sm transition-all ${newPayment.type === t ? (t === 'دفعة' ? 'bg-success/20 border-success text-success' : 'bg-danger/20 border-danger text-danger') : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                      >
                        {t === 'دفعة' ? '+ دفعة' : '- استرداد'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs text-white/50 pr-1">المبلغ (ريال)</label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 pr-1">التاريخ</label>
                    <input
                      type="date"
                      value={newPayment.date}
                      onChange={e => setNewPayment({ ...newPayment, date: e.target.value })}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 pr-1">الوقت</label>
                    <input
                      type="time"
                      value={newPayment.time}
                      onChange={e => setNewPayment({ ...newPayment, time: e.target.value })}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <label className="text-xs text-white/50 pr-1">البيان / الملاحظة</label>
                  <input
                    type="text"
                    value={newPayment.note}
                    onChange={e => setNewPayment({ ...newPayment, note: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none"
                    placeholder="مثال: دفعة أولى عند التوكيل"
                  />
                </div>

                <button
                  onClick={handleAddPayment}
                  disabled={!newPayment.amount || !addPaymentCaseId}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-black transition-all shadow-lg shadow-amber-500/20"
                >
                  حفظ الدفعة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
