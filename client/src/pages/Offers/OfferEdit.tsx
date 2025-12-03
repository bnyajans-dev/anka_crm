import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Save, FileText } from 'lucide-react';
import { api, School } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AttachmentsPanel from '@/components/AttachmentsPanel';

const offerSchema = z.object({
  school_id: z.string().min(1, "School is required"),
  tour_name: z.string().min(1, "Tour name is required"),
  student_count: z.coerce.number().min(1),
  teacher_count: z.coerce.number().min(0),
  price_per_student: z.coerce.number().min(0),
  status: z.enum(['draft', 'sent', 'negotiation', 'accepted', 'rejected']),
});

export default function OfferEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      school_id: '',
      tour_name: '',
      student_count: 0,
      teacher_count: 0,
      price_per_student: 0,
      status: 'draft',
    },
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const schoolsData = await api.schools.list();
        const offerData = await api.offers.list().then(offers => offers.find(o => o.id === parseInt(id)));
        
        setSchools(schoolsData);
        if (offerData) {
            form.reset({
                school_id: offerData.school_id.toString(),
                tour_name: offerData.tour_name,
                student_count: offerData.student_count,
                teacher_count: offerData.teacher_count,
                price_per_student: offerData.price_per_student,
                status: offerData.status,
            });
        }
        setLoading(false);
      } catch (error) {
        navigate('/offers');
      }
    };
    load();
  }, [id, navigate]);

  const onSubmit = async (values: z.infer<typeof offerSchema>) => {
    if (!id) return;
    try {
      await api.offers.update(parseInt(id), { ...values, school_id: parseInt(values.school_id) });
      toast({ title: t('common.success'), description: "Offer updated" });
      navigate('/offers');
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    }
  };

  const handleGeneratePdf = async () => {
    if (!id) return;
    setGeneratingPdf(true);
    try {
      const pdfUrl = await api.pdf.generate(parseInt(id));
      toast({
        title: "PDF Generated",
        description: "Offer PDF has been created successfully.",
        action: <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold underline">Open PDF</a>
      });
    } catch (error) {
      toast({ title: "PDF Generation Failed", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild><Link to="/offers"><ChevronLeft className="h-4 w-4" /></Link></Button>
            <h1 className="text-2xl font-bold tracking-tight">Edit Offer</h1>
        </div>
        {id && (
            <Button variant="outline" onClick={handleGeneratePdf} disabled={generatingPdf}>
                {generatingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Generate PDF
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Edit Offer Details</CardTitle></CardHeader>
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
                    
                    <FormField control={form.control} name="tour_name" render={({ field }) => (
                        <FormItem><FormLabel>{t('offers.tour_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="student_count" render={({ field }) => (
                        <FormItem><FormLabel>{t('offers.student_count')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="price_per_student" render={({ field }) => (
                        <FormItem><FormLabel>Price per Student</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
        
        <div className="space-y-6">
            {id && <AttachmentsPanel relatedType="offer" relatedId={parseInt(id)} />}
        </div>
      </div>
    </div>
  );
}
