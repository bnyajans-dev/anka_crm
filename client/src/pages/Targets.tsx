import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api, User, SalesTarget, Visit, Offer, Sale } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, Users, Plus, TrendingUp, CheckCircle, Eye, Briefcase, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type PeriodType = 'month' | 'year';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' },
];

const years = [currentYear - 1, currentYear, currentYear + 1];

export default function Targets() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [showNewTargetDialog, setShowNewTargetDialog] = useState(false);
  
  const [newTarget, setNewTarget] = useState({
    user_id: '',
    period_type: 'month' as PeriodType,
    period_year: currentYear,
    period_month: currentMonth,
    visit_target: 0,
    offer_target: 0,
    deal_target: 0,
    revenue_target: 0
  });

  const isManager = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'system_admin';
  const isSales = user?.role === 'sales';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [usersData, targetsData, visitsData, offersData, salesData] = await Promise.all([
        api.users.list(),
        api.targets.list(),
        api.visits.list(),
        api.offers.list(),
        api.sales.list()
      ]);
      setUsers(usersData.filter(u => u.role === 'sales'));
      setTargets(targetsData);
      setVisits(visitsData);
      setOffers(offersData);
      setSales(salesData);
      setLoading(false);
    };
    load();
  }, []);

  const targetStats = useMemo(() => {
    const getActualsForUser = (userId: number) => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
      
      const userVisits = visits.filter(v => {
        const visitDate = new Date(v.visit_date);
        return v.user_id === userId && visitDate >= startDate && visitDate <= endDate;
      });
      
      const userOffers = offers.filter(o => o.user_id === userId);
      const userSales = sales.filter(s => {
        const saleDate = new Date(s.closed_date);
        return s.closed_by_user_id === userId && saleDate >= startDate && saleDate <= endDate;
      });
      
      const userRevenue = userSales.reduce((acc, s) => acc + s.final_revenue_amount, 0);
      
      return {
        visits: userVisits.length,
        offers: userOffers.length,
        deals: userSales.length,
        revenue: userRevenue
      };
    };

    if (isSales && user) {
      const userTargets = targets.filter(t => 
        t.user_id === user.id && 
        t.period_year === selectedYear && 
        (t.period_type === 'year' || t.period_month === selectedMonth)
      );
      const target = userTargets[0];
      const actuals = getActualsForUser(user.id);
      
      return [{
        user: user,
        target,
        actuals,
        visitProgress: target?.visit_target ? Math.round((actuals.visits / target.visit_target) * 100) : 0,
        offerProgress: target?.offer_target ? Math.round((actuals.offers / target.offer_target) * 100) : 0,
        dealProgress: target?.deal_target ? Math.round((actuals.deals / target.deal_target) * 100) : 0,
        revenueProgress: target?.revenue_target ? Math.round((actuals.revenue / target.revenue_target) * 100) : 0
      }];
    }

    return users.map(u => {
      const userTargets = targets.filter(t => 
        t.user_id === u.id && 
        t.period_year === selectedYear && 
        (t.period_type === 'year' || t.period_month === selectedMonth)
      );
      const target = userTargets[0];
      const actuals = getActualsForUser(u.id);
      
      return {
        user: u,
        target,
        actuals,
        visitProgress: target?.visit_target ? Math.round((actuals.visits / target.visit_target) * 100) : 0,
        offerProgress: target?.offer_target ? Math.round((actuals.offers / target.offer_target) * 100) : 0,
        dealProgress: target?.deal_target ? Math.round((actuals.deals / target.deal_target) * 100) : 0,
        revenueProgress: target?.revenue_target ? Math.round((actuals.revenue / target.revenue_target) * 100) : 0
      };
    }).filter(stat => selectedUserId === 'all' || stat.user.id.toString() === selectedUserId);
  }, [users, targets, visits, offers, sales, selectedYear, selectedMonth, selectedUserId, user, isSales]);

  const handleCreateTarget = () => {
    console.log('Creating target:', newTarget);
    setShowNewTargetDialog(false);
    setNewTarget({
      user_id: '',
      period_type: 'month',
      period_year: currentYear,
      period_month: currentMonth,
      visit_target: 0,
      offer_target: 0,
      deal_target: 0,
      revenue_target: 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getProgressColor = (value: number) => {
    if (value >= 100) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Hedefler
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSales ? 'Kişisel hedeflerinizi ve ilerlemenizi takip edin' : 'Ekip hedeflerini yönetin ve performansı izleyin'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filters */}
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]" data-testid="select-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[120px]" data-testid="select-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isManager && (
            <>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-[160px]" data-testid="select-user">
                  <Users className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Satışçı Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Satışçılar</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={showNewTargetDialog} onOpenChange={setShowNewTargetDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-target">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Hedef
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Hedef Oluştur</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Satışçı</Label>
                      <Select value={newTarget.user_id} onValueChange={(v) => setNewTarget({...newTarget, user_id: v})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Satışçı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(u => (
                            <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Dönem</Label>
                      <Select value={newTarget.period_type} onValueChange={(v: PeriodType) => setNewTarget({...newTarget, period_type: v})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Aylık</SelectItem>
                          <SelectItem value="year">Yıllık</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Ziyaret Hedefi</Label>
                      <Input 
                        type="number" 
                        className="col-span-3" 
                        value={newTarget.visit_target}
                        onChange={(e) => setNewTarget({...newTarget, visit_target: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Teklif Hedefi</Label>
                      <Input 
                        type="number" 
                        className="col-span-3" 
                        value={newTarget.offer_target}
                        onChange={(e) => setNewTarget({...newTarget, offer_target: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Satış Hedefi</Label>
                      <Input 
                        type="number" 
                        className="col-span-3" 
                        value={newTarget.deal_target}
                        onChange={(e) => setNewTarget({...newTarget, deal_target: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Ciro Hedefi (₺)</Label>
                      <Input 
                        type="number" 
                        className="col-span-3" 
                        value={newTarget.revenue_target}
                        onChange={(e) => setNewTarget({...newTarget, revenue_target: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">İptal</Button>
                    </DialogClose>
                    <Button onClick={handleCreateTarget}>Oluştur</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Target Cards for Sales User */}
      {isSales && targetStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Ziyaret Hedefi', icon: Eye, actual: targetStats[0].actuals.visits, target: targetStats[0].target?.visit_target || 0, progress: targetStats[0].visitProgress },
            { label: 'Teklif Hedefi', icon: Briefcase, actual: targetStats[0].actuals.offers, target: targetStats[0].target?.offer_target || 0, progress: targetStats[0].offerProgress },
            { label: 'Satış Hedefi', icon: CheckCircle, actual: targetStats[0].actuals.deals, target: targetStats[0].target?.deal_target || 0, progress: targetStats[0].dealProgress },
            { label: 'Ciro Hedefi', icon: TrendingUp, actual: targetStats[0].actuals.revenue, target: targetStats[0].target?.revenue_target || 0, progress: targetStats[0].revenueProgress, isCurrency: true },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  <item.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {item.isCurrency 
                      ? `${item.actual.toLocaleString('tr-TR')} ₺` 
                      : item.actual}
                    <span className="text-sm text-muted-foreground font-normal ml-1">
                      / {item.isCurrency 
                          ? `${item.target.toLocaleString('tr-TR')} ₺` 
                          : item.target}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Progress value={Math.min(item.progress, 100)} className="h-2 flex-1" />
                    <span className={`text-sm font-medium ${getProgressColor(item.progress)}`}>
                      %{item.progress}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Manager View - Table */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Satışçı Hedefleri - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardTitle>
            <CardDescription>
              Ekibinizin hedef performansını görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Satışçı</TableHead>
                    <TableHead className="text-center">
                      <div className="flex flex-col items-center">
                        <span>Ziyaret</span>
                        <span className="text-[10px] text-muted-foreground">Gerçekleşen / Hedef</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex flex-col items-center">
                        <span>Teklif</span>
                        <span className="text-[10px] text-muted-foreground">Gerçekleşen / Hedef</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex flex-col items-center">
                        <span>Satış</span>
                        <span className="text-[10px] text-muted-foreground">Gerçekleşen / Hedef</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex flex-col items-end">
                        <span>Ciro</span>
                        <span className="text-[10px] text-muted-foreground">Gerçekleşen / Hedef</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-32">Genel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetStats.map((stat) => {
                    const overallProgress = Math.round(
                      (stat.visitProgress + stat.offerProgress + stat.dealProgress + stat.revenueProgress) / 4
                    );
                    
                    return (
                      <TableRow key={stat.user.id} data-testid={`row-target-${stat.user.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                              {stat.user.name.charAt(0)}
                            </div>
                            {stat.user.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{stat.actuals.visits} / {stat.target?.visit_target || '-'}</span>
                            {stat.target?.visit_target && (
                              <div className="flex items-center gap-1 w-20">
                                <Progress value={Math.min(stat.visitProgress, 100)} className="h-1.5" />
                                <span className={`text-[10px] ${getProgressColor(stat.visitProgress)}`}>%{stat.visitProgress}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{stat.actuals.offers} / {stat.target?.offer_target || '-'}</span>
                            {stat.target?.offer_target && (
                              <div className="flex items-center gap-1 w-20">
                                <Progress value={Math.min(stat.offerProgress, 100)} className="h-1.5" />
                                <span className={`text-[10px] ${getProgressColor(stat.offerProgress)}`}>%{stat.offerProgress}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{stat.actuals.deals} / {stat.target?.deal_target || '-'}</span>
                            {stat.target?.deal_target && (
                              <div className="flex items-center gap-1 w-20">
                                <Progress value={Math.min(stat.dealProgress, 100)} className="h-1.5" />
                                <span className={`text-[10px] ${getProgressColor(stat.dealProgress)}`}>%{stat.dealProgress}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-medium">
                              {stat.actuals.revenue.toLocaleString('tr-TR')} / {stat.target?.revenue_target?.toLocaleString('tr-TR') || '-'} ₺
                            </span>
                            {stat.target?.revenue_target && (
                              <div className="flex items-center gap-1 w-24">
                                <Progress value={Math.min(stat.revenueProgress, 100)} className="h-1.5" />
                                <span className={`text-[10px] ${getProgressColor(stat.revenueProgress)}`}>%{stat.revenueProgress}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.target ? (
                            <Badge className={`${
                              overallProgress >= 100 ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              overallProgress >= 70 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                              'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}>
                              %{overallProgress}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Hedef Yok
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
