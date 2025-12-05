import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schoolSchema = z.object({
  name: z.string().min(3, "Okul adı zorunludur"),
  city: z.string().min(2, "Şehir zorunludur"),
  district: z.string().min(2, "İlçe zorunludur"),
  contact_person: z.string().min(3, "İletişim kişisi zorunludur"),
  contact_phone: z.string().min(10, "Geçerli telefon numarası giriniz"),
  region: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana'];

const DISTRICTS: Record<string, string[]> = {
  'İstanbul': ['Fatih', 'Kadıköy', 'Üsküdar', 'Kartal', 'Pendik', 'Beşiktaş', 'Bakırköy', 'Zeytinburnu'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle'],
  'İzmir': ['Konak', 'Bornova', 'Karşıyaka'],
  'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı'],
  'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım'],
  'Adana': ['Seyhan', 'Çukurova', 'Yüreğir']
};

const REGIONS = ['Marmara', 'Ege', 'Akdeniz', 'İç Anadolu', 'Karadeniz', 'Doğu Anadolu', 'Güneydoğu Anadolu'];

export default function SchoolForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      city: '',
      district: '',
      contact_person: '',
      contact_phone: '',
      region: '',
      latitude: 0,
      longitude: 0,
    },
  });

  const selectedCity = form.watch('city');

  // Reset district when city changes
  useEffect(() => {
    if (selectedCity) {
       // Only reset if current district isn't in the new city's list
       const currentDistrict = form.getValues('district');
       const districts = DISTRICTS[selectedCity] || [];
       if (!districts.includes(currentDistrict)) {
           form.setValue('district', '');
       }
    }
  }, [selectedCity, form]);

  const onSubmit = async (values: z.infer<typeof schoolSchema>) => {
    try {
      await api.schools.create(values);
      toast({
        title: t('schools.success_add'),
        description: t('schools.success_add'),
      });
      navigate('/schools');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.generic'),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/schools">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('schools.new_school')}</h1>
          <p className="text-muted-foreground">{t('schools.form_subtitle')}</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>{t('schools.form_title')}</CardTitle>
          <CardDescription>{t('schools.form_subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schools.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Atatürk Anadolu Lisesi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('schools.city')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('schools.select_city')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CITIES.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('schools.district')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCity}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('schools.select_district')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(DISTRICTS[selectedCity] || []).map(dist => (
                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('common.region')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t('schools.select_region')} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="latitude" render={({ field }) => (
                    <FormItem><FormLabel>{t('schools.latitude')}</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
                 <FormField control={form.control} name="longitude" render={({ field }) => (
                    <FormItem><FormLabel>{t('schools.longitude')}</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
                 )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('schools.contact_person')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Ahmet Yılmaz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('schools.contact_phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder="0555 123 45 67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" asChild>
                  <Link to="/schools">{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.save')}...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('common.save')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
