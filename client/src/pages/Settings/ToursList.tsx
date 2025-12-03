import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, MoreHorizontal, Edit, Trash, MapPin } from 'lucide-react';
import { api, TourDefinition } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

export default function ToursList() {
  const { toast } = useToast();
  const [tours, setTours] = useState<TourDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.tours.list();
      setTours(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Bu tur tanımını silmek istediğinize emin misiniz?')) {
      await api.tours.delete(id);
      toast({ title: "Tur silindi" });
      load();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tur Tanımları</h1>
        <Button asChild>
          <Link to="/settings/tours/new">
            <Plus className="mr-2 h-4 w-4" /> Yeni Tur Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tur Adı</TableHead>
                <TableHead>Bölge</TableHead>
                <TableHead>Varsayılan Fiyat</TableHead>
                <TableHead>Süre (Gün)</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : (
                tours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">
                      <div>{tour.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[300px]">{tour.description}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{tour.region}</Badge></TableCell>
                    <TableCell>{tour.default_price_per_student} {tour.default_currency}</TableCell>
                    <TableCell>{tour.default_duration_days}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/settings/tours/${tour.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Düzenle</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(tour.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
