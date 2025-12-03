import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, MapPin } from 'lucide-react';
import { api, School } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const visitSchema = z.object({
  school_id: z.string().min(1),
  visit_date: z.string().min(1),
  notes: z.string().optional(),
});

export default function MobileNewVisit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  
  const form = useForm<z.infer<typeof visitSchema>>({
    resolver: zodResolver(visitSchema),
    defaultValues: { school_id: '', visit_date: '', notes: '' },
  });

  useEffect(() => {
    api.schools.list().then(setSchools);
  }, []);

  const onSubmit = async (values: z.infer<typeof visitSchema>) => {
    try {
      await api.visits.create({ ...values, school_id: parseInt(values.school_id), status: 'planned' });
      toast({ title: "Visit created" });
      navigate('/m/visits');
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleQuickCheckIn = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    form.setValue('visit_date', now.toISOString().slice(0,16));
    toast({ title: "Location & Time captured" });
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-6 w-6" /></Button>
        <h1 className="text-xl font-bold">New Visit</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="school_id" render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select School" /></SelectTrigger></FormControl>
                <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormItem>
          )} />
          
          <div className="flex gap-2 items-end">
            <FormField control={form.control} name="visit_date" render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Time</FormLabel>
                <FormControl><Input type="datetime-local" {...field} /></FormControl>
              </FormItem>
            )} />
            <Button type="button" size="icon" variant="outline" className="mb-2" onClick={handleQuickCheckIn}>
              <MapPin className="h-4 w-4 text-primary" />
            </Button>
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl><Textarea {...field} placeholder="Meeting notes..." /></FormControl>
            </FormItem>
          )} />

          <Button type="submit" className="w-full h-12 text-lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Visit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
