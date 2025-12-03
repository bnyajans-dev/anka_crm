import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schoolSchema = z.object({
  name: z.string().min(3, "Name is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  contact_person: z.string().min(3, "Contact person is required"),
  contact_phone: z.string().min(10, "Valid phone number is required"),
});

export default function SchoolEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      city: '',
      district: '',
      contact_person: '',
      contact_phone: '',
    },
  });

  useEffect(() => {
    const fetchSchool = async () => {
      if (!id) return;
      try {
        const school = await api.schools.getById(parseInt(id));
        form.reset({
          name: school.name,
          city: school.city,
          district: school.district,
          contact_person: school.contact_person,
          contact_phone: school.contact_phone,
        });
      } catch (error) {
        toast({
          title: t('common.error'),
          description: "Failed to load school details",
          variant: "destructive"
        });
        navigate('/schools');
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [id, form, navigate, t, toast]);

  const onSubmit = async (values: z.infer<typeof schoolSchema>) => {
    if (!id) return;
    try {
      await api.schools.update(parseInt(id), values);
      toast({
        title: t('schools.success_update'),
        description: `${values.name} has been updated successfully.`,
      });
      navigate('/schools');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "Failed to update school. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/schools">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('schools.edit_school')}</h1>
          <p className="text-muted-foreground">{t('schools.form_subtitle')}</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>{t('schools.form_title')}</CardTitle>
          <CardDescription>Update the details of the school below.</CardDescription>
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
                      <FormControl>
                        <Input placeholder="Ankara" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="Çankaya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
