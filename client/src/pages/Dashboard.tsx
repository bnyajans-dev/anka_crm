import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api, User, Visit, Offer, Sale, SalesTarget, Appointment } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { School, Briefcase, CheckCircle, CreditCard, TrendingUp, Users, Calendar, Loader2, Clock, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

type TimeFilter = 'this_month' | 'last_month' | 'this_year' | 'all';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_month');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  const [users, setUsers] = useState<User[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const isManager = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'system_admin';
  const isSales = user?.role === 'sales';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [usersData, visitsData, offersData, salesData, targetsData, appointmentsData] = await Promise.all([
        api.users.list(),
        api.visits.list(),
        api.offers.list(),
        api.sales.list(),
        api.targets.list(),
        api.appointments.list()
      ]);
      setUsers(usersData.filter(u => u.role === 'sales'));
      setVisits(visitsData);
      setOffers(offersData);
      setSales(salesData);
      setTargets(targetsData);
      setAppointments(appointmentsData);
      setLoading(false);
    };
    load();
  }, []);

  const getDateRange = (filter: TimeFilter): { start: Date; end: Date } => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (filter) {
      case 'this_month':
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        };
      case 'last_month':
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0, 23, 59, 59)
        };
      case 'this_year':
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31, 23, 59, 59)
        };
      case 'all':
      default:
        return {
          start: new Date(2000, 0, 1),
          end: new Date(2100, 11, 31)
        };
    }
  };

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange(timeFilter);
    
    let filteredVisits = visits.filter(v => {
      const visitDate = new Date(v.visit_date);
      return visitDate >= start && visitDate <= end;
    });
    
    let filteredOffers = offers.filter(o => {
      const createdDate = new Date(); // In real app, use offer created_at
      return true; // For mock, show all
    });
    
    let filteredSales = sales.filter(s => {
      const saleDate = new Date(s.closed_date);
      return saleDate >= start && saleDate <= end;
    });

    // Filter by user if not "all"
    if (selectedUserId !== 'all') {
      const userId = parseInt(selectedUserId);
      filteredVisits = filteredVisits.filter(v => v.user_id === userId);
      filteredOffers = filteredOffers.filter(o => o.user_id === userId);
      filteredSales = filteredSales.filter(s => s.closed_by_user_id === userId);
    } else if (isSales && user) {
      // Sales users only see their own data
      filteredVisits = filteredVisits.filter(v => v.user_id === user.id);
      filteredOffers = filteredOffers.filter(o => o.user_id === user.id);
      filteredSales = filteredSales.filter(s => s.closed_by_user_id === user.id);
    }

    return { filteredVisits, filteredOffers, filteredSales };
  }, [visits, offers, sales, timeFilter, selectedUserId, isSales, user]);

  const metrics = useMemo(() => {
    const { filteredVisits, filteredOffers, filteredSales } = filteredData;
    
    const visitCount = filteredVisits.length;
    const offerCount = filteredOffers.length;
    const saleCount = filteredSales.length;
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.final_revenue_amount, 0);
    
    const acceptedOffers = filteredOffers.filter(o => o.status === 'accepted').length;
    const conversionRate = offerCount > 0 ? Math.round((acceptedOffers / offerCount) * 100) : 0;

    return { visitCount, offerCount, saleCount, totalRevenue, conversionRate, acceptedOffers };
  }, [filteredData]);

  const dailyVisitsData = useMemo(() => {
    const { filteredVisits } = filteredData;
    const { start, end } = getDateRange(timeFilter);
    
    // Group by day
    const dayMap = new Map<string, number>();
    
    // Initialize days for current month
    if (timeFilter === 'this_month' || timeFilter === 'last_month') {
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dayMap.set(i.toString(), 0);
      }
    }
    
    filteredVisits.forEach(v => {
      const day = new Date(v.visit_date).getDate().toString();
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([day, count]) => ({ day: `${day}`, ziyaret: count }))
      .sort((a, b) => parseInt(a.day) - parseInt(b.day));
  }, [filteredData, timeFilter]);

  const offerStatusData = useMemo(() => {
    const { filteredOffers } = filteredData;
    const statusCount = {
      draft: 0, sent: 0, negotiation: 0, accepted: 0, rejected: 0
    };
    
    filteredOffers.forEach(o => {
      if (o.status in statusCount) {
        statusCount[o.status as keyof typeof statusCount]++;
      }
    });

    return [
      { name: t('offers.status_draft'), value: statusCount.draft, color: '#94a3b8' },
      { name: t('offers.status_sent'), value: statusCount.sent, color: '#3b82f6' },
      { name: t('offers.status_negotiation'), value: statusCount.negotiation, color: '#f59e0b' },
      { name: t('offers.status_accepted'), value: statusCount.accepted, color: '#22c55e' },
      { name: t('offers.status_rejected'), value: statusCount.rejected, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [filteredData, t]);

  const monthlyRevenueData = useMemo(() => {
    const months = [
      t('calendar.months_short.jan'), t('calendar.months_short.feb'), t('calendar.months_short.mar'),
      t('calendar.months_short.apr'), t('calendar.months_short.may'), t('calendar.months_short.jun'),
      t('calendar.months_short.jul'), t('calendar.months_short.aug'), t('calendar.months_short.sep'),
      t('calendar.months_short.oct'), t('calendar.months_short.nov'), t('calendar.months_short.dec')
    ];
    const revenueByMonth = new Array(12).fill(0);
    
    sales.forEach(s => {
      const month = new Date(s.closed_date).getMonth();
      revenueByMonth[month] += s.final_revenue_amount;
    });

    return months.map((name, i) => ({ name, ciro: revenueByMonth[i] }));
  }, [sales, t]);

  const salesRankingData = useMemo(() => {
    if (!isManager) return [];
    
    return users.map(u => {
      const userVisits = visits.filter(v => v.user_id === u.id).length;
      const userOffers = offers.filter(o => o.user_id === u.id);
      const userSales = sales.filter(s => s.closed_by_user_id === u.id);
      const userRevenue = userSales.reduce((acc, s) => acc + s.final_revenue_amount, 0);
      const acceptedOffers = userOffers.filter(o => o.status === 'accepted').length;
      
      // Find target for this user
      const userTarget = targets.find(t => t.user_id === u.id);
      const targetRevenue = userTarget?.revenue_target || 0;
      const targetAchievement = targetRevenue > 0 ? Math.round((userRevenue / targetRevenue) * 100) : 0;

      return {
        id: u.id,
        name: u.name,
        visits: userVisits,
        offers: userOffers.length,
        accepted: acceptedOffers,
        revenue: userRevenue,
        targetAchievement
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [users, visits, offers, sales, targets, isManager]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const timeFilterLabels: Record<TimeFilter, string> = {
    this_month: t('common.this_month'),
    last_month: t('common.last_month'),
    this_year: t('common.this_year'),
    all: t('common.all')
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {isManager ? t('dashboard.manager_panel') : t('dashboard.my_performance')}
        </h1>
        
        <div className="flex items-center gap-3">
          {/* User Filter - Only for managers/admins */}
          {isManager && (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[180px]" data-testid="select-user-filter">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('dashboard.select_user')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.all_users')}</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <SelectTrigger className="w-[150px]" data-testid="select-time-filter">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">{t('common.this_month')}</SelectItem>
              <SelectItem value="last_month">{t('common.last_month')}</SelectItem>
              <SelectItem value="this_year">{t('common.this_year')}</SelectItem>
              <SelectItem value="all">{t('common.all')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card data-testid="card-visits">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.visited_schools')}</CardTitle>
            <Briefcase className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-visits">{metrics.visitCount}</div>
            <p className="text-xs text-muted-foreground">{timeFilterLabels[timeFilter]}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-offers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.created_offers')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-offers">{metrics.offerCount}</div>
            <p className="text-xs text-muted-foreground">{timeFilterLabels[timeFilter]}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-sales">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.completed_sales')}</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-sales">{metrics.saleCount}</div>
            <p className="text-xs text-muted-foreground">{timeFilterLabels[timeFilter]}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.total_revenue')}</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-revenue">
              {metrics.totalRevenue.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground">{timeFilterLabels[timeFilter]}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-conversion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.conversion_rate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-conversion">
              %{metrics.conversionRate}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.acceptedOffers} / {metrics.offerCount} {t('dashboard.offer').toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Daily Visits Line Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.daily_visits')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={(value) => `${t('dashboard.day')} ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ziyaret" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name={t('dashboard.visit')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Offer Status Pie Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.offer_status_distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={offerStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {offerStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.monthly_revenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis 
                  fontSize={12} 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [`${value.toLocaleString('tr-TR')} ₺`, t('dashboard.revenue')]}
                />
                <Bar 
                  dataKey="ciro" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard.revenue')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Ranking Table - Only for Managers */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('dashboard.sales_ranking')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.salesperson')}</TableHead>
                  <TableHead className="text-center">{t('dashboard.visit')}</TableHead>
                  <TableHead className="text-center">{t('dashboard.offer')}</TableHead>
                  <TableHead className="text-center">{t('dashboard.accepted')}</TableHead>
                  <TableHead className="text-right">{t('dashboard.revenue')}</TableHead>
                  <TableHead className="w-[180px]">{t('dashboard.target_achievement')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesRankingData.map((row, idx) => (
                  <TableRow key={row.id} data-testid={`row-sales-${row.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Badge className="bg-yellow-500 text-[10px]">1.</Badge>}
                        {idx === 1 && <Badge className="bg-gray-400 text-[10px]">2.</Badge>}
                        {idx === 2 && <Badge className="bg-amber-600 text-[10px]">3.</Badge>}
                        {row.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{row.visits}</TableCell>
                    <TableCell className="text-center">{row.offers}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{row.accepted}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {row.revenue.toLocaleString('tr-TR')} ₺
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(row.targetAchievement, 100)} 
                          className="h-2" 
                        />
                        <span className={`text-xs font-medium w-10 ${
                          row.targetAchievement >= 100 ? 'text-green-600' : 
                          row.targetAchievement >= 70 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          %{row.targetAchievement}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quick Tables: Today's Appointments, Recent Offers, Recent Sales */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Bugünkü Randevularım
                </div>
                <Link to="/appointments" className="text-xs text-muted-foreground hover:text-primary">
                  Tümünü Gör <ArrowRight className="inline h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const todayAppts = appointments.filter(a => {
                  const apptDate = new Date(a.start_datetime);
                  return apptDate >= today && apptDate < tomorrow && 
                         (isSales ? a.user_id === user?.id : true);
                }).slice(0, 5);

                if (todayAppts.length === 0) {
                  return (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Bugün randevunuz yok</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {todayAppts.map(appt => (
                      <div key={appt.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                          {format(new Date(appt.start_datetime), 'HH:mm')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{appt.school_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{appt.type.replace('_', ' ')}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {appt.status === 'planned' ? 'Planlandı' : appt.status === 'done' ? 'Tamamlandı' : 'İptal'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Offers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Son Teklifler
                </div>
                <Link to="/offers" className="text-xs text-muted-foreground hover:text-primary">
                  Tümünü Gör <ArrowRight className="inline h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {offers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz teklif yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.slice(0, 5).map(offer => (
                    <div key={offer.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{offer.school_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{offer.tour_name}</p>
                      </div>
                      <Badge className={`text-[10px] ${
                        offer.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                        offer.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                        offer.status === 'sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {offer.status === 'draft' ? 'Taslak' :
                         offer.status === 'sent' ? 'Gönderildi' :
                         offer.status === 'negotiation' ? 'Görüşme' :
                         offer.status === 'accepted' ? 'Kabul' : 'Red'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Son Satışlar
                </div>
                <Link to="/sales" className="text-xs text-muted-foreground hover:text-primary">
                  Tümünü Gör <ArrowRight className="inline h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {sales.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz satış yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sales.slice(0, 5).map(sale => (
                    <Link key={sale.id} to={`/sales/${sale.id}`} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sale.school_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{sale.offer_tour_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {sale.final_revenue_amount.toLocaleString('tr-TR')} ₺
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {sale.payment_status === 'paid' ? 'Ödendi' :
                           sale.payment_status === 'partial' ? 'Kısmi' : 'Bekliyor'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
