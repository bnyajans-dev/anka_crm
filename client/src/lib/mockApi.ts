import { useState, useEffect } from 'react';

// --- TYPES ---

export type Role = 'system_admin' | 'admin' | 'manager' | 'sales';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  team_id?: number;
  team_name?: string;
  is_active: boolean;
  region?: string;
  districts?: string[];
  can_manage_expenses?: boolean;
}

export interface TourDefinition {
  id: number;
  name: string;
  description: string;
  default_price_per_student: number;
  default_currency: string;
  default_duration_days: number;
  region: string;
}

export interface School {
  id: number;
  name: string;
  city: string;
  district: string;
  type: 'public' | 'private';
  contact_person?: string;
  contact_phone?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface Visit {
  id: number;
  school_id: number;
  school_name?: string;
  user_id: number;
  user_name?: string;
  visit_date: string;
  status: 'planned' | 'done' | 'cancelled';
  notes?: string;
  contact_person?: string;
  next_step?: string;
}

export interface Offer {
  id: number;
  school_id: number;
  school_name?: string;
  user_id: number;
  user_name?: string;
  tour_name: string;
  student_count: number;
  teacher_count: number;
  price_per_student: number;
  total_price: number;
  currency: string;
  valid_until?: string;
  status: 'draft' | 'sent' | 'negotiation' | 'accepted' | 'rejected';
  contact_name?: string;
  contact_email?: string;
  last_sent_at?: string;
  last_sent_status?: 'success' | 'error';
  last_sent_error?: string;
}

export interface OfferTemplate {
  id: number;
  name: string;
  is_default: boolean;
  email_subject_template: string;
  email_body_template: string;
  pdf_header_template: string;
  pdf_footer_template: string;
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
  created_from_offer?: boolean;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name?: string;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  days_count: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'target_info' | 'campaign' | 'announcement';
  audience_type: 'all' | 'role' | 'user' | 'team';
  audience_id?: number | string;
  created_at: string;
  expires_at?: string;
  is_read?: boolean;
}

export interface Appointment {
  id: number;
  school_id: number;
  school_name?: string;
  user_id: number;
  user_name?: string;
  type: 'visit' | 'call' | 'online_meeting' | 'sale_followup';
  start_datetime: string;
  end_datetime: string;
  status: 'planned' | 'done' | 'cancelled';
  notes?: string;
  is_auto_created?: boolean;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  changes?: string;
  created_at: string;
}

export interface SalesTarget {
  id: number;
  user_id: number;
  user_name?: string;
  period_type: 'month' | 'year';
  period_year: number;
  period_month?: number;
  visit_target: number;
  offer_target: number;
  deal_target: number;
  revenue_target: number;
  created_by_user_id: number;
}

export interface Commission {
  id: number;
  user_id: number;
  source_type: 'sale' | 'bonus';
  source_id: number;
  amount: number;
  currency: string;
  date: string;
  description: string;
}

export interface DashboardSummary {
  total_schools: number;
  total_visits: number;
  total_offers: number;
  total_sales: number;
  total_revenue: number;
  upcoming_appointments_count: number;
}

export interface Attachment {
  id: number;
  related_type: 'school' | 'visit' | 'offer' | 'sale';
  related_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by_user_id: number;
}

export type ExpenseCategory = 'accommodation' | 'transportation' | 'meals' | 'guide_fees' | 'entrance_fees' | 'insurance' | 'marketing' | 'other';
export type ExpensePaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface Expense {
  id: number;
  sale_id: number;
  sale_tour_name?: string;
  sale_school_name?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: string;
  payment_status: ExpensePaymentStatus;
  created_by_user_id: number;
  created_by_user_name?: string;
  created_at: string;
}

export interface SaleWithProfitability extends Sale {
  expenses: Expense[];
  total_expenses: number;
  profit: number;
  profit_margin: number;
}

export interface PerformanceSummary {
  visits_count: number;
  visits_target: number;
  offers_count: number;
  offers_target: number;
  deals_count: number;
  deals_target: number;
  revenue_sum: number;
  revenue_target: number;
}

export interface SchoolSummary extends School {
  visits: Visit[];
  offers: Offer[];
  sales: Sale[];
  appointments: Appointment[];
  attachments: Attachment[];
}

// --- MOCK DATA ---

let MOCK_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@ankatravel.com', role: 'admin', is_active: true, districts: ['Kadıköy', 'Beşiktaş'], can_manage_expenses: true },
  { id: 2, name: 'Manager User', email: 'manager@ankatravel.com', role: 'manager', team_id: 1, team_name: 'Sales Team A', is_active: true, region: 'Marmara', can_manage_expenses: true },
  { id: 3, name: 'Sales Person', email: 'sales@ankatravel.com', role: 'sales', team_id: 1, team_name: 'Sales Team A', is_active: true, region: 'İç Anadolu', districts: ['Çankaya'], can_manage_expenses: false },
  { id: 4, name: 'Another Sales', email: 'sales2@ankatravel.com', role: 'sales', team_id: 2, team_name: 'Sales Team B', is_active: true, region: 'Ege', districts: ['Bornova', 'Konak'], can_manage_expenses: false },
  { id: 5, name: 'System Admin', email: 'sysadmin@ankatravel.com', role: 'system_admin', is_active: true, can_manage_expenses: true },
  { id: 6, name: 'Satış Uzmanı', email: 'uzman@ankatravel.com', role: 'sales', team_id: 1, team_name: 'Sales Team A', is_active: true, region: 'Marmara', districts: ['Kadıköy', 'Üsküdar'], can_manage_expenses: false },
];

let MOCK_TOURS: TourDefinition[] = [
  { id: 1, name: 'Ankara-Çanakkale Turu', description: 'Tarihi Gelibolu yarımadası ve şehitlikler ziyareti.', default_price_per_student: 1500, default_currency: 'TRY', default_duration_days: 2, region: 'Marmara' },
  { id: 2, name: 'Kapadokya Turu', description: 'Peri bacaları, yer altı şehirleri ve balon turu.', default_price_per_student: 2500, default_currency: 'TRY', default_duration_days: 3, region: 'İç Anadolu' },
  { id: 3, name: 'Efes & Şirince Turu', description: 'Antik kent ve köy gezisi.', default_price_per_student: 1200, default_currency: 'TRY', default_duration_days: 1, region: 'Ege' },
];

let MOCK_SCHOOLS: School[] = [
  { id: 1, name: 'Atatürk Anadolu Lisesi', city: 'Ankara', district: 'Çankaya', type: 'public', contact_person: 'Ahmet Yılmaz', region: 'İç Anadolu', latitude: 39.9208, longitude: 32.8541 },
  { id: 2, name: 'Özel Bilgi Koleji', city: 'İstanbul', district: 'Kadıköy', type: 'private', contact_person: 'Ayşe Demir', region: 'Marmara', latitude: 40.9829, longitude: 29.0287 },
  { id: 3, name: 'İzmir Fen Lisesi', city: 'İzmir', district: 'Bornova', type: 'public', contact_person: 'Mehmet Kaya', region: 'Ege', latitude: 38.4622, longitude: 27.2163 },
  { id: 4, name: 'Antalya Anadolu Lisesi', city: 'Antalya', district: 'Muratpaşa', type: 'public', contact_person: 'Zeynep Çelik', region: 'Akdeniz', latitude: 36.8848, longitude: 30.7040 },
];

let MOCK_VISITS: Visit[] = [
  { id: 1, school_id: 1, user_id: 3, visit_date: '2023-10-15T10:00:00', status: 'done', contact_person: 'Ahmet Yılmaz', notes: 'Positive meeting', next_step: 'Send offer' },
  { id: 2, school_id: 2, user_id: 4, visit_date: '2023-10-20T14:00:00', status: 'planned', contact_person: 'Ayşe Demir' },
];

let MOCK_OFFERS: Offer[] = [
  { id: 1, school_id: 1, user_id: 3, tour_name: 'Ankara-Çanakkale Turu', student_count: 40, teacher_count: 2, price_per_student: 1500, total_price: 60000, currency: 'TRY', status: 'sent', contact_name: 'Ahmet Yılmaz', contact_email: 'ahmet@okul.com' },
];

let MOCK_OFFER_TEMPLATES: OfferTemplate[] = [
  {
    id: 1,
    name: 'Varsayılan Teklif Şablonu',
    is_default: true,
    email_subject_template: '{{school_name}} için {{tour_name}} Teklifi',
    email_body_template: 'Sayın {{contact_name}},\n\n{{tour_name}} için hazırladığımız teklif ektedir.\n\nSaygılarımla,\n{{salesperson_name}}',
    pdf_header_template: 'Anka Travel - Özel Okul Gezileri',
    pdf_footer_template: 'Bu teklif {{valid_until}} tarihine kadar geçerlidir.',
  },
];

let MOCK_SALES: Sale[] = [
  { id: 1, offer_id: 1, closed_by_user_id: 3, closed_date: '2023-10-18', final_revenue_amount: 60000, currency: 'TRY', payment_status: 'paid', created_from_offer: true },
];

let MOCK_LEAVES: LeaveRequest[] = [
  { id: 1, user_id: 3, type: 'annual', start_date: '2023-11-01', end_date: '2023-11-05', days_count: 5, status: 'approved', reason: 'Vacation' },
];

let MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Yeni Sezon Hedefleri', message: 'Ekim ayı hedefleri sisteme girilmiştir.', type: 'info', audience_type: 'all', created_at: '2023-10-01' },
];

let MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, school_id: 1, user_id: 3, type: 'call', start_datetime: '2023-10-25T10:00:00', end_datetime: '2023-10-25T10:30:00', status: 'planned', notes: 'Follow up call' },
];

let MOCK_ATTACHMENTS: Attachment[] = [];

let MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 1, user_id: 1, user_name: 'Admin User', action: 'CREATE_USER', entity_type: 'user', entity_id: 3, created_at: '2023-10-01T10:00:00' },
];

let MOCK_COMMISSIONS: Commission[] = [
  { id: 1, user_id: 3, source_type: 'sale', source_id: 1, amount: 1800, currency: 'TRY', date: '2023-10-18', description: 'Commission for Sale #1' },
];

let MOCK_SALES_TARGETS: SalesTarget[] = [
  { id: 1, user_id: 3, period_type: 'month', period_year: 2023, period_month: 10, visit_target: 20, offer_target: 10, deal_target: 5, revenue_target: 100000, created_by_user_id: 1 },
];

let MOCK_EXPENSES: Expense[] = [
  { id: 1, sale_id: 1, category: 'transportation', description: 'Otobüs kiralama', amount: 15000, currency: 'TRY', date: '2023-10-17', payment_status: 'paid', created_by_user_id: 1, created_at: '2023-10-17T10:00:00' },
  { id: 2, sale_id: 1, category: 'accommodation', description: 'Otel konaklama - 40 öğrenci, 2 öğretmen', amount: 20000, currency: 'TRY', date: '2023-10-17', payment_status: 'paid', created_by_user_id: 1, created_at: '2023-10-17T10:15:00' },
  { id: 3, sale_id: 1, category: 'meals', description: 'Yemek organizasyonu', amount: 5000, currency: 'TRY', date: '2023-10-17', payment_status: 'pending', created_by_user_id: 1, created_at: '2023-10-17T10:30:00' },
  { id: 4, sale_id: 1, category: 'guide_fees', description: 'Rehber ücreti', amount: 2000, currency: 'TRY', date: '2023-10-18', payment_status: 'paid', created_by_user_id: 1, created_at: '2023-10-18T09:00:00' },
];

// --- HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('anka_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const filterByRole = <T extends { user_id?: number; closed_by_user_id?: number }>(
  data: T[],
  user: User,
  userField: keyof T = 'user_id' as keyof T
): T[] => {
  if (user.role === 'admin' || user.role === 'system_admin') return data;
  if (user.role === 'sales') {
    return data.filter(item => item[userField] === user.id);
  }
  if (user.role === 'manager') {
    const teamUserIds = MOCK_USERS.filter(u => u.team_id === user.team_id).map(u => u.id);
    return data.filter(item => teamUserIds.includes(item[userField] as number));
  }
  return [];
};

// --- API ---

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      await delay(500);
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) throw new Error('Kullanıcı bulunamadı');
      localStorage.setItem('anka_user', JSON.stringify(user));
      return { token: 'mock-jwt-token-' + user.id, user };
    },
    logout: async (): Promise<void> => {
      await delay(100);
      localStorage.removeItem('anka_user');
    },
    getCurrentUser: async (): Promise<User | null> => {
      await delay(100);
      return getCurrentUser();
    },
  },
  users: {
    list: async (): Promise<User[]> => { await delay(300); return [...MOCK_USERS]; },
    getById: async (id: number): Promise<User> => { await delay(200); return MOCK_USERS.find(u => u.id === id)!; },
    create: async (data: any) => { await delay(300); const user = { ...data, id: Math.random() }; MOCK_USERS.push(user); return user; },
    update: async (id: number, data: any) => {
      await delay(300);
      const idx = MOCK_USERS.findIndex(u => u.id === id);
      if (idx !== -1) {
        MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
        return MOCK_USERS[idx];
      }
      throw new Error('User not found');
    },
    delete: async (id: number) => { await delay(300); MOCK_USERS = MOCK_USERS.filter(u => u.id !== id); },
  },
  teams: {
    list: async (): Promise<any[]> => {
      await delay(300);
      return [
        { id: 1, name: 'Sales Team A', manager_id: 2, manager_name: 'Manager User' },
        { id: 2, name: 'Sales Team B', manager_id: 0, manager_name: 'None' },
      ];
    },
    getById: async (id: number) => { await delay(200); return { id, name: 'Sales Team A', manager_id: 2 }; },
    create: async (data: any) => { await delay(300); return data; },
    update: async (id: number, data: any) => { await delay(300); return data; },
    delete: async (id: number) => { await delay(300); },
  },
  tours: {
    list: async (): Promise<TourDefinition[]> => { await delay(300); return [...MOCK_TOURS]; },
    getById: async (id: number): Promise<TourDefinition> => { await delay(200); return MOCK_TOURS.find(t => t.id === id)!; },
    create: async (data: any) => { await delay(300); const tour = { ...data, id: Math.random() }; MOCK_TOURS.push(tour); return tour; },
    update: async (id: number, data: any) => {
      await delay(300);
      const idx = MOCK_TOURS.findIndex(t => t.id === id);
      if (idx !== -1) {
        MOCK_TOURS[idx] = { ...MOCK_TOURS[idx], ...data };
        return MOCK_TOURS[idx];
      }
      throw new Error('Tour not found');
    },
    delete: async (id: number) => { await delay(300); MOCK_TOURS = MOCK_TOURS.filter(t => t.id !== id); },
  },
  schools: {
    list: async (): Promise<School[]> => { await delay(300); return [...MOCK_SCHOOLS]; },
    getById: async (id: number): Promise<School> => { await delay(200); return MOCK_SCHOOLS.find(s => s.id === id)!; },
    create: async (data: any) => { await delay(400); const school = { ...data, id: Math.random() }; MOCK_SCHOOLS.push(school); return school; },
    update: async (id: number, data: any) => { await delay(400); const idx = MOCK_SCHOOLS.findIndex(s => s.id === id); if (idx !== -1) MOCK_SCHOOLS[idx] = { ...MOCK_SCHOOLS[idx], ...data }; return MOCK_SCHOOLS[idx]; },
    delete: async (id: number) => { await delay(400); MOCK_SCHOOLS = MOCK_SCHOOLS.filter(s => s.id !== id); },
    getSummary: async (id: number): Promise<SchoolSummary> => {
      await delay(500);
      const school = MOCK_SCHOOLS.find(s => s.id === id);
      if (!school) throw new Error('School not found');
      return {
        ...school,
        visits: MOCK_VISITS.filter(v => v.school_id === id),
        offers: MOCK_OFFERS.filter(o => o.school_id === id),
        sales: MOCK_SALES.filter(sal => {
          const offer = MOCK_OFFERS.find(o => o.id === sal.offer_id);
          return offer?.school_id === id;
        }),
        appointments: MOCK_APPOINTMENTS.filter(a => a.school_id === id),
        attachments: MOCK_ATTACHMENTS.filter(a => a.related_type === 'school' && a.related_id === id),
      };
    },
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
        user_name: MOCK_USERS.find(u => u.id === v.user_id)?.name,
      }));
    },
    getById: async (id: number): Promise<Visit> => { await delay(200); return MOCK_VISITS.find(v => v.id === id)!; },
    create: async (data: any) => { await delay(300); MOCK_VISITS.push({ ...data, id: Math.random() }); },
    update: async (id: number, data: any) => { await delay(300); const idx = MOCK_VISITS.findIndex(v => v.id === id); if (idx !== -1) MOCK_VISITS[idx] = { ...MOCK_VISITS[idx], ...data }; },
    delete: async (id: number) => { await delay(300); MOCK_VISITS = MOCK_VISITS.filter(v => v.id !== id); },
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
        user_name: MOCK_USERS.find(u => u.id === o.user_id)?.name,
      }));
    },
    getById: async (id: number): Promise<Offer> => { await delay(200); return MOCK_OFFERS.find(o => o.id === id)!; },
    create: async (data: any) => { await delay(300); const offer = { ...data, id: Math.random() }; MOCK_OFFERS.push(offer); return offer; },
    update: async (id: number, data: any) => {
      await delay(300);
      const offerIndex = MOCK_OFFERS.findIndex(o => o.id === id);
      if (offerIndex === -1) throw new Error('Offer not found');
      const currentUser = getCurrentUser();
      const offer = MOCK_OFFERS[offerIndex];

      if (currentUser) {
        const isSystemAdmin = currentUser.role === 'system_admin';
        if (!isSystemAdmin) {
          const isOwner = offer.user_id === currentUser.id;
          const isPast = offer.valid_until ? new Date(offer.valid_until) < new Date() : false;
          const isLocked = ['accepted', 'rejected'].includes(offer.status);
          if (currentUser.role === 'sales') {
            if (!isOwner) throw new Error('Permission denied: Not owner');
            if (isPast) throw new Error('Permission denied: Offer expired');
            if (isLocked) throw new Error('Permission denied: Offer is locked');
          } else if (currentUser.role === 'manager') {
            if (isPast || isLocked) throw new Error('Permission denied: Offer expired or locked');
          }
        }
      }

      const oldStatus = MOCK_OFFERS[offerIndex].status;
      const newStatus = data.status ?? oldStatus;

      MOCK_OFFERS[offerIndex] = { ...MOCK_OFFERS[offerIndex], ...data };

      if (newStatus === 'accepted' && oldStatus !== 'accepted') {
        const updatedOffer = MOCK_OFFERS[offerIndex];

        const newSale: Sale = {
          id: Math.random(),
          offer_id: updatedOffer.id,
          closed_by_user_id: updatedOffer.user_id,
          closed_date: new Date().toISOString().split('T')[0],
          final_revenue_amount: updatedOffer.total_price,
          currency: updatedOffer.currency,
          payment_status: 'pending',
          created_from_offer: true,
        };
        MOCK_SALES.push(newSale);

        const newAppt: Appointment = {
          id: Math.random(),
          school_id: updatedOffer.school_id,
          user_id: updatedOffer.user_id,
          type: 'visit',
          start_datetime: new Date(Date.now() + 86400000).toISOString(),
          end_datetime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          status: 'planned',
          notes: 'Otomatik: Teklif kabul edildi -> Satış oluşturuldu.',
          is_auto_created: true,
        };
        MOCK_APPOINTMENTS.push(newAppt);

        MOCK_AUDIT_LOGS.push({
          id: Math.random(),
          user_id: updatedOffer.user_id,
          user_name: 'System',
          action: 'OFFER_ACCEPTED_TO_SALE',
          entity_type: 'offer',
          entity_id: updatedOffer.id,
          changes: JSON.stringify({ sale_id: newSale.id, appointment_id: newAppt.id }),
          created_at: new Date().toISOString(),
        });

        MOCK_ANNOUNCEMENTS.push({
          id: Math.random(),
          title: 'Tebrikler!',
          message: 'Teklif kabul edildi, satış kaydın oluşturuldu.',
          type: 'target_info',
          audience_type: 'user',
          audience_id: updatedOffer.user_id,
          created_at: new Date().toISOString(),
        });
      }

      return MOCK_OFFERS[offerIndex];
    },
    delete: async (id: number) => { await delay(300); MOCK_OFFERS = MOCK_OFFERS.filter(o => o.id !== id); },
    sendEmail: async (id: number, emailData: any) => {
      await delay(1000);
      const offerIndex = MOCK_OFFERS.findIndex(o => o.id === id);
      if (offerIndex === -1) throw new Error('Offer not found');
      MOCK_OFFERS[offerIndex].last_sent_at = new Date().toISOString();
      MOCK_OFFERS[offerIndex].last_sent_status = 'success';
      MOCK_AUDIT_LOGS.push({
        id: Math.random(),
        user_id: 1,
        user_name: 'Current User',
        action: 'OFFER_EMAIL_SENT',
        entity_type: 'offer',
        entity_id: id,
        created_at: new Date().toISOString(),
      });
      return { success: true };
    },
  },
  offerTemplates: {
    list: async (): Promise<OfferTemplate[]> => { await delay(300); return [...MOCK_OFFER_TEMPLATES]; },
    getById: async (id: number) => { await delay(200); return MOCK_OFFER_TEMPLATES.find(t => t.id === id); },
    update: async (id: number, data: any) => {
      await delay(300);
      const idx = MOCK_OFFER_TEMPLATES.findIndex(t => t.id === id);
      if (idx !== -1) {
        MOCK_OFFER_TEMPLATES[idx] = { ...MOCK_OFFER_TEMPLATES[idx], ...data };
      }
    },
  },
  targets: {
    list: async (userId?: number, year?: number, month?: number): Promise<SalesTarget[]> => {
      await delay(300);
      const currentUser = getCurrentUser();
      let filtered = MOCK_SALES_TARGETS;

      if (currentUser) {
        if (currentUser.role === 'sales') {
          filtered = filtered.filter(t => t.user_id === currentUser.id);
        } else if (currentUser.role === 'manager') {
          const teamUserIds = MOCK_USERS.filter(u => u.team_id === currentUser.team_id).map(u => u.id);
          filtered = filtered.filter(t => teamUserIds.includes(t.user_id));
        }
      }

      if (userId) filtered = filtered.filter(t => t.user_id === userId);
      if (year) filtered = filtered.filter(t => t.period_year === year);
      if (month) filtered = filtered.filter(t => t.period_month === month);

      return filtered.map(t => ({
        ...t,
        user_name: MOCK_USERS.find(u => u.id === t.user_id)?.name,
      }));
    },
    create: async (data: any): Promise<SalesTarget> => {
      await delay(300);
      const newTarget: SalesTarget = { ...data, id: Math.random(), created_by_user_id: 1 };
      MOCK_SALES_TARGETS.push(newTarget);
      return newTarget;
    },
    update: async (id: number, data: any) => {
      await delay(300);
      const idx = MOCK_SALES_TARGETS.findIndex(t => t.id === id);
      if (idx !== -1) {
        MOCK_SALES_TARGETS[idx] = { ...MOCK_SALES_TARGETS[idx], ...data };
      }
    },
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
          user_name: MOCK_USERS.find(u => u.id === s.closed_by_user_id)?.name,
        };
      });
    },
    create: async (data: any) => { await delay(300); MOCK_SALES.push({ ...data, id: Math.random() }); },
  },
  leaves: {
    list: async (): Promise<LeaveRequest[]> => {
      await delay(300);
      const currentUser = getCurrentUser();
      let filteredLeaves = MOCK_LEAVES;
      if (currentUser) filteredLeaves = filterByRole(MOCK_LEAVES, currentUser);
      return filteredLeaves.map(l => ({
        ...l,
        user_name: MOCK_USERS.find(u => u.id === l.user_id)?.name,
      }));
    },
    create: async (data: any) => { await delay(300); MOCK_LEAVES.push({ ...data, id: Math.random() }); },
    updateStatus: async (id: number, status: any) => { await delay(300); /* mock */ },
  },
  announcements: {
    list: async (): Promise<Announcement[]> => { await delay(200); return [...MOCK_ANNOUNCEMENTS]; },
    create: async (data: any) => { await delay(300); MOCK_ANNOUNCEMENTS.push({ ...data, id: Math.random() }); },
    delete: async (id: number) => { await delay(300); MOCK_ANNOUNCEMENTS = MOCK_ANNOUNCEMENTS.filter(a => a.id !== id); },
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
        user_name: MOCK_USERS.find(u => u.id === a.user_id)?.name,
      }));
    },
    create: async (data: any) => { await delay(300); MOCK_APPOINTMENTS.push({ ...data, id: Math.random() }); },
  },
  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      await delay(500);
      const currentUser = getCurrentUser();
      let multiplier = 1;
      if (currentUser?.role === 'manager') multiplier = 0.5;
      if (currentUser?.role === 'sales') multiplier = 0.2;
      return {
        total_schools: MOCK_SCHOOLS.length,
        total_visits: Math.floor(MOCK_VISITS.length * multiplier),
        total_offers: Math.floor(MOCK_OFFERS.length * multiplier),
        total_sales: Math.floor(MOCK_SALES.length * multiplier),
        total_revenue: Math.floor(
          MOCK_SALES.reduce((acc, curr) => acc + curr.final_revenue_amount, 0) * multiplier
        ),
        upcoming_appointments_count: Math.floor(MOCK_APPOINTMENTS.length * multiplier),
      };
    },
    getCharts: async () => {
      await delay(500);
      return {
        visits_per_day: [
          { date: '01/10', count: 2 },
          { date: '02/10', count: 5 },
          { date: '03/10', count: 3 },
          { date: '04/10', count: 7 },
          { date: '05/10', count: 4 },
          { date: '06/10', count: 6 },
        ],
        revenue_per_month: [
          { month: 'Jun', amount: 50000 },
          { month: 'Jul', amount: 75000 },
          { month: 'Aug', amount: 40000 },
          { month: 'Sep', amount: 90000 },
          { month: 'Oct', amount: 120000 },
        ],
        offers_by_status: [
          { name: 'Draft', value: 5 },
          { name: 'Sent', value: 10 },
          { name: 'Accepted', value: 3 },
          { name: 'Rejected', value: 1 },
        ],
        top_schools: [
          { name: 'Atatürk Anadolu', revenue: 60000 },
          { name: 'Fen Lisesi', revenue: 45000 },
          { name: 'Kolej A', revenue: 30000 },
        ],
      };
    },
  },
  attachments: {
    list: async (relatedType: string, relatedId: number): Promise<Attachment[]> => {
      await delay(300);
      return MOCK_ATTACHMENTS.filter(a => a.related_type === relatedType && a.related_id === relatedId);
    },
    upload: async (data: any): Promise<Attachment> => {
      await delay(800);
      const newAtt: Attachment = {
        id: Math.random(),
        ...data,
        file_url: 'https://via.placeholder.com/150',
        uploaded_at: new Date().toISOString(),
        uploaded_by_user_id: 1,
      };
      MOCK_ATTACHMENTS.push(newAtt);
      return newAtt;
    },
  },
  auditLogs: {
    list: async (): Promise<AuditLog[]> => { await delay(400); return [...MOCK_AUDIT_LOGS]; },
  },
  performance: {
    getSummary: async (userId?: number): Promise<PerformanceSummary> => {
      await delay(500);
      return {
        visits_count: 12,
        visits_target: 20,
        offers_count: 5,
        offers_target: 10,
        deals_count: 2,
        deals_target: 5,
        revenue_sum: 120000,
        revenue_target: 200000,
      };
    },
  },
  commissions: {
    list: async (): Promise<Commission[]> => {
      await delay(300);
      const currentUser = getCurrentUser();
      if (currentUser?.role === 'sales') {
        return MOCK_COMMISSIONS.filter(c => c.user_id === currentUser.id);
      }
      return [...MOCK_COMMISSIONS];
    },
  },
  pdf: {
    generate: async (offerId: number): Promise<string> => {
      await delay(1500);
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    },
  },
  expenses: {
    list: async (saleId?: number): Promise<Expense[]> => {
      await delay(300);
      const currentUser = getCurrentUser();
      if (!currentUser) return [];
      
      const canManage = currentUser.role === 'system_admin' || currentUser.role === 'admin' || currentUser.can_manage_expenses;
      if (!canManage) return [];
      
      let filtered = MOCK_EXPENSES;
      if (saleId) filtered = filtered.filter(e => e.sale_id === saleId);
      
      return filtered.map(exp => {
        const sale = MOCK_SALES.find(s => s.id === exp.sale_id);
        const offer = sale ? MOCK_OFFERS.find(o => o.id === sale.offer_id) : null;
        const school = offer ? MOCK_SCHOOLS.find(sch => sch.id === offer.school_id) : null;
        return {
          ...exp,
          sale_tour_name: offer?.tour_name,
          sale_school_name: school?.name,
          created_by_user_name: MOCK_USERS.find(u => u.id === exp.created_by_user_id)?.name,
        };
      });
    },
    getById: async (id: number): Promise<Expense | undefined> => {
      await delay(200);
      return MOCK_EXPENSES.find(e => e.id === id);
    },
    create: async (data: Omit<Expense, 'id' | 'created_at' | 'created_by_user_name'>): Promise<Expense> => {
      await delay(400);
      const currentUser = getCurrentUser();
      const newExpense: Expense = {
        ...data,
        id: Math.floor(Math.random() * 10000),
        created_by_user_id: currentUser?.id || 1,
        created_at: new Date().toISOString(),
      };
      MOCK_EXPENSES.push(newExpense);
      return newExpense;
    },
    update: async (id: number, data: Partial<Expense>): Promise<Expense | undefined> => {
      await delay(400);
      const idx = MOCK_EXPENSES.findIndex(e => e.id === id);
      if (idx !== -1) {
        MOCK_EXPENSES[idx] = { ...MOCK_EXPENSES[idx], ...data };
        return MOCK_EXPENSES[idx];
      }
      return undefined;
    },
    delete: async (id: number): Promise<boolean> => {
      await delay(300);
      const idx = MOCK_EXPENSES.findIndex(e => e.id === id);
      if (idx !== -1) {
        MOCK_EXPENSES.splice(idx, 1);
        return true;
      }
      return false;
    },
    getSaleWithProfitability: async (saleId: number): Promise<SaleWithProfitability | undefined> => {
      await delay(500);
      const currentUser = getCurrentUser();
      const sale = MOCK_SALES.find(s => s.id === saleId);
      if (!sale) return undefined;
      
      const offer = MOCK_OFFERS.find(o => o.id === sale.offer_id);
      const school = offer ? MOCK_SCHOOLS.find(sch => sch.id === offer.school_id) : null;
      
      const saleWithDetails: Sale = {
        ...sale,
        offer_tour_name: offer?.tour_name,
        school_name: school?.name,
        user_name: MOCK_USERS.find(u => u.id === sale.closed_by_user_id)?.name,
      };
      
      const canManage = currentUser?.role === 'system_admin' || currentUser?.role === 'admin' || currentUser?.can_manage_expenses;
      const saleExpenses = canManage ? MOCK_EXPENSES.filter(e => e.sale_id === saleId) : [];
      const totalExpenses = saleExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const profit = sale.final_revenue_amount - totalExpenses;
      const profitMargin = sale.final_revenue_amount > 0 ? (profit / sale.final_revenue_amount) * 100 : 0;
      
      return {
        ...saleWithDetails,
        expenses: saleExpenses,
        total_expenses: totalExpenses,
        profit,
        profit_margin: profitMargin,
      };
    },
  },
};
