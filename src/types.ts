export type CaseStatus = 'نشطة' | 'مغلقة' | 'معلقة';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  court: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  status: CaseStatus;
  startDate: string;
  totalFees: number;
  paidFees: number;
  progress: number;
  priority: 'عالية' | 'متوسطة' | 'منخفضة';
  timeline: TimelineEvent[];
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  isCompleted: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface Session {
  id: string;
  caseId: string;
  caseTitle: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
}

export interface Payment {
  id: string;
  caseId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note: string;
  type: 'دفعة' | 'استرداد';
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface LawyerProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  experience: string;
  bio: string;
  profilePicture?: string;
}
