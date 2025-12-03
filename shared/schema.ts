import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['system_admin', 'admin', 'manager', 'sales']);
export const schoolTypeEnum = pgEnum('school_type', ['public', 'private']);
export const visitStatusEnum = pgEnum('visit_status', ['planned', 'done', 'cancelled']);
export const offerStatusEnum = pgEnum('offer_status', ['draft', 'sent', 'negotiation', 'accepted', 'rejected']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'partial', 'cancelled']);
export const leaveTypeEnum = pgEnum('leave_type', ['annual', 'sick', 'unpaid', 'other']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected']);
export const announcementTypeEnum = pgEnum('announcement_type', ['info', 'warning', 'success', 'target_info', 'campaign', 'announcement']);
export const audienceTypeEnum = pgEnum('audience_type', ['all', 'role', 'user', 'team', 'sales', 'manager']);
export const appointmentTypeEnum = pgEnum('appointment_type', ['visit', 'call', 'online_meeting', 'sale_followup']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['planned', 'done', 'cancelled']);
export const sourceTypeEnum = pgEnum('source_type', ['sale', 'bonus']);
export const periodTypeEnum = pgEnum('period_type', ['month', 'year']);
export const relatedTypeEnum = pgEnum('related_type', ['school', 'visit', 'offer', 'sale']);

// Teams Table
export const teams = pgTable("teams", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  region: text("region"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Users Table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default('sales'),
  team_id: integer("team_id").references(() => teams.id),
  is_active: boolean("is_active").default(true).notNull(),
  region: text("region"),
  districts: text("districts").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Tour Definitions Table
export const tourDefinitions = pgTable("tour_definitions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  default_price_per_student: decimal("default_price_per_student", { precision: 10, scale: 2 }).notNull(),
  default_currency: text("default_currency").default('TRY').notNull(),
  default_duration_days: integer("default_duration_days").notNull(),
  region: text("region"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Schools Table
export const schools = pgTable("schools", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  type: schoolTypeEnum("type").notNull(),
  contact_person: text("contact_person"),
  contact_phone: text("contact_phone"),
  contact_email: text("contact_email"),
  region: text("region"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Visits Table
export const visits = pgTable("visits", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  school_id: integer("school_id").references(() => schools.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  visit_date: timestamp("visit_date").notNull(),
  status: visitStatusEnum("status").default('planned').notNull(),
  notes: text("notes"),
  contact_person: text("contact_person"),
  next_step: text("next_step"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Offers Table
export const offers = pgTable("offers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  school_id: integer("school_id").references(() => schools.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  tour_name: text("tour_name").notNull(),
  student_count: integer("student_count").notNull(),
  teacher_count: integer("teacher_count").default(0).notNull(),
  price_per_student: decimal("price_per_student", { precision: 10, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('TRY').notNull(),
  valid_until: timestamp("valid_until"),
  status: offerStatusEnum("status").default('draft').notNull(),
  contact_name: text("contact_name"),
  contact_email: text("contact_email"),
  last_sent_at: timestamp("last_sent_at"),
  last_sent_status: text("last_sent_status"),
  last_sent_error: text("last_sent_error"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Offer Templates Table
export const offerTemplates = pgTable("offer_templates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  is_default: boolean("is_default").default(false).notNull(),
  email_subject_template: text("email_subject_template").notNull(),
  email_body_template: text("email_body_template").notNull(),
  pdf_header_template: text("pdf_header_template").notNull(),
  pdf_footer_template: text("pdf_footer_template").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Sales Table
export const sales = pgTable("sales", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  offer_id: integer("offer_id").references(() => offers.id).notNull(),
  school_id: integer("school_id").references(() => schools.id).notNull(),
  closed_by_user_id: integer("closed_by_user_id").references(() => users.id).notNull(),
  closed_date: timestamp("closed_date").notNull(),
  final_revenue_amount: decimal("final_revenue_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('TRY').notNull(),
  payment_status: paymentStatusEnum("payment_status").default('pending').notNull(),
  created_from_offer: boolean("created_from_offer").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Leave Requests Table
export const leaveRequests = pgTable("leave_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  type: leaveTypeEnum("type").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  days_count: integer("days_count").notNull(),
  status: leaveStatusEnum("status").default('pending').notNull(),
  reason: text("reason"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Announcements Table
export const announcements = pgTable("announcements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: announcementTypeEnum("type").default('info').notNull(),
  audience_type: audienceTypeEnum("audience_type").default('all').notNull(),
  audience_id: text("audience_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
});

// Appointments Table
export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  school_id: integer("school_id").references(() => schools.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  type: appointmentTypeEnum("type").notNull(),
  start_datetime: timestamp("start_datetime").notNull(),
  end_datetime: timestamp("end_datetime").notNull(),
  status: appointmentStatusEnum("status").default('planned').notNull(),
  notes: text("notes"),
  is_auto_created: boolean("is_auto_created").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  entity_type: text("entity_type").notNull(),
  entity_id: integer("entity_id").notNull(),
  changes: text("changes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Sales Targets Table
export const salesTargets = pgTable("sales_targets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  period_type: periodTypeEnum("period_type").notNull(),
  period_year: integer("period_year").notNull(),
  period_month: integer("period_month"),
  visit_target: integer("visit_target").default(0).notNull(),
  offer_target: integer("offer_target").default(0).notNull(),
  deal_target: integer("deal_target").default(0).notNull(),
  revenue_target: decimal("revenue_target", { precision: 12, scale: 2 }).default('0').notNull(),
  created_by_user_id: integer("created_by_user_id").references(() => users.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Commissions Table
export const commissions = pgTable("commissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  source_type: sourceTypeEnum("source_type").notNull(),
  source_id: integer("source_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('TRY').notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Attachments Table
export const attachments = pgTable("attachments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  related_type: relatedTypeEnum("related_type").notNull(),
  related_id: integer("related_id").notNull(),
  file_name: text("file_name").notNull(),
  file_url: text("file_url").notNull(),
  file_type: text("file_type").notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
  uploaded_by_user_id: integer("uploaded_by_user_id").references(() => users.id).notNull(),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, {
    fields: [users.team_id],
    references: [teams.id],
  }),
  visits: many(visits),
  offers: many(offers),
  sales: many(sales),
  leaveRequests: many(leaveRequests),
  appointments: many(appointments),
  auditLogs: many(auditLogs),
  salesTargets: many(salesTargets),
  commissions: many(commissions),
  attachments: many(attachments),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  visits: many(visits),
  offers: many(offers),
  sales: many(sales),
  appointments: many(appointments),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  school: one(schools, {
    fields: [visits.school_id],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [visits.user_id],
    references: [users.id],
  }),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  school: one(schools, {
    fields: [offers.school_id],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [offers.user_id],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  offer: one(offers, {
    fields: [sales.offer_id],
    references: [offers.id],
  }),
  school: one(schools, {
    fields: [sales.school_id],
    references: [schools.id],
  }),
  closedByUser: one(users, {
    fields: [sales.closed_by_user_id],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  school: one(schools, {
    fields: [appointments.school_id],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [appointments.user_id],
    references: [users.id],
  }),
}));

export const salesTargetsRelations = relations(salesTargets, ({ one }) => ({
  user: one(users, {
    fields: [salesTargets.user_id],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [salesTargets.created_by_user_id],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertTeamSchema = createInsertSchema(teams, {
  name: z.string().min(1),
}).omit({ id: true, created_at: true });

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
}).omit({ id: true, created_at: true });

export const insertTourDefinitionSchema = createInsertSchema(tourDefinitions).omit({ id: true, created_at: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, created_at: true });
export const insertVisitSchema = createInsertSchema(visits).omit({ id: true, created_at: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, created_at: true, updated_at: true });
export const insertOfferTemplateSchema = createInsertSchema(offerTemplates).omit({ id: true, created_at: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, created_at: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, created_at: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, created_at: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, created_at: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, created_at: true });
export const insertSalesTargetSchema = createInsertSchema(salesTargets).omit({ id: true, created_at: true });
export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, created_at: true });
export const insertAttachmentSchema = createInsertSchema(attachments).omit({ id: true, uploaded_at: true });

// Select Types
export type Team = typeof teams.$inferSelect;
export type User = typeof users.$inferSelect;
export type TourDefinition = typeof tourDefinitions.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type OfferTemplate = typeof offerTemplates.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SalesTarget = typeof salesTargets.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;

// Insert Types
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTourDefinition = z.infer<typeof insertTourDefinitionSchema>;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type InsertOfferTemplate = z.infer<typeof insertOfferTemplateSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertSalesTarget = z.infer<typeof insertSalesTargetSchema>;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
