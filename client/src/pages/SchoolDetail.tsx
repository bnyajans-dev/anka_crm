import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ChevronLeft, Briefcase, FileText, DollarSign, MapPin } from 'lucide-react';
import { api, SchoolSummary } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttachmentsPanel from '@/components/AttachmentsPanel';

export default function SchoolDetail() {
  const { id } = useParams();
  const [school, setSchool] = useState<SchoolSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await api.schools.getSummary(parseInt(id));
        setSchool(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!school) return <div>School not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link to="/schools"><ChevronLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-3 w-3 mr-1" /> {school.city} / {school.district}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">360° Zaman Çizelgesi</TabsTrigger>
              <TabsTrigger value="info">Okul Bilgileri</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader><CardTitle>İlişki Geçmişi</CardTitle></CardHeader>
                <CardContent>
                  <div className="relative border-l border-muted ml-4 space-y-8 py-2">
                    {/* Mock timeline merging all events */}
                    {[
                      ...school.visits.map(v => ({ type: 'visit', date: v.visit_date, data: v })),
                      ...school.offers.map(o => ({ type: 'offer', date: '2023-10-16', data: o })), // Using fake date for demo order
                      ...school.sales.map(s => ({ type: 'sale', date: s.closed_date, data: s })),
                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, idx) => (
                      <div key={idx} className="ml-6 relative">
                        <div className={`absolute -left-[29px] h-3 w-3 rounded-full border ${
                          item.type === 'sale' ? 'bg-green-500 border-green-500' : 
                          item.type === 'offer' ? 'bg-blue-500 border-blue-500' : 'bg-muted border-muted-foreground'
                        }`} />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                          <span className="font-medium capitalize">
                            {item.type === 'visit' ? 'Okul Ziyareti' : item.type === 'offer' ? 'Teklif Verildi' : 'Satış Kapatıldı'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.type === 'visit' ? (item.data as any).notes || 'Not yok' : 
                             item.type === 'offer' ? `${(item.data as any).tour_name} - ${(item.data as any).total_price} ${(item.data as any).currency}` :
                             `Gelir: ${(item.data as any).final_revenue_amount}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">İletişim Kişisi</span>
                      <p>{school.contact_person}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Telefon</span>
                      <p>{school.contact_phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Özet</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> Ziyaretler</div>
                <span className="font-bold">{school.visits.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Teklifler</div>
                <span className="font-bold">{school.offers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> Satışlar</div>
                <span className="font-bold text-green-600">{school.sales.length}</span>
              </div>
            </CardContent>
          </Card>

          <AttachmentsPanel relatedType="school" relatedId={school.id} />
        </div>
      </div>
    </div>
  );
}
