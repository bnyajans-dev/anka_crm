import { eq, and, or, gte, lte, desc, asc, sql, count, sum, SQL, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  type User, type InsertUser,
  type Team, type InsertTeam,
  type School, type InsertSchool,
  type Visit, type InsertVisit,
  type Offer, type InsertOffer,
  type Sale, type InsertSale,
  type Appointment, type InsertAppointment,
  type Announcement, type InsertAnnouncement,
  type AuditLog, type InsertAuditLog,
  type SalesTarget, type InsertSalesTarget,
  type Commission, type InsertCommission,
  type TourDefinition, type InsertTourDefinition,
  type OfferTemplate, type InsertOfferTemplate,
  type LeaveRequest, type InsertLeaveRequest,
  type Attachment, type InsertAttachment,
  users, teams, schools, visits, offers, sales, appointments,
  announcements, auditLogs, salesTargets, commissions,
  tourDefinitions, offerTemplates, leaveRequests, attachments
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  listUsers(filters?: { role?: string; team_id?: number; is_active?: boolean }): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  listTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;

  listSchools(currentUser: User, filters?: { city?: string; district?: string; type?: string; region?: string }): Promise<Array<School & { visitCount?: number; lastVisitDate?: Date | null }>>;
  getSchool(id: number, currentUser: User): Promise<(School & { visitCount?: number; offerCount?: number; saleCount?: number }) | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, updates: Partial<InsertSchool>): Promise<School | undefined>;
  deleteSchool(id: number): Promise<boolean>;
  getSchoolTimeline(schoolId: number, currentUser: User): Promise<Array<{ type: string; date: Date; data: any }>>;

  listVisits(currentUser: User, filters?: { school_id?: number; user_id?: number; status?: string; start_date?: Date; end_date?: Date }): Promise<Array<Visit & { schoolName?: string; userName?: string }>>;
  getVisit(id: number, currentUser: User): Promise<(Visit & { schoolName?: string; userName?: string }) | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, updates: Partial<InsertVisit>): Promise<Visit | undefined>;
  deleteVisit(id: number): Promise<boolean>;

  listOffers(currentUser: User, filters?: { school_id?: number; user_id?: number; status?: string }): Promise<Array<Offer & { schoolName?: string; userName?: string }>>;
  getOffer(id: number, currentUser: User): Promise<(Offer & { schoolName?: string; userName?: string }) | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  sendOfferEmail(offerId: number, templateId?: number): Promise<{ success: boolean; message: string }>;

  listSales(currentUser: User, filters?: { school_id?: number; user_id?: number; start_date?: Date; end_date?: Date }): Promise<Array<Sale & { schoolName?: string; userName?: string; offerDetails?: any }>>;
  getSale(id: number, currentUser: User): Promise<(Sale & { schoolName?: string; userName?: string; offerDetails?: any }) | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, updates: Partial<InsertSale>): Promise<Sale | undefined>;

  listAppointments(currentUser: User, filters?: { school_id?: number; user_id?: number; status?: string; start_date?: Date; end_date?: Date }): Promise<Array<Appointment & { schoolName?: string; userName?: string }>>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined>;

  listAnnouncements(currentUser: User): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<boolean>;

  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  listAuditLogs(filters?: { user_id?: number; entity_type?: string; entity_id?: number; start_date?: Date; end_date?: Date }): Promise<Array<AuditLog & { userName?: string }>>;

  createTarget(target: InsertSalesTarget): Promise<SalesTarget>;
  listTargets(filters?: { user_id?: number; period_type?: string; period_year?: number; period_month?: number }): Promise<Array<SalesTarget & { userName?: string }>>;
  getTargetsByUser(userId: number, year: number, month?: number): Promise<SalesTarget[]>;

  createCommission(commission: InsertCommission): Promise<Commission>;
  listCommissions(currentUser: User, filters?: { user_id?: number; start_date?: Date; end_date?: Date }): Promise<Array<Commission & { userName?: string }>>;

  getDashboardSummary(currentUser: User, filters?: { start_date?: Date; end_date?: Date }): Promise<{
    totalVisits: number;
    totalOffers: number;
    totalSales: number;
    totalRevenue: string;
    pendingOffers: number;
    scheduledAppointments: number;
  }>;

  getPerformanceSummary(currentUser: User, year: number, month?: number): Promise<{
    targets: SalesTarget | null;
    actual: {
      visits: number;
      offers: number;
      deals: number;
      revenue: string;
    };
    performance: {
      visitRate: number;
      offerRate: number;
      dealRate: number;
      revenueRate: number;
    };
  }>;

  listTours(filters?: { region?: string }): Promise<TourDefinition[]>;
  createTour(tour: InsertTourDefinition): Promise<TourDefinition>;
  updateTour(id: number, updates: Partial<InsertTourDefinition>): Promise<TourDefinition | undefined>;
  deleteTour(id: number): Promise<boolean>;

  listTemplates(): Promise<OfferTemplate[]>;
  getDefaultTemplate(): Promise<OfferTemplate | undefined>;
  createTemplate(template: InsertOfferTemplate): Promise<OfferTemplate>;
  updateTemplate(id: number, updates: Partial<InsertOfferTemplate>): Promise<OfferTemplate | undefined>;

  listLeaveRequests(currentUser: User, filters?: { user_id?: number; status?: string }): Promise<Array<LeaveRequest & { userName?: string }>>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: number, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined>;

  listAttachments(relatedType: string, relatedId: number): Promise<Array<Attachment & { uploaderName?: string }>>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private buildRBACFilter(currentUser: User, entityUserId?: any): SQL | undefined {
    if (currentUser.role === 'system_admin' || currentUser.role === 'admin') {
      return undefined;
    }

    if (currentUser.role === 'manager') {
      if (!currentUser.team_id) {
        return entityUserId ? eq(entityUserId, currentUser.id) : undefined;
      }
      return or(
        entityUserId ? eq(entityUserId, currentUser.id) : undefined,
        sql`${users.team_id} = ${currentUser.team_id}`
      );
    }

    return entityUserId ? eq(entityUserId, currentUser.id) : undefined;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: { team: true }
    });
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: { team: true }
    });
    return result;
  }

  async listUsers(filters?: { role?: string; team_id?: number; is_active?: boolean }): Promise<User[]> {
    const conditions: SQL[] = [];
    
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    if (filters?.team_id) {
      conditions.push(eq(users.team_id, filters.team_id));
    }
    if (filters?.is_active !== undefined) {
      conditions.push(eq(users.is_active, filters.is_active));
    }

    const result = await db.query.users.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { team: true },
      orderBy: [asc(users.name)]
    });
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user as any).returning();
    return created;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async listTeams(): Promise<Team[]> {
    return await db.query.teams.findMany({
      orderBy: [asc(teams.name)]
    });
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return await db.query.teams.findFirst({
      where: eq(teams.id, id)
    });
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [created] = await db.insert(teams).values(team as any).returning();
    return created;
  }

  async updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updated] = await db.update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async deleteTeam(id: number): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async listSchools(currentUser: User, filters?: { city?: string; district?: string; type?: string; region?: string }): Promise<Array<School & { visitCount?: number; lastVisitDate?: Date | null }>> {
    const conditions: SQL[] = [];
    
    if (filters?.city) {
      conditions.push(eq(schools.city, filters.city));
    }
    if (filters?.district) {
      conditions.push(eq(schools.district, filters.district));
    }
    if (filters?.type) {
      conditions.push(eq(schools.type, filters.type as any));
    }
    if (filters?.region) {
      conditions.push(eq(schools.region, filters.region));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, visits.user_id);

    const schoolsList = await db.query.schools.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(schools.name)]
    });

    const schoolsWithCounts = await Promise.all(
      schoolsList.map(async (school) => {
        const visitQuery = db
          .select({ count: count() })
          .from(visits)
          .where(
            and(
              eq(visits.school_id, school.id),
              rbacFilter
            )
          );

        const lastVisitQuery = db
          .select({ visitDate: visits.visit_date })
          .from(visits)
          .where(
            and(
              eq(visits.school_id, school.id),
              rbacFilter
            )
          )
          .orderBy(desc(visits.visit_date))
          .limit(1);

        const [visitCountResult] = await visitQuery;
        const [lastVisitResult] = await lastVisitQuery;

        return {
          ...school,
          visitCount: visitCountResult?.count || 0,
          lastVisitDate: lastVisitResult?.visitDate || null
        };
      })
    );

    return schoolsWithCounts;
  }

  async getSchool(id: number, currentUser: User): Promise<(School & { visitCount?: number; offerCount?: number; saleCount?: number }) | undefined> {
    const school = await db.query.schools.findFirst({
      where: eq(schools.id, id)
    });

    if (!school) {
      return undefined;
    }

    const rbacFilter = this.buildRBACFilter(currentUser, visits.user_id);

    const [visitCountResult] = await db
      .select({ count: count() })
      .from(visits)
      .where(and(eq(visits.school_id, id), rbacFilter));

    const [offerCountResult] = await db
      .select({ count: count() })
      .from(offers)
      .where(and(eq(offers.school_id, id), rbacFilter ? this.buildRBACFilter(currentUser, offers.user_id) : undefined));

    const [saleCountResult] = await db
      .select({ count: count() })
      .from(sales)
      .where(and(eq(sales.school_id, id), rbacFilter ? this.buildRBACFilter(currentUser, sales.closed_by_user_id) : undefined));

    return {
      ...school,
      visitCount: visitCountResult?.count || 0,
      offerCount: offerCountResult?.count || 0,
      saleCount: saleCountResult?.count || 0
    };
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const [created] = await db.insert(schools).values(school as any).returning();
    return created;
  }

  async updateSchool(id: number, updates: Partial<InsertSchool>): Promise<School | undefined> {
    const [updated] = await db.update(schools)
      .set(updates)
      .where(eq(schools.id, id))
      .returning();
    return updated;
  }

  async deleteSchool(id: number): Promise<boolean> {
    const result = await db.delete(schools).where(eq(schools.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getSchoolTimeline(schoolId: number, currentUser: User): Promise<Array<{ type: string; date: Date; data: any }>> {
    const timeline: Array<{ type: string; date: Date; data: any }> = [];

    const rbacFilter = this.buildRBACFilter(currentUser, visits.user_id);

    const schoolVisits = await db.query.visits.findMany({
      where: and(eq(visits.school_id, schoolId), rbacFilter),
      with: { user: true },
      orderBy: [desc(visits.visit_date)]
    });

    const schoolOffers = await db.query.offers.findMany({
      where: and(eq(offers.school_id, schoolId), this.buildRBACFilter(currentUser, offers.user_id)),
      with: { user: true },
      orderBy: [desc(offers.created_at)]
    });

    const schoolSales = await db.query.sales.findMany({
      where: and(eq(sales.school_id, schoolId), this.buildRBACFilter(currentUser, sales.closed_by_user_id)),
      with: { closedByUser: true },
      orderBy: [desc(sales.closed_date)]
    });

    schoolVisits.forEach(v => {
      timeline.push({
        type: 'visit',
        date: v.visit_date,
        data: { ...v, userName: v.user.name }
      });
    });

    schoolOffers.forEach(o => {
      timeline.push({
        type: 'offer',
        date: o.created_at,
        data: { ...o, userName: o.user.name }
      });
    });

    schoolSales.forEach(s => {
      timeline.push({
        type: 'sale',
        date: s.closed_date,
        data: { ...s, userName: s.closedByUser.name }
      });
    });

    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  }

  async listVisits(currentUser: User, filters?: { school_id?: number; user_id?: number; status?: string; start_date?: Date; end_date?: Date }): Promise<Array<Visit & { schoolName?: string; userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.school_id) {
      conditions.push(eq(visits.school_id, filters.school_id));
    }
    if (filters?.user_id) {
      conditions.push(eq(visits.user_id, filters.user_id));
    }
    if (filters?.status) {
      conditions.push(eq(visits.status, filters.status as any));
    }
    if (filters?.start_date) {
      conditions.push(gte(visits.visit_date, filters.start_date));
    }
    if (filters?.end_date) {
      conditions.push(lte(visits.visit_date, filters.end_date));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, visits.user_id);
    if (rbacFilter) {
      conditions.push(rbacFilter);
    }

    const result = await db.query.visits.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        school: true,
        user: true
      },
      orderBy: [desc(visits.visit_date)]
    });

    return result.map(v => ({
      ...v,
      schoolName: v.school.name,
      userName: v.user.name
    }));
  }

  async getVisit(id: number, currentUser: User): Promise<(Visit & { schoolName?: string; userName?: string }) | undefined> {
    const rbacFilter = this.buildRBACFilter(currentUser, visits.user_id);

    const result = await db.query.visits.findFirst({
      where: and(eq(visits.id, id), rbacFilter),
      with: {
        school: true,
        user: true
      }
    });

    if (!result) {
      return undefined;
    }

    return {
      ...result,
      schoolName: result.school.name,
      userName: result.user.name
    };
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const [created] = await db.insert(visits).values(visit as any).returning();
    return created;
  }

  async updateVisit(id: number, updates: Partial<InsertVisit>): Promise<Visit | undefined> {
    const [updated] = await db.update(visits)
      .set(updates)
      .where(eq(visits.id, id))
      .returning();
    return updated;
  }

  async deleteVisit(id: number): Promise<boolean> {
    const result = await db.delete(visits).where(eq(visits.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async listOffers(currentUser: User, filters?: { school_id?: number; user_id?: number; status?: string }): Promise<Array<Offer & { schoolName?: string; userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.school_id) {
      conditions.push(eq(offers.school_id, filters.school_id));
    }
    if (filters?.user_id) {
      conditions.push(eq(offers.user_id, filters.user_id));
    }
    if (filters?.status) {
      conditions.push(eq(offers.status, filters.status as any));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, offers.user_id);
    if (rbacFilter) {
      conditions.push(rbacFilter);
    }

    const result = await db.query.offers.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        school: true,
        user: true
      },
      orderBy: [desc(offers.created_at)]
    });

    return result.map(o => ({
      ...o,
      schoolName: o.school.name,
      userName: o.user.name
    }));
  }

  async getOffer(id: number, currentUser: User): Promise<(Offer & { schoolName?: string; userName?: string }) | undefined> {
    const rbacFilter = this.buildRBACFilter(currentUser, offers.user_id);

    const result = await db.query.offers.findFirst({
      where: and(eq(offers.id, id), rbacFilter),
      with: {
        school: true,
        user: true
      }
    });

    if (!result) {
      return undefined;
    }

    return {
      ...result,
      schoolName: result.school.name,
      userName: result.user.name
    };
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [created] = await db.insert(offers).values(offer as any).returning();
    return created;
  }

  async updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer | undefined> {
    const [updated] = await db.update(offers)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(offers.id, id))
      .returning();
    return updated;
  }

  async deleteOffer(id: number): Promise<boolean> {
    const result = await db.delete(offers).where(eq(offers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async sendOfferEmail(offerId: number, templateId?: number): Promise<{ success: boolean; message: string }> {
    const offer = await db.query.offers.findFirst({
      where: eq(offers.id, offerId),
      with: { school: true, user: true }
    });

    if (!offer) {
      return { success: false, message: 'Offer not found' };
    }

    const template = templateId
      ? await db.query.offerTemplates.findFirst({ where: eq(offerTemplates.id, templateId) })
      : await this.getDefaultTemplate();

    if (!template) {
      return { success: false, message: 'Template not found' };
    }

    await this.updateOffer(offerId, {
      last_sent_at: new Date(),
      last_sent_status: 'sent',
      status: 'sent'
    });

    return { success: true, message: 'Offer email sent successfully' };
  }

  async listSales(currentUser: User, filters?: { school_id?: number; user_id?: number; start_date?: Date; end_date?: Date }): Promise<Array<Sale & { schoolName?: string; userName?: string; offerDetails?: any }>> {
    const conditions: SQL[] = [];

    if (filters?.school_id) {
      conditions.push(eq(sales.school_id, filters.school_id));
    }
    if (filters?.user_id) {
      conditions.push(eq(sales.closed_by_user_id, filters.user_id));
    }
    if (filters?.start_date) {
      conditions.push(gte(sales.closed_date, filters.start_date));
    }
    if (filters?.end_date) {
      conditions.push(lte(sales.closed_date, filters.end_date));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, sales.closed_by_user_id);
    if (rbacFilter) {
      conditions.push(rbacFilter);
    }

    const result = await db.query.sales.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        school: true,
        closedByUser: true,
        offer: true
      },
      orderBy: [desc(sales.closed_date)]
    });

    return result.map(s => ({
      ...s,
      schoolName: s.school.name,
      userName: s.closedByUser.name,
      offerDetails: s.offer
    }));
  }

  async getSale(id: number, currentUser: User): Promise<(Sale & { schoolName?: string; userName?: string; offerDetails?: any }) | undefined> {
    const rbacFilter = this.buildRBACFilter(currentUser, sales.closed_by_user_id);

    const result = await db.query.sales.findFirst({
      where: and(eq(sales.id, id), rbacFilter),
      with: {
        school: true,
        closedByUser: true,
        offer: true
      }
    });

    if (!result) {
      return undefined;
    }

    return {
      ...result,
      schoolName: result.school.name,
      userName: result.closedByUser.name,
      offerDetails: result.offer
    };
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale as any).returning();
    return created;
  }

  async updateSale(id: number, updates: Partial<InsertSale>): Promise<Sale | undefined> {
    const [updated] = await db.update(sales)
      .set(updates)
      .where(eq(sales.id, id))
      .returning();
    return updated;
  }

  async listAppointments(currentUser: User, filters?: { school_id?: number; user_id?: number; status?: string; start_date?: Date; end_date?: Date }): Promise<Array<Appointment & { schoolName?: string; userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.school_id) {
      conditions.push(eq(appointments.school_id, filters.school_id));
    }
    if (filters?.user_id) {
      conditions.push(eq(appointments.user_id, filters.user_id));
    }
    if (filters?.status) {
      conditions.push(eq(appointments.status, filters.status as any));
    }
    if (filters?.start_date) {
      conditions.push(gte(appointments.start_datetime, filters.start_date));
    }
    if (filters?.end_date) {
      conditions.push(lte(appointments.start_datetime, filters.end_date));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, appointments.user_id);
    if (rbacFilter) {
      conditions.push(rbacFilter);
    }

    const result = await db.query.appointments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        school: true,
        user: true
      },
      orderBy: [desc(appointments.start_datetime)]
    });

    return result.map(a => ({
      ...a,
      schoolName: a.school.name,
      userName: a.user.name
    }));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment as any).returning();
    return created;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async listAnnouncements(currentUser: User): Promise<Announcement[]> {
    const now = new Date();
    const conditions: SQL[] = [
      or(
        eq(announcements.expires_at, null as any),
        gte(announcements.expires_at, now)
      )!
    ];

    if (currentUser.role !== 'system_admin' && currentUser.role !== 'admin') {
      conditions.push(
        or(
          eq(announcements.audience_type, 'all'),
          and(
            eq(announcements.audience_type, 'role'),
            eq(announcements.audience_id, currentUser.role)
          ),
          and(
            eq(announcements.audience_type, 'user'),
            eq(announcements.audience_id, currentUser.id.toString())
          ),
          and(
            eq(announcements.audience_type, 'team'),
            eq(announcements.audience_id, currentUser.team_id?.toString() || '')
          )
        )!
      );
    }

    return await db.query.announcements.findMany({
      where: and(...conditions),
      orderBy: [desc(announcements.created_at)]
    });
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement as any).returning();
    return created;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log as any).returning();
    return created;
  }

  async listAuditLogs(filters?: { user_id?: number; entity_type?: string; entity_id?: number; start_date?: Date; end_date?: Date }): Promise<Array<AuditLog & { userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.user_id) {
      conditions.push(eq(auditLogs.user_id, filters.user_id));
    }
    if (filters?.entity_type) {
      conditions.push(eq(auditLogs.entity_type, filters.entity_type));
    }
    if (filters?.entity_id) {
      conditions.push(eq(auditLogs.entity_id, filters.entity_id));
    }
    if (filters?.start_date) {
      conditions.push(gte(auditLogs.created_at, filters.start_date));
    }
    if (filters?.end_date) {
      conditions.push(lte(auditLogs.created_at, filters.end_date));
    }

    const result = await db.query.auditLogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { user: true },
      orderBy: [desc(auditLogs.created_at)]
    });

    return result.map(log => ({
      ...log,
      userName: (log.user as any)?.name
    }));
  }

  async createTarget(target: InsertSalesTarget): Promise<SalesTarget> {
    const [created] = await db.insert(salesTargets).values(target as any).returning();
    return created;
  }

  async listTargets(filters?: { user_id?: number; period_type?: string; period_year?: number; period_month?: number }): Promise<Array<SalesTarget & { userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.user_id) {
      conditions.push(eq(salesTargets.user_id, filters.user_id));
    }
    if (filters?.period_type) {
      conditions.push(eq(salesTargets.period_type, filters.period_type as any));
    }
    if (filters?.period_year) {
      conditions.push(eq(salesTargets.period_year, filters.period_year));
    }
    if (filters?.period_month) {
      conditions.push(eq(salesTargets.period_month, filters.period_month));
    }

    const result = await db.query.salesTargets.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { user: true },
      orderBy: [desc(salesTargets.period_year), desc(salesTargets.period_month)]
    });

    return result.map(target => ({
      ...target,
      userName: (target.user as any)?.name
    }));
  }

  async getTargetsByUser(userId: number, year: number, month?: number): Promise<SalesTarget[]> {
    const conditions: SQL[] = [
      eq(salesTargets.user_id, userId),
      eq(salesTargets.period_year, year)
    ];

    if (month !== undefined) {
      conditions.push(eq(salesTargets.period_month, month));
    }

    return await db.query.salesTargets.findMany({
      where: and(...conditions)
    });
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [created] = await db.insert(commissions).values(commission as any).returning();
    return created;
  }

  async listCommissions(currentUser: User, filters?: { user_id?: number; start_date?: Date; end_date?: Date }): Promise<Array<Commission & { userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.user_id) {
      conditions.push(eq(commissions.user_id, filters.user_id));
    }
    if (filters?.start_date) {
      conditions.push(gte(commissions.date, filters.start_date));
    }
    if (filters?.end_date) {
      conditions.push(lte(commissions.date, filters.end_date));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, commissions.user_id);
    if (rbacFilter) {
      conditions.push(rbacFilter);
    }

    const result = await db.query.commissions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { user: true },
      orderBy: [desc(commissions.date)]
    });

    return result.map(comm => ({
      ...comm,
      userName: (comm.user as any)?.name
    }));
  }

  async getDashboardSummary(currentUser: User, filters?: { start_date?: Date; end_date?: Date }): Promise<{
    totalVisits: number;
    totalOffers: number;
    totalSales: number;
    totalRevenue: string;
    pendingOffers: number;
    scheduledAppointments: number;
  }> {
    const conditions: SQL[] = [];
    
    if (filters?.start_date) {
      conditions.push(gte(visits.created_at, filters.start_date));
    }
    if (filters?.end_date) {
      conditions.push(lte(visits.created_at, filters.end_date));
    }

    const rbacFilterVisits = this.buildRBACFilter(currentUser, visits.user_id);
    const rbacFilterOffers = this.buildRBACFilter(currentUser, offers.user_id);
    const rbacFilterSales = this.buildRBACFilter(currentUser, sales.closed_by_user_id);
    const rbacFilterAppointments = this.buildRBACFilter(currentUser, appointments.user_id);

    const [visitsCount] = await db
      .select({ count: count() })
      .from(visits)
      .where(and(...conditions, rbacFilterVisits));

    const offerConditions = [...conditions];
    if (filters?.start_date) {
      offerConditions[offerConditions.length - 2] = gte(offers.created_at, filters.start_date);
    }
    if (filters?.end_date) {
      offerConditions[offerConditions.length - 1] = lte(offers.created_at, filters.end_date);
    }

    const [offersCount] = await db
      .select({ count: count() })
      .from(offers)
      .where(and(...offerConditions, rbacFilterOffers));

    const [pendingOffersCount] = await db
      .select({ count: count() })
      .from(offers)
      .where(and(eq(offers.status, 'sent'), rbacFilterOffers));

    const salesConditions: SQL[] = [];
    if (filters?.start_date) {
      salesConditions.push(gte(sales.closed_date, filters.start_date));
    }
    if (filters?.end_date) {
      salesConditions.push(lte(sales.closed_date, filters.end_date));
    }

    const [salesCount] = await db
      .select({ count: count() })
      .from(sales)
      .where(and(...salesConditions, rbacFilterSales));

    const [revenueSum] = await db
      .select({ total: sum(sales.final_revenue_amount) })
      .from(sales)
      .where(and(...salesConditions, rbacFilterSales));

    const now = new Date();
    const [appointmentsCount] = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.status, 'planned'),
        gte(appointments.start_datetime, now),
        rbacFilterAppointments
      ));

    return {
      totalVisits: visitsCount?.count || 0,
      totalOffers: offersCount?.count || 0,
      totalSales: salesCount?.count || 0,
      totalRevenue: revenueSum?.total || '0',
      pendingOffers: pendingOffersCount?.count || 0,
      scheduledAppointments: appointmentsCount?.count || 0
    };
  }

  async getPerformanceSummary(currentUser: User, year: number, month?: number): Promise<{
    targets: SalesTarget | null;
    actual: {
      visits: number;
      offers: number;
      deals: number;
      revenue: string;
    };
    performance: {
      visitRate: number;
      offerRate: number;
      dealRate: number;
      revenueRate: number;
    };
  }> {
    const targetsList = await this.getTargetsByUser(currentUser.id, year, month);
    const targets = targetsList.length > 0 ? targetsList[0] : null;

    let startDate: Date;
    let endDate: Date;

    if (month !== undefined) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    const rbacFilter = this.buildRBACFilter(currentUser, visits.user_id);

    const [visitsCount] = await db
      .select({ count: count() })
      .from(visits)
      .where(and(
        gte(visits.created_at, startDate),
        lte(visits.created_at, endDate),
        rbacFilter
      ));

    const [offersCount] = await db
      .select({ count: count() })
      .from(offers)
      .where(and(
        gte(offers.created_at, startDate),
        lte(offers.created_at, endDate),
        this.buildRBACFilter(currentUser, offers.user_id)
      ));

    const [salesCount] = await db
      .select({ count: count() })
      .from(sales)
      .where(and(
        gte(sales.closed_date, startDate),
        lte(sales.closed_date, endDate),
        this.buildRBACFilter(currentUser, sales.closed_by_user_id)
      ));

    const [revenueSum] = await db
      .select({ total: sum(sales.final_revenue_amount) })
      .from(sales)
      .where(and(
        gte(sales.closed_date, startDate),
        lte(sales.closed_date, endDate),
        this.buildRBACFilter(currentUser, sales.closed_by_user_id)
      ));

    const actual = {
      visits: visitsCount?.count || 0,
      offers: offersCount?.count || 0,
      deals: salesCount?.count || 0,
      revenue: revenueSum?.total || '0'
    };

    const performance = {
      visitRate: targets?.visit_target ? (actual.visits / targets.visit_target) * 100 : 0,
      offerRate: targets?.offer_target ? (actual.offers / targets.offer_target) * 100 : 0,
      dealRate: targets?.deal_target ? (actual.deals / targets.deal_target) * 100 : 0,
      revenueRate: targets?.revenue_target ? (parseFloat(actual.revenue) / parseFloat(targets.revenue_target)) * 100 : 0
    };

    return { targets, actual, performance };
  }

  async listTours(filters?: { region?: string }): Promise<TourDefinition[]> {
    const conditions: SQL[] = [];

    if (filters?.region) {
      conditions.push(eq(tourDefinitions.region, filters.region));
    }

    return await db.query.tourDefinitions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(tourDefinitions.name)]
    });
  }

  async createTour(tour: InsertTourDefinition): Promise<TourDefinition> {
    const [created] = await db.insert(tourDefinitions).values(tour as any).returning();
    return created;
  }

  async updateTour(id: number, updates: Partial<InsertTourDefinition>): Promise<TourDefinition | undefined> {
    const [updated] = await db.update(tourDefinitions)
      .set(updates)
      .where(eq(tourDefinitions.id, id))
      .returning();
    return updated;
  }

  async deleteTour(id: number): Promise<boolean> {
    const result = await db.delete(tourDefinitions).where(eq(tourDefinitions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async listTemplates(): Promise<OfferTemplate[]> {
    return await db.query.offerTemplates.findMany({
      orderBy: [desc(offerTemplates.is_default), asc(offerTemplates.name)]
    });
  }

  async getDefaultTemplate(): Promise<OfferTemplate | undefined> {
    return await db.query.offerTemplates.findFirst({
      where: eq(offerTemplates.is_default, true)
    });
  }

  async createTemplate(template: InsertOfferTemplate): Promise<OfferTemplate> {
    if ((template as any).is_default) {
      await db.update(offerTemplates)
        .set({ is_default: false })
        .where(eq(offerTemplates.is_default, true));
    }

    const [created] = await db.insert(offerTemplates).values(template as any).returning();
    return created;
  }

  async updateTemplate(id: number, updates: Partial<InsertOfferTemplate>): Promise<OfferTemplate | undefined> {
    if ((updates as any).is_default) {
      await db.update(offerTemplates)
        .set({ is_default: false })
        .where(eq(offerTemplates.is_default, true));
    }

    const [updated] = await db.update(offerTemplates)
      .set(updates)
      .where(eq(offerTemplates.id, id))
      .returning();
    return updated;
  }

  async listLeaveRequests(currentUser: User, filters?: { user_id?: number; status?: string }): Promise<Array<LeaveRequest & { userName?: string }>> {
    const conditions: SQL[] = [];

    if (filters?.user_id) {
      conditions.push(eq(leaveRequests.user_id, filters.user_id));
    }
    if (filters?.status) {
      conditions.push(eq(leaveRequests.status, filters.status as any));
    }

    const rbacFilter = this.buildRBACFilter(currentUser, leaveRequests.user_id);
    if (rbacFilter) {
      conditions.push(rbacFilter);
    }

    const result = await db.query.leaveRequests.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { user: true },
      orderBy: [desc(leaveRequests.created_at)]
    });

    return result.map(req => ({
      ...req,
      userName: (req.user as any)?.name
    }));
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [created] = await db.insert(leaveRequests).values(request as any).returning();
    return created;
  }

  async updateLeaveRequest(id: number, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined> {
    const [updated] = await db.update(leaveRequests)
      .set(updates)
      .where(eq(leaveRequests.id, id))
      .returning();
    return updated;
  }

  async listAttachments(relatedType: string, relatedId: number): Promise<Array<Attachment & { uploaderName?: string }>> {
    const result = await db.query.attachments.findMany({
      where: and(
        eq(attachments.related_type, relatedType as any),
        eq(attachments.related_id, relatedId)
      ),
      with: { uploadedByUser: true },
      orderBy: [desc(attachments.uploaded_at)]
    });

    return result.map(att => ({
      ...att,
      uploaderName: (att.uploadedByUser as any)?.name
    }));
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [created] = await db.insert(attachments).values(attachment as any).returning();
    return created;
  }

  async deleteAttachment(id: number): Promise<boolean> {
    const result = await db.delete(attachments).where(eq(attachments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
