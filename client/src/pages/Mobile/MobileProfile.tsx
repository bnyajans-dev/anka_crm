import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, PerformanceSummary } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LogOut } from 'lucide-react';

export default function MobileProfile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<PerformanceSummary | null>(null);

  useEffect(() => {
    api.performance.getSummary().then(setStats);
  }, []);

  if (!user) return null;

  return (
    <div className="p-4 space-y-6 animate-in fade-in">
      <div className="flex flex-col items-center pt-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-3">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <span className="text-sm text-muted-foreground uppercase tracking-wider">{user.role}</span>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Performance (This Month)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {stats ? (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Visits</span>
                  <span>{stats.visits_count} / {stats.visits_target}</span>
                </div>
                <Progress value={(stats.visits_count / stats.visits_target) * 100} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Revenue</span>
                  <span>{stats.revenue_sum} / {stats.revenue_target} ₺</span>
                </div>
                <Progress value={(stats.revenue_sum / stats.revenue_target) * 100} className="h-2" />
              </div>
            </>
          ) : 'Loading...'}
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
}
