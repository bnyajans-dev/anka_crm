import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, PerformanceSummary } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MyPerformancePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PerformanceSummary | null>(null);

  useEffect(() => {
    api.performance.getSummary().then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  const data = [
    { name: 'Visits', value: stats.visits_count, target: stats.visits_target },
    { name: 'Offers', value: stats.offers_count, target: stats.offers_target },
    { name: 'Deals', value: stats.deals_count, target: stats.deals_target },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">My Performance</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Revenue Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue_sum.toLocaleString()} ₺</div>
            <p className="text-xs text-muted-foreground mb-2">Target: {stats.revenue_target.toLocaleString()} ₺</p>
            <Progress value={(stats.revenue_sum / stats.revenue_target) * 100} className="h-2" />
          </CardContent>
        </Card>
        {/* Add more cards if needed */}
      </div>

      <Card className="col-span-4">
        <CardHeader><CardTitle>Monthly Activity</CardTitle></CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
