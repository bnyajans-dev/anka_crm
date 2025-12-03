import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { api, Appointment } from '@/lib/mockApi';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

export default function AppointmentsList() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await api.appointments.list();
      setAppointments(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">{t('common.appointments')}</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>{t('visits.school')}</TableHead>
                <TableHead>{t('common.user')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : (
                appointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{new Date(app.start_datetime).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{app.type}</TableCell>
                    <TableCell>{app.school_name}</TableCell>
                    <TableCell>{app.user_name}</TableCell>
                    <TableCell>{app.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
