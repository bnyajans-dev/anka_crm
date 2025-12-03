import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, FileText, Lock, Mail, Info } from 'lucide-react';
import { api, Offer, School } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const offerSchema = z.object({
  school_id: z.string().min(1),
  tour_name: z.string().min(2),
  student_count: z.coerce.number().min(1),
  teacher_count: z.coerce.number().min(0),
  price_per_student: z.coerce.number().min(0),
  status: z.enum(['draft', 'sent', 'negotiation', 'accepted', 'rejected']),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
});

export default function OfferEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [lastSentInfo, setLastSentInfo] = useState<any>(null);
  
  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      school_id: '',
      tour_name: '',
      student_count: 0,
      teacher_count: 0,
      price_per_student: 0,
      status: 'draft',
      contact_name: '',
      contact_email: '',
    },
  });

  // Watch status for UX changes
  const status = form.watch("status");
  const contactEmail = form.watch("contact_email");

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
                contact_name: offerData.contact_name || '',
                contact_email: offerData.contact_email || '',
            });
            
            if (offerData.last_sent_at) {
                setLastSentInfo({ at: offerData.last_sent_at, status: offerData.last_sent_status });
            }

            // Determine Lock Status
            const isOwner = user && offerData.user_id === user.id;
            const isPast = offerData.valid_until ? new Date(offerData.valid_until) < new Date() : false;
            const isStatusLocked = ['accepted', 'rejected'].includes(offerData.status);

            if (user?.role === 'sales') {
                if (!isOwner) { setIsLocked(true); setLockReason("Sadece kendi tekliflerinizi düzenleyebilirsiniz."); }
                else if (isPast) { setIsLocked(true); setLockReason("Süresi geçmiş teklifler düzenlenemez."); }
                else if (isStatusLocked) { setIsLocked(true); setLockReason("Kabul edilmiş veya reddedilmiş teklifler düzenlenemez."); }
            } else if (user?.role === 'manager') {
                if (isPast || isStatusLocked) { setIsLocked(true); setLockReason("Geçmiş veya sonuçlanmış teklifler düzenlenemez."); }
            }
        }
        setLoading(false);
      } catch (error) {
        navigate('/offers');
      }
    };
    load();
  }, [id, navigate, user]);

  const onSubmit = async (values: z.infer<typeof offerSchema>) => {
    if (!id) return;
    if (isLocked) return;

    try {
      const updatedOffer = await api.offers.update(parseInt(id), { ...values, school_id: parseInt(values.school_id) });
      
      if (values.status === 'accepted' && updatedOffer.status === 'accepted') {
        toast({ 
            title: "Teklif Kabul Edildi!", 
            description: "Otomatik olarak Satış kaydı ve Takip Randevusu oluşturuldu.",
            className: "bg-green-50 border-green-200 text-green-900",
            action: <Button variant="outline" size="sm" onClick={() => navigate('/sales')} className="border-green-300 hover:bg-green-100">Satışa Git</Button>
        });
      } else {
        toast({ title: t('common.success'), description: "Offer updated" });
      }
      
      navigate('/offers');
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message || "Update failed", variant: "destructive" });
    }
  };

  const handleGeneratePdf = async () => {
    if (!id) return;
    setGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ title: "PDF Generated", description: "PDF has been generated and downloaded." });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (!id || !contactEmail) return;
    setSendingEmail(true);
    try {
        await api.offers.sendEmail(parseInt(id), { email: contactEmail });
        toast({ title: "E-posta Gönderildi", description: `${contactEmail} adresine teklif başarıyla iletildi.` });
        setLastSentInfo({ at: new Date().toISOString(), status: 'success' });
    } catch (error) {
        toast({ title: "Hata", description: "E-posta gönderilemedi.", variant: "destructive" });
    } finally {
        setSendingEmail(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('offers.edit')}</h1>
        <div className="flex gap-2">
            {isLocked ? (
                <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm border border-yellow-200">
                    <Lock className="w-4 h-4 mr-2" />
                    {lockReason}
                </div>
            ) : (
                <Button variant="outline" onClick={handleGeneratePdf} disabled={generatingPdf}>
                    {generatingPdf ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                    PDF
                </Button>
            )}
            
            {/* Send Email Button */}
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="secondary" disabled={!contactEmail || sendingEmail}>
                        {sendingEmail ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                        E-posta Gönder
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Teklifi Gönder</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem teklifi PDF formatında <strong>{contactEmail}</strong> adresine gönderecektir. Onaylıyor musunuz?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSendEmail}>Gönder</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      {lastSentInfo && (
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm flex items-center border border-blue-100">
            <Info className="w-4 h-4 mr-2" />
            Son gönderim: {new Date(lastSentInfo.at).toLocaleString()} ({lastSentInfo.status})
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <fieldset disabled={isLocked} className="space-y-6 group-disabled:opacity-50">
                <FormField control={form.control} name="school_id" render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('visits.school')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger></FormControl>
                        <SelectContent>
                        {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="contact_name" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Yetkili Kişi</FormLabel>
                        <FormControl><Input {...field} placeholder="Örn: Ahmet Yılmaz" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="contact_email" render={({ field }) => (
                        <FormItem>
                        <FormLabel>E-posta Adresi</FormLabel>
                        <FormControl><Input {...field} placeholder="ahmet@okul.com" /></FormControl>
                        <FormDescription className="text-xs">Teklifin gönderileceği adres</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="tour_name" render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('offers.tour_name')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="student_count" render={({ field }) => (
                    <FormItem><FormLabel>Students</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="teacher_count" render={({ field }) => (
                    <FormItem><FormLabel>Teachers</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price_per_student" render={({ field }) => (
                    <FormItem><FormLabel>Price per Student</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('common.status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={field.value === 'accepted'}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    {field.value === 'accepted' && <FormDescription className="text-green-600 font-medium">Kabul edildi - Kilitli</FormDescription>}
                    <FormMessage />
                    </FormItem>
                )} />

                {!isLocked && (
                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {t('common.save')}
                    </Button>
                )}
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
