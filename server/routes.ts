import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { type User } from "@shared/schema";

interface AuthRequest extends Request {
  user?: User;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = await storage.getUser(parseInt(userId as string));
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  req.user = user;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get('/api/users', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), req.body);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/teams', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const teams = await storage.listTeams();
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/teams', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const team = await storage.createTeam(req.body);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/schools', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters = {
        city: req.query.city as string,
        district: req.query.district as string,
        type: req.query.type as string,
        region: req.query.region as string
      };
      const schools = await storage.listSchools(req.user!, filters);
      res.json(schools);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/schools/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const school = await storage.getSchool(parseInt(req.params.id), req.user!);
      if (!school) return res.status(404).json({ error: 'School not found' });
      res.json(school);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/schools/:id/timeline', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeline = await storage.getSchoolTimeline(parseInt(req.params.id), req.user!);
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/schools', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const school = await storage.createSchool(req.body);
      res.status(201).json(school);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/schools/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const school = await storage.updateSchool(parseInt(req.params.id), req.body);
      if (!school) return res.status(404).json({ error: 'School not found' });
      res.json(school);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/schools/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteSchool(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/visits', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.school_id) filters.school_id = parseInt(req.query.school_id as string);
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.status) filters.status = req.query.status;
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const visits = await storage.listVisits(req.user!, filters);
      res.json(visits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/visits/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const visit = await storage.getVisit(parseInt(req.params.id), req.user!);
      if (!visit) return res.status(404).json({ error: 'Visit not found' });
      res.json(visit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/visits', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const visit = await storage.createVisit({ ...req.body, user_id: req.user!.id });
      res.status(201).json(visit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/visits/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const visit = await storage.updateVisit(parseInt(req.params.id), req.body);
      if (!visit) return res.status(404).json({ error: 'Visit not found' });
      res.json(visit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/visits/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteVisit(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/offers', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.school_id) filters.school_id = parseInt(req.query.school_id as string);
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.status) filters.status = req.query.status;
      
      const offers = await storage.listOffers(req.user!, filters);
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/offers/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const offer = await storage.getOffer(parseInt(req.params.id), req.user!);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      res.json(offer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/offers', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const offer = await storage.createOffer({ ...req.body, user_id: req.user!.id });
      res.status(201).json(offer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/offers/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const offer = await storage.updateOffer(parseInt(req.params.id), req.body);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      res.json(offer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/offers/:id/send', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const result = await storage.sendOfferEmail(parseInt(req.params.id), req.body.template_id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/sales', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.school_id) filters.school_id = parseInt(req.query.school_id as string);
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const sales = await storage.listSales(req.user!, filters);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/sales/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const sale = await storage.getSale(parseInt(req.params.id), req.user!);
      if (!sale) return res.status(404).json({ error: 'Sale not found' });
      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/sales/:id/profitability', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const result = await storage.getSaleWithProfitability(parseInt(req.params.id), req.user!);
      if (!result) return res.status(404).json({ error: 'Sale not found' });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/sales', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const sale = await storage.createSale({ ...req.body, closed_by_user_id: req.user!.id });
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/sales/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const sale = await storage.updateSale(parseInt(req.params.id), req.body);
      if (!sale) return res.status(404).json({ error: 'Sale not found' });
      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.sale_id) filters.sale_id = parseInt(req.query.sale_id as string);
      if (req.query.category) filters.category = req.query.category;
      if (req.query.payment_status) filters.payment_status = req.query.payment_status;
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const expenses = await storage.listExpenses(req.user!, filters);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/expenses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const expense = await storage.getExpense(parseInt(req.params.id), req.user!);
      if (!expense) return res.status(404).json({ error: 'Expense not found' });
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const expense = await storage.createExpense({ ...req.body, created_by_user_id: req.user!.id }, req.user!);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  });

  app.put('/api/expenses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const expense = await storage.updateExpense(parseInt(req.params.id), req.body, req.user!);
      if (!expense) return res.status(404).json({ error: 'Expense not found' });
      res.json(expense);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  });

  app.delete('/api/expenses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteExpense(parseInt(req.params.id), req.user!);
      res.status(204).send();
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  });

  app.get('/api/appointments', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.school_id) filters.school_id = parseInt(req.query.school_id as string);
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.status) filters.status = req.query.status;
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const appointments = await storage.listAppointments(req.user!, filters);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/appointments', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const appointment = await storage.createAppointment({ ...req.body, user_id: req.user!.id });
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/appointments/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const appointment = await storage.updateAppointment(parseInt(req.params.id), req.body);
      if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
      res.json(appointment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/announcements', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const announcements = await storage.listAnnouncements(req.user!);
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/announcements', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const announcement = await storage.createAnnouncement(req.body);
      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/announcements/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tours', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters = { region: req.query.region as string };
      const tours = await storage.listTours(filters);
      res.json(tours);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/tours', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const tour = await storage.createTour(req.body);
      res.status(201).json(tour);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/tours/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const tour = await storage.updateTour(parseInt(req.params.id), req.body);
      if (!tour) return res.status(404).json({ error: 'Tour not found' });
      res.json(tour);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/tours/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTour(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const templates = await storage.listTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/targets', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.period_type) filters.period_type = req.query.period_type;
      if (req.query.period_year) filters.period_year = parseInt(req.query.period_year as string);
      if (req.query.period_month) filters.period_month = parseInt(req.query.period_month as string);
      
      const targets = await storage.listTargets(filters);
      res.json(targets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/targets', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const target = await storage.createTarget({ ...req.body, created_by_user_id: req.user!.id });
      res.status(201).json(target);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/leave-requests', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.status) filters.status = req.query.status;
      
      const requests = await storage.listLeaveRequests(req.user!, filters);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/leave-requests', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const request = await storage.createLeaveRequest({ ...req.body, user_id: req.user!.id });
      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/leave-requests/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const request = await storage.updateLeaveRequest(parseInt(req.params.id), req.body);
      if (!request) return res.status(404).json({ error: 'Leave request not found' });
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/commissions', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const commissions = await storage.listCommissions(req.user!, filters);
      res.json(commissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const filters: any = {};
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const summary = await storage.getDashboardSummary(req.user!, filters);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/performance', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      
      const performance = await storage.getPerformanceSummary(req.user!, year, month);
      res.json(performance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/audit-logs', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== 'system_admin' && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const filters: any = {};
      if (req.query.user_id) filters.user_id = parseInt(req.query.user_id as string);
      if (req.query.entity_type) filters.entity_type = req.query.entity_type;
      if (req.query.start_date) filters.start_date = new Date(req.query.start_date as string);
      if (req.query.end_date) filters.end_date = new Date(req.query.end_date as string);
      
      const logs = await storage.listAuditLogs(filters);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/attachments', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const relatedType = req.query.related_type as string;
      const relatedId = parseInt(req.query.related_id as string);
      
      if (!relatedType || !relatedId) {
        return res.status(400).json({ error: 'related_type and related_id are required' });
      }
      
      const attachments = await storage.listAttachments(relatedType, relatedId);
      res.json(attachments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/attachments', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const attachment = await storage.createAttachment({ ...req.body, uploaded_by_user_id: req.user!.id });
      res.status(201).json(attachment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/attachments/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteAttachment(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
