import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { api, School } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const visitSchema = z.object({
  school_id: z.string().min(1, "School is required"),
  visit_date: z.string().min(1, "Date is required"),
  status: z.enum(['planned', 'done', 'cancelled']),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
  next_step: z.string().optional(),
});

export default function VisitCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  
  const form = useForm<z.infer<typeof visitSchema>>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      school_id: '',
      visit_date: '',
      status: 'planned',
      contact_person: '',
      notes: '',
      next_step: '',
    },
  });

  useEffect(() => {
    api.schools.list().then(setSchools);
  }, []);

  const onSubmit = async (values: z.infer<typeof visitSchema>) => {
    try {
      await api.visits.create({ ...values, school_id: parseInt(values.school_id), user_id: 1 });
      toast({ title: t('common.success'), description: "Visit created" });
      navigate('/visits');
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/visits"><ChevronLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold tracking-tight">{t('visits.new_visit')}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('visits.new_visit')}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="school_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('visits.school')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select School" /></SelectTrigger></FormControl>
                    <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="visit_date" render={({ field }) => (
                <FormItem><FormLabel>{t('visits.visit_date')}</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="planned">{t('visits.status_planned')}</SelectItem>
                      <SelectItem value="done">{t('visits.status_done')}</SelectItem>
                      <SelectItem value="cancelled">{t('visits.status_cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contact_person" render={({ field }) => (
                <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>{t('visits.notes')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {t('common.save')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
