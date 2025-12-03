import { useState, useEffect } from 'react';

// --- TYPES ---

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales';
}

export interface School {
  id: number;
  name: string;
  city: string;
  district: string;
  contact_person: string;
  contact_phone: string;
}

export interface Visit {
  id: number;
  school_id: number;
  school_name?: string; // Joined for display
  user_id: number;
  user_name?: string; // Joined for display
  visit_date: string; // ISO Date string
  status: 'planned' | 'done' | 'cancelled';
  contact_person?: string;
  notes?: string;
  next_step?: string;
}

export interface Offer {
  id: number;
  school_id: number;
  school_name?: string;
  user_id: number;
  user_name?: string;
  visit_id?: number;
  tour_name: string;
  student_count: number;
  teacher_count: number;
  price_per_student: number;
  total_price: number;
  currency: string;
  valid_until?: string;
  status: 'draft' | 'sent' | 'negotiation' | 'accepted' | 'rejected';
}

export interface Sale {
  id: number;
  offer_id: number;
  offer_tour_name?: string;
  school_name?: string;
  closed_by_user_id: number;
  user_name?: string;
  closed_date: string;
  final_revenue_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'partial' | 'cancelled';
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name?: string;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'announcement' | 'campaign' | 'target_info' | 'warning';
  audience_type: 'all' | 'role' | 'team' | 'user';
  created_at: string;
  expires_at?: string;
}

export interface Appointment {
  id: number;
  school_id: number;
  school_name?: string;
  user_id: number;
  user_name?: string;
  type: 'visit' | 'call' | 'online_meeting';
  start_datetime: string;
  end_datetime: string;
  status: 'planned' | 'done' | 'cancelled';
  notes?: string;
}

export interface DashboardSummary {
  total_schools: number;
  total_visits: number;
  total_offers: number;
  total_sales: number;
  total_revenue: number;
  upcoming_appointments_count: number;
}

// --- MOCK DATA ---

const MOCK_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@ankatravel.com', role: 'admin' },
  { id: 2, name: 'Sales Person 1', email: 'sales1@ankatravel.com', role: 'sales' },
];

let MOCK_SCHOOLS: School[] = [
  { id: 1, name: 'Atatürk Anadolu Lisesi', city: 'Ankara', district: 'Çankaya', contact_person: 'Ahmet Yılmaz', contact_phone: '05551112233' },
  { id: 2, name: 'Fen Lisesi', city: 'İstanbul', district: 'Kadıköy', contact_person: 'Ayşe Demir', contact_phone: '05332223344' },
  { id: 3, name: 'Cumhuriyet Ortaokulu', city: 'İzmir', district: 'Karşıyaka', contact_person: 'Mehmet Öz', contact_phone: '05445556677' },
];

let MOCK_VISITS: Visit[] = [
  { id: 1, school_id: 1, user_id: 1, visit_date: '2023-10-15T10:00:00', status: 'done', contact_person: 'Ahmet Yılmaz', notes: 'Positive meeting', next_step: 'Send offer' },
  { id: 2, school_id: 2, user_id: 2, visit_date: '2023-10-20T14:00:00', status: 'planned', contact_person: 'Ayşe Demir' },
];

let MOCK_OFFERS: Offer[] = [
  { id: 1, school_id: 1, user_id: 1, tour_name: 'Ankara-Çanakkale Turu', student_count: 40, teacher_count: 2, price_per_student: 1500, total_price: 60000, currency: 'TRY', status: 'sent' },
];

let MOCK_SALES: Sale[] = [
  { id: 1, offer_id: 1, closed_by_user_id: 1, closed_date: '2023-10-18', final_revenue_amount: 60000, currency: 'TRY', payment_status: 'paid' }
];

let MOCK_LEAVES: LeaveRequest[] = [
  { id: 1, user_id: 2, type: 'annual', start_date: '2023-11-01', end_date: '2023-11-05', total_days: 5, reason: 'Vacation', status: 'pending' }
];

let MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Yeni Sezon Hedefleri', message: 'Ekim ayı hedeflerimiz belirlendi.', type: 'target_info', audience_type: 'all', created_at: '2023-10-01' }
];

let MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, school_id: 2, user_id: 2, type: 'visit', start_date: '2023-10-25T09:00:00', end_date: '2023-10-25T11:00:00', status: 'planned' }
] as any; // Date structure adjustment might be needed in real app

// --- HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API ---

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string, user: User }> => {
      await delay(500);
      if (email && password) {
        return {
          token: 'mock-jwt-' + Math.random().toString(36),
          user: MOCK_USERS[0]
        };
      }
      throw new Error('Invalid credentials');
    }
  },
  schools: {
    list: async (): Promise<School[]> => { await delay(300); return [...MOCK_SCHOOLS]; },
    getById: async (id: number): Promise<School> => { await delay(200); return MOCK_SCHOOLS.find(s => s.id === id)!; },
    create: async (data: any) => { await delay(400); MOCK_SCHOOLS.push({ ...data, id: Math.random() }); return data; },
    update: async (id: number, data: any) => { await delay(400); return data; }, // Simplified
    delete: async (id: number) => { await delay(400); MOCK_SCHOOLS = MOCK_SCHOOLS.filter(s => s.id !== id); }
  },
  visits: {
    list: async (): Promise<Visit[]> => { 
      await delay(300); 
      return MOCK_VISITS.map(v => ({
        ...v, 
        school_name: MOCK_SCHOOLS.find(s => s.id === v.school_id)?.name,
        user_name: MOCK_USERS.find(u => u.id === v.user_id)?.name
      })); 
    },
    getById: async (id: number) => { await delay(200); return MOCK_VISITS.find(v => v.id === id); },
    create: async (data: any) => { await delay(300); MOCK_VISITS.push({ ...data, id: Math.random() }); },
    update: async (id: number, data: any) => { await delay(300); },
    delete: async (id: number) => { await delay(300); MOCK_VISITS = MOCK_VISITS.filter(v => v.id !== id); }
  },
  offers: {
    list: async (): Promise<Offer[]> => { 
      await delay(300); 
      return MOCK_OFFERS.map(o => ({
        ...o,
        school_name: MOCK_SCHOOLS.find(s => s.id === o.school_id)?.name,
        user_name: MOCK_USERS.find(u => u.id === o.user_id)?.name
      }));
    },
    create: async (data: any) => { await delay(300); MOCK_OFFERS.push({...data, id: Math.random()}); },
    update: async (id: number, data: any) => { await delay(300); },
    delete: async (id: number) => { await delay(300); MOCK_OFFERS = MOCK_OFFERS.filter(o => o.id !== id); }
  },
  sales: {
    list: async (): Promise<Sale[]> => {
      await delay(300);
      return MOCK_SALES.map(s => {
        const offer = MOCK_OFFERS.find(o => o.id === s.offer_id);
        const school = offer ? MOCK_SCHOOLS.find(sch => sch.id === offer.school_id) : null;
        return {
          ...s,
          offer_tour_name: offer?.tour_name,
          school_name: school?.name,
          user_name: MOCK_USERS.find(u => u.id === s.closed_by_user_id)?.name
        };
      });
    },
    create: async (data: any) => { await delay(300); MOCK_SALES.push({...data, id: Math.random()}); }
  },
  leaves: {
    list: async (): Promise<LeaveRequest[]> => {
      await delay(300);
      return MOCK_LEAVES.map(l => ({
        ...l,
        user_name: MOCK_USERS.find(u => u.id === l.user_id)?.name
      }));
    },
    create: async (data: any) => { await delay(300); MOCK_LEAVES.push({...data, id: Math.random()}); },
    updateStatus: async (id: number, status: any) => { await delay(300); }
  },
  announcements: {
    list: async (): Promise<Announcement[]> => { await delay(200); return [...MOCK_ANNOUNCEMENTS]; },
    create: async (data: any) => { await delay(300); MOCK_ANNOUNCEMENTS.push({...data, id: Math.random()}); },
    delete: async (id: number) => { await delay(300); MOCK_ANNOUNCEMENTS = MOCK_ANNOUNCEMENTS.filter(a => a.id !== id); }
  },
  appointments: {
    list: async (): Promise<Appointment[]> => { 
      await delay(300); 
      return MOCK_APPOINTMENTS.map(a => ({
        ...a,
        school_name: MOCK_SCHOOLS.find(s => s.id === a.school_id)?.name,
        user_name: MOCK_USERS.find(u => u.id === a.user_id)?.name
      }));
    },
    create: async (data: any) => { await delay(300); MOCK_APPOINTMENTS.push({...data, id: Math.random()}); }
  },
  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      await delay(500);
      return {
        total_schools: MOCK_SCHOOLS.length,
        total_visits: MOCK_VISITS.length,
        total_offers: MOCK_OFFERS.length,
        total_sales: MOCK_SALES.length,
        total_revenue: MOCK_SALES.reduce((acc, curr) => acc + curr.final_revenue_amount, 0),
        upcoming_appointments_count: MOCK_APPOINTMENTS.length
      };
    }
  }
};
