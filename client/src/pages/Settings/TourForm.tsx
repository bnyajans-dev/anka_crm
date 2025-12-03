import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const tourSchema = z.object({
  name: z.string().min(2, "Tur adı gereklidir"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  default_price_per_student: z.coerce.number().min(0),
  default_currency: z.string().min(2),
  default_duration_days: z.coerce.number().min(1),
  region: z.string().min(2, "Bölge seçiniz"),
});

export default function TourForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof tourSchema>>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: '',
      description: '',
      default_price_per_student: 0,
      default_currency: 'TRY',
      default_duration_days: 1,
      region: '',
    },
  });

  useEffect(() => {
    const load = async () => {
      if (id) {
        const tour = await api.tours.getById(parseInt(id));
        if (tour) {
          form.reset({
            name: tour.name,
            description: tour.description,
            default_price_per_student: tour.default_price_per_student,
            default_currency: tour.default_currency,
            default_duration_days: tour.default_duration_days,
            region: tour.region,
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const onSubmit = async (values: z.infer<typeof tourSchema>) => {
    try {
      if (id) {
        await api.tours.update(parseInt(id), values);
        toast({ title: "Tur güncellendi" });
      } else {
        await api.tours.create(values);
        toast({ title: "Tur oluşturuldu" });
      }
      navigate('/settings/tours');
    } catch (error) {
      toast({ title: "Hata oluştu", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/settings/tours"><ChevronLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-3xl font-bold tracking-tight">{id ? 'Tur Düzenle' : 'Yeni Tur Tanımı'}</h1>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Tur Detayları</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Tur Adı</FormLabel><FormControl><Input {...field} placeholder="Örn: Ankara-Çanakkale Turu" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Açıklama</FormLabel><FormControl><Textarea {...field} placeholder="Tur içeriği hakkında kısa bilgi..." /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="default_price_per_student" render={({ field }) => (
                  <FormItem><FormLabel>Varsayılan Fiyat (Kişi Başı)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="default_currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="TRY">TRY</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="default_duration_days" render={({ field }) => (
                  <FormItem><FormLabel>Süre (Gün)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="region" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bölge</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Bölge Seçiniz" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Marmara">Marmara</SelectItem>
                        <SelectItem value="Ege">Ege</SelectItem>
                        <SelectItem value="İç Anadolu">İç Anadolu</SelectItem>
                        <SelectItem value="Akdeniz">Akdeniz</SelectItem>
                        <SelectItem value="Karadeniz">Karadeniz</SelectItem>
                        <SelectItem value="Doğu Anadolu">Doğu Anadolu</SelectItem>
                        <SelectItem value="Güneydoğu Anadolu">Güneydoğu Anadolu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
