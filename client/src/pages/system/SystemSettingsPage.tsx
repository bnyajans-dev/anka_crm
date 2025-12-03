import { Link } from 'react-router-dom';
import { Settings, FileText, Map, Tags, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Genel Yapılandırma</CardTitle>
            <CardDescription>Sistem genelindeki ayarları yönetin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><FileText className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-medium">Teklif Şablonu</h3>
                  <p className="text-sm text-muted-foreground">E-posta ve PDF şablonlarını düzenleyin.</p>
                </div>
              </div>
              <Button variant="outline" asChild><Link to="/settings/offer-template">Yönet</Link></Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><Map className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-medium">Bölge Haritası</h3>
                  <p className="text-sm text-muted-foreground">Satış bölgelerini ve harita raporlarını görüntüleyin.</p>
                </div>
              </div>
              <Button variant="outline" asChild><Link to="/reports/map">Görüntüle</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Rol Tanımları</CardTitle>
            <CardDescription>Sistemdeki yetki seviyeleri hakkında bilgi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="font-semibold text-purple-700">System Admin</span>
              <span className="text-muted-foreground">Tam yetkili. Kullanıcı, takım ve sistem ayarlarını yönetir. Tüm verileri görür.</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="font-semibold text-red-700">Yönetici (Admin)</span>
              <span className="text-muted-foreground">Şirket içi üst düzey yönetici. Tüm satış verilerini ve hedefleri yönetir.</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="font-semibold text-blue-700">Ekip Lideri</span>
              <span className="text-muted-foreground">Sadece kendi takımındaki personeli ve verileri yönetir.</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="font-semibold text-green-700">Satış Personeli</span>
              <span className="text-muted-foreground">Sadece kendi verilerini görür ve yönetir.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
