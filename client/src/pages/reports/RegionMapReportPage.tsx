import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api, School } from '@/lib/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function RegionMapReportPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [stats, setStats] = useState({ schools: 0, visits: 0, offers: 0, sales: 0, revenue: 0 });

  useEffect(() => {
    const load = async () => {
      const [schoolsData, visitsData, offersData, salesData] = await Promise.all([
        api.schools.list(),
        api.visits.list(),
        api.offers.list(),
        api.sales.list(),
      ]);

      setSchools(schoolsData);
      
      // Calculate simplified stats
      setStats({
        schools: schoolsData.length,
        visits: visitsData.length,
        offers: offersData.length,
        sales: salesData.length,
        revenue: salesData.reduce((acc, curr) => acc + curr.final_revenue_amount, 0)
      });

      setLoading(false);
    };
    load();
  }, []);

  const filteredSchools = regionFilter === 'all' 
    ? schools 
    : schools.filter(s => s.region === regionFilter);

  const regions = Array.from(new Set(schools.map(s => s.region).filter(Boolean)));

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><MapIcon className="h-8 w-8" /> Bölge Haritası</h1>
        
        <div className="w-[200px]">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger><SelectValue placeholder="Bölge Seçiniz" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Bölgeler</SelectItem>
              {regions.map(r => <SelectItem key={r} value={r!}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-3 flex flex-col min-h-0 border-0 shadow-md overflow-hidden">
          <CardContent className="p-0 flex-1 relative z-0">
             <MapContainer center={[39.0, 35.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredSchools.map(school => (
                  school.latitude && school.longitude && (
                    <Marker key={school.id} position={[school.latitude, school.longitude]}>
                      <Popup>
                        <div className="p-1">
                          <h3 className="font-bold text-sm">{school.name}</h3>
                          <p className="text-xs text-muted-foreground">{school.city} / {school.district}</p>
                          <p className="text-xs mt-1 font-medium text-blue-600">{school.region}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
             </MapContainer>
          </CardContent>
        </Card>

        <div className="space-y-4 overflow-auto">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Genel Özet</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Okul Sayısı:</span> <span className="font-bold">{stats.schools}</span></div>
              <div className="flex justify-between"><span>Ziyaretler:</span> <span className="font-bold">{stats.visits}</span></div>
              <div className="flex justify-between"><span>Teklifler:</span> <span className="font-bold">{stats.offers}</span></div>
              <div className="flex justify-between"><span>Satışlar:</span> <span className="font-bold">{stats.sales}</span></div>
              <div className="pt-2 border-t mt-2 flex justify-between">
                <span className="font-medium">Ciro:</span> 
                <span className="font-bold text-green-600">{stats.revenue.toLocaleString()} ₺</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Bölge Listesi</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {regions.map(r => (
                  <div key={r} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                    <span>{r}</span>
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded-full text-primary font-medium">
                      {schools.filter(s => s.region === r).length} Okul
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
