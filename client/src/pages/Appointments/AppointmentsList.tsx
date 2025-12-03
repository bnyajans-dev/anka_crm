import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Calendar as CalendarIcon, List } from 'lucide-react';
import { api, Appointment } from '@/lib/mockApi';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('common.appointments')}</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex justify-end mb-4">
            <TabsList>
                <TabsTrigger value="list"><List className="h-4 w-4 mr-2"/>List</TabsTrigger>
                <TabsTrigger value="calendar"><CalendarIcon className="h-4 w-4 mr-2"/>Calendar</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="list">
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
                            <TableCell className="capitalize">
                                {app.type}
                                {app.is_auto_created && <Badge variant="secondary" className="ml-2 text-[10px]">Auto</Badge>}
                            </TableCell>
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
        </TabsContent>
        
        <TabsContent value="calendar">
            <Card>
                <CardHeader><CardTitle>Calendar View</CardTitle></CardHeader>
                <CardContent className="h-[600px] flex items-center justify-center border-2 border-dashed rounded-md bg-muted/10">
                    <div className="text-center">
                        <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground">Calendar view implementation requires a heavy calendar library.</p>
                        <p className="text-sm text-muted-foreground mt-2">For this prototype, please use the List view.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
