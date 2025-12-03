import { useEffect, useState } from 'react';
import { Plus, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Visit } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function MobileVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    api.visits.list().then(setVisits);
  }, []);

  const handleCheckIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ title: "Checking location..." });
    setTimeout(() => {
      toast({ title: "Check-in Successful", description: "Location recorded at 10:42 AM" });
    }, 1000);
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center sticky top-0 bg-background py-2 z-10">
        <h1 className="text-xl font-bold">My Visits</h1>
        <Button size="sm" asChild className="rounded-full h-8 w-8 p-0">
          <Link to="/m/visits/new"><Plus className="h-5 w-5" /></Link>
        </Button>
      </div>

      <div className="space-y-3">
        {visits.map((visit) => (
          <Card key={visit.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{visit.school_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(visit.visit_date).toLocaleDateString()}</span>
                </div>
                <Badge variant={visit.status === 'done' ? 'default' : 'outline'}>{visit.status}</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={handleCheckIn}>
                  <MapPin className="mr-1.5 h-3 w-3" /> Check-in
                </Button>
                <Button size="sm" className="flex-1 h-8 text-xs">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
