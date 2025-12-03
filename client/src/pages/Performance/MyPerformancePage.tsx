import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, SalesTarget } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MyPerformancePage() {
  const { user } = useAuth();
  const [target, setTarget] = useState<SalesTarget | null>(null);
  const [actuals, setActuals] = useState({ visits: 0, offers: 0, deals: 0, revenue: 0 });

  useEffect(() => {
    const load = async () => {
      if (user) {
          // Mock: Load current month target
          const targets = await api.targets.list(user.id, 2023, 10);
          if (targets.length > 0) {
              setTarget(targets[0]);
              
              // Mock actuals
              setActuals({
                  visits: 15, // Mock
                  offers: 8, // Mock
                  deals: 3, // Mock
                  revenue: 75000 // Mock
              });
          }
      }
    };
    load();
  }, [user]);

  if (!target) return <div className="p-8 text-center text-muted-foreground">Henüz bu ay için hedef atanmamış.</div>;

  const data = [
    { name: 'Ziyaret', value: actuals.visits, target: target.visit_target },
    { name: 'Teklif', value: actuals.offers, target: target.offer_target },
    { name: 'Satış', value: actuals.deals, target: target.deal_target },
  ];

  const revenuePercent = Math.min(100, Math.floor((actuals.revenue / target.revenue_target) * 100));

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Performansım</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ciro Hedefi</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actuals.revenue.toLocaleString()} ₺</div>
            <p className="text-xs text-muted-foreground mb-2">Hedef: {target.revenue_target.toLocaleString()} ₺</p>
            <Progress value={revenuePercent} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ziyaret Gerçekleşme</CardTitle></CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{actuals.visits} / {target.visit_target}</div>
             <Progress value={(actuals.visits / target.visit_target) * 100} className="h-2 mt-2" />
           </CardContent>
        </Card>

        <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Teklif Gerçekleşme</CardTitle></CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{actuals.offers} / {target.offer_target}</div>
             <Progress value={(actuals.offers / target.offer_target) * 100} className="h-2 mt-2" />
           </CardContent>
        </Card>

        <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Satış Gerçekleşme</CardTitle></CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{actuals.deals} / {target.deal_target}</div>
             <Progress value={(actuals.deals / target.deal_target) * 100} className="h-2 mt-2" />
           </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader><CardTitle>Aylık Aktivite</CardTitle></CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" name="Gerçekleşen" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="hsl(var(--muted))" name="Hedef" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
