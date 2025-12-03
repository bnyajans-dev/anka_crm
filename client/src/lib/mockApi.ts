import { useState, useEffect } from 'react';

// --- TYPES ---

export type Role = 'admin' | 'manager' | 'sales';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  team_id?: number;
  team_name?: string;
  is_active: boolean;
}

export interface Team {
  id: number;
  name: string;
  manager_id?: number;
  manager_name?: string;
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
  school_name?: string;
  user_id: number;
  user_name?: string;
  visit_date: string;
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

let MOCK_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@ankatravel.com', role: 'admin', is_active: true },
  { id: 2, name: 'Manager User', email: 'manager@ankatravel.com', role: 'manager', team_id: 1, team_name: 'Sales Team A', is_active: true },
  { id: 3, name: 'Sales Person', email: 'sales@ankatravel.com', role: 'sales', team_id: 1, team_name: 'Sales Team A', is_active: true },
  { id: 4, name: 'Another Sales', email: 'sales2@ankatravel.com', role: 'sales', team_id: 2, team_name: 'Sales Team B', is_active: true },
];

let MOCK_TEAMS: Team[] = [
  { id: 1, name: 'Sales Team A', manager_id: 2, manager_name: 'Manager User' },
  { id: 2, name: 'Sales Team B', manager_id: 4, manager_name: 'Another Sales' },
];

let MOCK_SCHOOLS: School[] = [
  { id: 1, name: 'Atatürk Anadolu Lisesi', city: 'Ankara', district: 'Çankaya', contact_person: 'Ahmet Yılmaz', contact_phone: '05551112233' },
  { id: 2, name: 'Fen Lisesi', city: 'İstanbul', district: 'Kadıköy', contact_person: 'Ayşe Demir', contact_phone: '05332223344' },
  { id: 3, name: 'Cumhuriyet Ortaokulu', city: 'İzmir', district: 'Karşıyaka', contact_person: 'Mehmet Öz', contact_phone: '05445556677' },
];

let MOCK_VISITS: Visit[] = [
  { id: 1, school_id: 1, user_id: 3, visit_date: '2023-10-15T10:00:00', status: 'done', contact_person: 'Ahmet Yılmaz', notes: 'Positive meeting', next_step: 'Send offer' },
  { id: 2, school_id: 2, user_id: 4, visit_date: '2023-10-20T14:00:00', status: 'planned', contact_person: 'Ayşe Demir' },
];

let MOCK_OFFERS: Offer[] = [
  { id: 1, school_id: 1, user_id: 3, tour_name: 'Ankara-Çanakkale Turu', student_count: 40, teacher_count: 2, price_per_student: 1500, total_price: 60000, currency: 'TRY', status: 'sent' },
];

let MOCK_SALES: Sale[] = [
  { id: 1, offer_id: 1, closed_by_user_id: 3, closed_date: '2023-10-18', final_revenue_amount: 60000, currency: 'TRY', payment_status: 'paid' }
];

let MOCK_LEAVES: LeaveRequest[] = [
  { id: 1, user_id: 3, type: 'annual', start_date: '2023-11-01', end_date: '2023-11-05', total_days: 5, reason: 'Vacation', status: 'pending' }
];

let MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Yeni Sezon Hedefleri', message: 'Ekim ayı hedeflerimiz belirlendi.', type: 'target_info', audience_type: 'all', created_at: '2023-10-01' }
];

let MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, school_id: 2, user_id: 3, type: 'visit', start_date: '2023-10-25T09:00:00', end_date: '2023-10-25T11:00:00', status: 'planned' }
] as any;

// --- HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retrieve current user from localStorage (for mock RBAC)
const getCurrentUser = (): User | undefined => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : undefined;
};

// RBAC Filter Logic (Mock)
const filterByRole = <T>(items: T[], currentUser: User, userIdKey: keyof T = 'user_id' as keyof T): T[] => {
  if (currentUser.role === 'admin') return items;
  if (currentUser.role === 'manager') {
    // Manager sees their team's items
    const teamUserIds = MOCK_USERS.filter(u => u.team_id === currentUser.team_id).map(u => u.id);
    return items.filter((item: any) => item[userIdKey] && teamUserIds.includes(item[userIdKey]));
  }
  // Sales sees only their own
  return items.filter((item: any) => item[userIdKey] === currentUser.id);
};

// --- API ---

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string, user: User }> => {
      await delay(500);
      
      // Simple mock auth logic based on email prefix
      let user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        // Fallback for demo purposes if user doesn't exist in MOCK_USERS yet
        if (email.includes('admin')) user = MOCK_USERS[0];
        else if (email.includes('manager')) user = MOCK_USERS[1];
        else if (email.includes('sales')) user = MOCK_USERS[2];
      }

      if (user) {
        return {
          token: 'mock-jwt-' + Math.random().toString(36),
          user: user
        };
      }
      throw new Error('Invalid credentials');
    }
  },
  users: {
    list: async (): Promise<User[]> => { await delay(300); return [...MOCK_USERS]; },
    getById: async (id: number): Promise<User> => { await delay(200); return MOCK_USERS.find(u => u.id === id)!; },
    create: async (data: Omit<User, 'id'>) => { 
      await delay(400); 
      const newUser = { ...data, id: MOCK_USERS.length + 1 };
      MOCK_USERS.push(newUser); 
      return newUser; 
    },
    update: async (id: number, data: Partial<User>) => { 
      await delay(400); 
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...data };
        return MOCK_USERS[index];
      }
      throw new Error('User not found');
    },
    delete: async (id: number) => { 
      await delay(400); 
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== id); 
    }
  },
  teams: {
    list: async (): Promise<Team[]> => { await delay(300); return [...MOCK_TEAMS]; },
    getById: async (id: number): Promise<Team> => { await delay(200); return MOCK_TEAMS.find(t => t.id === id)!; },
    create: async (data: Omit<Team, 'id'>) => { 
      await delay(400); 
      const newTeam = { ...data, id: MOCK_TEAMS.length + 1 };
      MOCK_TEAMS.push(newTeam); 
      return newTeam; 
    },
    update: async (id: number, data: Partial<Team>) => { 
      await delay(400); 
      const index = MOCK_TEAMS.findIndex(t => t.id === id);
      if (index !== -1) {
        MOCK_TEAMS[index] = { ...MOCK_TEAMS[index], ...data };
        return MOCK_TEAMS[index];
      }
      throw new Error('Team not found');
    },
    delete: async (id: number) => { 
      await delay(400); 
      MOCK_TEAMS = MOCK_TEAMS.filter(t => t.id !== id); 
    }
  },
  schools: {
    list: async (): Promise<School[]> => { await delay(300); return [...MOCK_SCHOOLS]; },
    getById: async (id: number): Promise<School> => { await delay(200); return MOCK_SCHOOLS.find(s => s.id === id)!; },
    create: async (data: any) => { await delay(400); MOCK_SCHOOLS.push({ ...data, id: Math.random() }); return data; },
    update: async (id: number, data: any) => { await delay(400); return data; }, 
    delete: async (id: number) => { await delay(400); MOCK_SCHOOLS = MOCK_SCHOOLS.filter(s => s.id !== id); }
  },
  visits: {
    list: async (): Promise<Visit[]> => { 
      await delay(300); 
      const currentUser = getCurrentUser();
      let filteredVisits = MOCK_VISITS;
      if (currentUser) filteredVisits = filterByRole(MOCK_VISITS, currentUser);

      return filteredVisits.map(v => ({
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
      const currentUser = getCurrentUser();
      let filteredOffers = MOCK_OFFERS;
      if (currentUser) filteredOffers = filterByRole(MOCK_OFFERS, currentUser);

      return filteredOffers.map(o => ({
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
      const currentUser = getCurrentUser();
      let filteredSales = MOCK_SALES;
      if (currentUser) filteredSales = filterByRole(MOCK_SALES, currentUser, 'closed_by_user_id');

      return filteredSales.map(s => {
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
      const currentUser = getCurrentUser();
      let filteredLeaves = MOCK_LEAVES;
      if (currentUser) filteredLeaves = filterByRole(MOCK_LEAVES, currentUser);

      return filteredLeaves.map(l => ({
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
      const currentUser = getCurrentUser();
      let filteredAppts = MOCK_APPOINTMENTS;
      if (currentUser) filteredAppts = filterByRole(MOCK_APPOINTMENTS, currentUser);

      return filteredAppts.map(a => ({
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
      const currentUser = getCurrentUser();
      
      // Mock summary logic based on role
      let multiplier = 1;
      if (currentUser?.role === 'manager') multiplier = 0.5;
      if (currentUser?.role === 'sales') multiplier = 0.2;

      return {
        total_schools: MOCK_SCHOOLS.length,
        total_visits: Math.floor(MOCK_VISITS.length * multiplier),
        total_offers: Math.floor(MOCK_OFFERS.length * multiplier),
        total_sales: Math.floor(MOCK_SALES.length * multiplier),
        total_revenue: Math.floor(MOCK_SALES.reduce((acc, curr) => acc + curr.final_revenue_amount, 0) * multiplier),
        upcoming_appointments_count: Math.floor(MOCK_APPOINTMENTS.length * multiplier)
      };
    }
  }
};
