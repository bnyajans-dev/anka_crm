import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Users } from 'lucide-react';
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

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Performans Özeti</h1>
      
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
                <TableHead>Ciro Hedefi</TableHead>
                <TableHead>Gerçekleşen</TableHead>
                <TableHead className="w-[200px]">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const target = getTarget(user.id);
                const revenueTarget = target?.revenue_target || 100000; // Default mock
                const actualRevenue = Math.floor(Math.random() * 120000); // Mock random data
                const percentage = Math.min(100, Math.floor((actualRevenue / revenueTarget) * 100));

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell><Badge variant="outline">{user.team_name}</Badge></TableCell>
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
