import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { api, School, TourDefinition } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const offerSchema = z.object({
  school_id: z.string().min(1, "School is required"),
  tour_name: z.string().min(1, "Tour name is required"),
  student_count: z.coerce.number().min(1),
  teacher_count: z.coerce.number().min(0),
  price_per_student: z.coerce.number().min(0),
  currency: z.string().min(1),
  status: z.enum(['draft', 'sent', 'negotiation', 'accepted', 'rejected']),
});

export default function OfferCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [tours, setTours] = useState<TourDefinition[]>([]);
  
  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      school_id: '',
      tour_name: '',
      student_count: 0,
      teacher_count: 0,
      price_per_student: 0,
      currency: 'TRY',
      status: 'draft',
    },
  });

  useEffect(() => {
    Promise.all([
        api.schools.list(),
        api.tours.list()
    ]).then(([s, t]) => {
        setSchools(s);
        setTours(t);
    });
  }, []);

  const handleTourChange = (tourIdStr: string) => {
      const tour = tours.find(t => t.id === parseInt(tourIdStr));
      if (tour) {
          form.setValue('tour_name', tour.name);
          form.setValue('price_per_student', tour.default_price_per_student);
          form.setValue('currency', tour.default_currency);
      }
  };

  const onSubmit = async (values: z.infer<typeof offerSchema>) => {
    try {
      const total_price = values.student_count * values.price_per_student;
      await api.offers.create({ 
        ...values, 
        school_id: parseInt(values.school_id), 
        user_id: 1, // In real app, this is from auth context
        total_price, 
      });
      toast({ title: t('common.success'), description: "Offer created" });
      navigate('/offers');
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/offers"><ChevronLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold tracking-tight">{t('offers.new_offer')}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('offers.new_offer')}</CardTitle></CardHeader>
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
              
              <FormItem>
                  <FormLabel>{t('offers.tour_name')}</FormLabel>
                  <Select onValueChange={handleTourChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Tour" /></SelectTrigger></FormControl>
                    <SelectContent>{tours.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
              </FormItem>

              {/* Hidden or Read-only Tour Name if needed, but we used it to populate form state. 
                  We can also keep it as a hidden field but let user edit if needed? 
                  Requirement: "selecting a tour should automatically fill... but allow manual editing"
              */}
              <FormField control={form.control} name="tour_name" render={({ field }) => (
                <FormItem><FormLabel>Tour Name (Editable)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="student_count" render={({ field }) => (
                  <FormItem><FormLabel>{t('offers.student_count')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="teacher_count" render={({ field }) => (
                  <FormItem><FormLabel>Teachers</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price_per_student" render={({ field }) => (
                  <FormItem><FormLabel>Price per Student</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
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
