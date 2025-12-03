import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { api, OfferTemplate } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const templateSchema = z.object({
  email_subject_template: z.string().min(1),
  email_body_template: z.string().min(1),
  pdf_header_template: z.string().min(1),
  pdf_footer_template: z.string().min(1),
});

export default function OfferTemplateSettings() {
  const { toast } = useToast();
  const [template, setTemplate] = useState<OfferTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      email_subject_template: '',
      email_body_template: '',
      pdf_header_template: '',
      pdf_footer_template: '',
    },
  });

  useEffect(() => {
    const load = async () => {
      const templates = await api.offerTemplates.list();
      if (templates.length > 0) {
        setTemplate(templates[0]);
        form.reset(templates[0]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const onSubmit = async (values: z.infer<typeof templateSchema>) => {
    if (!template) return;
    try {
      await api.offerTemplates.update(template.id, values);
      toast({ title: "Şablon güncellendi" });
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Teklif Şablonu</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>E-posta ve PDF Ayarları</CardTitle>
              <CardDescription>Otomatik gönderilen e-posta ve PDF içeriklerini düzenleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="email_subject_template" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta Konu Başlığı</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="email_body_template" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta İçeriği</FormLabel>
                      <FormControl><Textarea className="h-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={form.control} name="pdf_header_template" render={({ field }) => (
                        <FormItem>
                        <FormLabel>PDF Üst Metni (Header)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="pdf_footer_template" render={({ field }) => (
                        <FormItem>
                        <FormLabel>PDF Alt Metni (Footer)</FormLabel>
                        <FormControl><Textarea className="h-20" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                  </div>

                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                    Kaydet
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Kullanılabilir Değişkenler</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 font-mono">
              <p>{`{{school_name}}`}</p>
              <p>{`{{contact_name}}`}</p>
              <p>{`{{tour_name}}`}</p>
              <p>{`{{student_count}}`}</p>
              <p>{`{{teacher_count}}`}</p>
              <p>{`{{total_price}}`}</p>
              <p>{`{{currency}}`}</p>
              <p>{`{{valid_until}}`}</p>
              <p>{`{{salesperson_name}}`}</p>
              <p>{`{{today}}`}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
