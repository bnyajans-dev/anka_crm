import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, DashboardSummary } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Briefcase, CheckCircle, CreditCard, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const [data, chartData] = await Promise.all([
        api.dashboard.getSummary(),
        api.dashboard.getCharts()
      ]);
      setSummary(data);
      setCharts(chartData);
    };
    load();
  }, []);

  if (!summary || !charts) return <div className="p-6">Loading...</div>;

  const stats = [
    { title: t('dashboard_metrics.total_schools'), value: summary.total_schools, icon: School, color: 'text-blue-500' },
    { title: t('dashboard_metrics.total_visits'), value: summary.total_visits, icon: Briefcase, color: 'text-orange-500' },
    { title: t('dashboard_metrics.total_offers'), value: summary.total_offers, icon: CheckCircle, color: 'text-purple-500' },
    { title: t('dashboard_metrics.total_sales'), value: summary.total_sales, icon: CreditCard, color: 'text-green-500' },
    { title: t('dashboard_metrics.total_revenue'), value: `${summary.total_revenue.toLocaleString()} ₺`, icon: CreditCard, color: 'text-green-600' },
    { title: t('dashboard_metrics.upcoming_appointments'), value: summary.upcoming_appointments_count, icon: Calendar, color: 'text-red-500' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenue_per_month}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader><CardTitle>Offer Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.offers_by_status}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.offers_by_status.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
    </div>
  );
}
