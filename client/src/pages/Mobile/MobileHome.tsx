import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, DashboardSummary, Sale } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileText, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MobileHome() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [newSalesCount, setNewSalesCount] = useState(0);

  useEffect(() => {
    const load = async () => {
        const summaryData = await api.dashboard.getSummary();
        setSummary(summaryData);

        // Check for new sales today
        const sales = await api.sales.list();
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(s => s.closed_date === today).length;
        setNewSalesCount(todaySales);
    };
    load();
  }, []);

  if (!summary) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hello!</h1>
          <p className="text-muted-foreground text-sm">Ready for today?</p>
        </div>
        <div className="flex flex-col items-end">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            ME
            </div>
            {newSalesCount > 0 && (
                <Badge className="mt-1 bg-green-500 hover:bg-green-600 text-[10px]">
                    {newSalesCount} New Sale{newSalesCount > 1 ? 's' : ''}
                </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold">{summary.total_visits}</span>
            <span className="text-xs text-muted-foreground">Visits Today</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center mb-2">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold">{summary.total_offers}</span>
            <span className="text-xs text-muted-foreground">Active Offers</span>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Upcoming
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center bg-muted rounded p-1 min-w-[40px]">
                <span className="text-xs font-bold">10:00</span>
                <span className="text-[10px] text-muted-foreground">AM</span>
              </div>
              <div>
                <p className="font-medium text-sm">Atatürk Anadolu Lisesi</p>
                <p className="text-xs text-muted-foreground">Visit • Planned</p>
              </div>
            </div>
            <div className="w-full h-px bg-border/50" />
            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center bg-muted rounded p-1 min-w-[40px]">
                <span className="text-xs font-bold">02:30</span>
                <span className="text-[10px] text-muted-foreground">PM</span>
              </div>
              <div>
                <p className="font-medium text-sm">Fen Lisesi</p>
                <p className="text-xs text-muted-foreground">Offer Meeting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
