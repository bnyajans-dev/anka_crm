import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, FileText, ChevronLeft, Mail, Calendar, CreditCard } from 'lucide-react';
import { api, Offer, Sale, Appointment, Attachment } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AttachmentsPanel from '@/components/AttachmentsPanel';

export default function OfferDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const offerData = await api.offers.getById(parseInt(id));
        setOffer(offerData);

        if (offerData) {
            const allSales = await api.sales.list();
            setSale(allSales.find(s => s.offer_id === parseInt(id)) || null);

            const allAppts = await api.appointments.list();
            setAppointments(allAppts.filter(a => a.school_id === offerData.school_id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSendEmail = async () => {
    if (!offer || !offer.contact_email) return;
    if (!confirm(`Teklif ${offer.contact_email} adresine gönderilecek. Onaylıyor musunuz?`)) return;

    setSendingEmail(true);
    try {
        await api.offers.sendEmail(offer.id, {});
        toast({ title: "E-posta Gönderildi", description: "Teklif başarıyla iletildi." });
        // Refresh offer to show updated status
        const updated = await api.offers.getById(offer.id);
        setOffer(updated);
    } catch (e) {
        toast({ title: "Hata", variant: "destructive" });
    } finally {
        setSendingEmail(false);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!offer) return <div>Offer not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/offers"><ChevronLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{offer.tour_name}</h1>
            <Badge variant="outline" className={offer.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}>
                {offer.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground">{offer.school_name}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}>
                <FileText className="mr-2 h-4 w-4" /> PDF Önizle
            </Button>
            <Button variant="secondary" disabled={!offer.contact_email || sendingEmail} onClick={handleSendEmail}>
                {sendingEmail ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                E-posta Gönder
            </Button>
            <Button asChild>
                <Link to={`/offers/${offer.id}/edit`}>Düzenle</Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Teklif Detayları</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-muted-foreground">Öğrenci Sayısı</span>
                        <p className="font-medium">{offer.student_count}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Öğretmen Sayısı</span>
                        <p className="font-medium">{offer.teacher_count}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Kişi Başı Fiyat</span>
                        <p className="font-medium">{offer.price_per_student} {offer.currency}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Toplam Tutar</span>
                        <p className="font-bold text-lg text-primary">{offer.total_price.toLocaleString()} {offer.currency}</p>
                    </div>
                    <div className="col-span-2 pt-4 border-t grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-muted-foreground">Yetkili Kişi</span>
                            <p className="font-medium">{offer.contact_name || '-'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">E-posta</span>
                            <p className="font-medium">{offer.contact_email || '-'}</p>
                        </div>
                    </div>
                    {offer.last_sent_at && (
                        <div className="col-span-2 bg-blue-50 p-2 rounded text-xs text-blue-700 flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            Son gönderim: {new Date(offer.last_sent_at).toLocaleString()}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AttachmentsPanel relatedType="offer" relatedId={offer.id} />
        </div>

        <div className="space-y-6">
            {sale && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2"><CardTitle className="text-green-800 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Satış Durumu</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-green-700">Tutar:</span>
                            <span className="font-bold text-green-900">{sale.final_revenue_amount} {sale.currency}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700">Tarih:</span>
                            <span className="font-medium text-green-900">{sale.closed_date}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-4 border-green-300 hover:bg-green-100 text-green-800" asChild>
                            <Link to="/sales">Satışı Gör</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> İlgili Randevular</CardTitle></CardHeader>
                <CardContent>
                    {appointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Randevu bulunamadı.</p>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map(appt => (
                                <div key={appt.id} className="text-sm border-b pb-2 last:border-0">
                                    <div className="font-medium">{new Date(appt.start_datetime).toLocaleDateString()}</div>
                                    <div className="text-muted-foreground">{appt.type} - {appt.status}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
