import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, DashboardSummary } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Briefcase, CheckCircle, CreditCard, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await api.dashboard.getSummary();
      setSummary(data);
    };
    load();
  }, []);

  if (!summary) return <div className="p-6">Loading...</div>;

  const stats = [
    { title: t('dashboard_metrics.total_schools'), value: summary.total_schools, icon: School, color: 'text-blue-500' },
    { title: t('dashboard_metrics.total_visits'), value: summary.total_visits, icon: Briefcase, color: 'text-orange-500' },
    { title: t('dashboard_metrics.total_offers'), value: summary.total_offers, icon: CheckCircle, color: 'text-purple-500' },
    { title: t('dashboard_metrics.total_sales'), value: summary.total_sales, icon: CreditCard, color: 'text-green-500' },
    { title: t('dashboard_metrics.total_revenue'), value: `${summary.total_revenue} ₺`, icon: CreditCard, color: 'text-green-600' },
    { title: t('dashboard_metrics.upcoming_appointments'), value: summary.upcoming_appointments_count, icon: Calendar, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">{t('common.dashboard')}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
