import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, TrendingUp } from 'lucide-react';
import { api, User, SalesTarget } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function PerformanceUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [uData, tData] = await Promise.all([
        api.users.list(),
        api.targets.list(undefined, 2023, 10) // Mock: showing for Oct 2023
      ]);
      setUsers(uData.filter(u => u.role === 'sales'));
      setTargets(tData);
      setLoading(false);
    };
    load();
  }, []);

  const getTarget = (userId: number) => targets.find(t => t.user_id === userId);

  // Calculate Team Summary
  const teamSummary = users.reduce((acc, user) => {
    const target = getTarget(user.id);
    const revenueTarget = target?.revenue_target || 0;
    const actualRevenue = Math.floor(Math.random() * 120000); // Mock actual logic would be better with real API aggregation
    
    return {
        totalTarget: acc.totalTarget + revenueTarget,
        totalActual: acc.totalActual + actualRevenue
    };
  }, { totalTarget: 0, totalActual: 0 });

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Performans Özeti</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Ciro Hedefi</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{teamSummary.totalTarget.toLocaleString()} ₺</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Gerçekleşen Ciro</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-green-600">{teamSummary.totalActual.toLocaleString()} ₺</div>
                  <Progress value={(teamSummary.totalActual / (teamSummary.totalTarget || 1)) * 100} className="h-2 mt-2" />
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ekip Başarısı</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    %{Math.floor((teamSummary.totalActual / (teamSummary.totalTarget || 1)) * 100)}
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Satış Ekibi Performansı (Ekim 2023)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personel</TableHead>
                <TableHead>Ekip</TableHead>
                <TableHead>Ziyaret %</TableHead>
                <TableHead>Teklif %</TableHead>
                <TableHead>Satış %</TableHead>
                <TableHead>Ciro Hedefi</TableHead>
                <TableHead>Gerçekleşen</TableHead>
                <TableHead className="w-[150px]">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const target = getTarget(user.id);
                const revenueTarget = target?.revenue_target || 100000; // Default mock
                const actualRevenue = Math.floor(Math.random() * 120000); // Mock random data
                const percentage = Math.min(100, Math.floor((actualRevenue / revenueTarget) * 100));
                
                // Mock percentages for other metrics
                const visitPct = Math.floor(Math.random() * 100);
                const offerPct = Math.floor(Math.random() * 100);
                const dealPct = Math.floor(Math.random() * 100);

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell><Badge variant="outline">{user.team_name}</Badge></TableCell>
                    <TableCell><span className={visitPct < 50 ? 'text-red-500' : 'text-green-600'}>%{visitPct}</span></TableCell>
                    <TableCell><span className={offerPct < 50 ? 'text-red-500' : 'text-green-600'}>%{offerPct}</span></TableCell>
                    <TableCell><span className={dealPct < 50 ? 'text-red-500' : 'text-green-600'}>%{dealPct}</span></TableCell>
                    <TableCell>{revenueTarget.toLocaleString()} ₺</TableCell>
                    <TableCell>{actualRevenue.toLocaleString()} ₺</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="h-2" />
                        <span className="text-xs font-medium w-8">{percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
