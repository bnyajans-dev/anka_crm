import { useEffect, useState } from 'react';
import { api, Offer } from '@/lib/mockApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MobileOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    api.offers.list().then(setOffers);
  }, []);

  return (
    <div className="p-4 space-y-4 animate-in fade-in">
      <h1 className="text-xl font-bold sticky top-0 bg-background py-2 z-10">My Offers</h1>
      <div className="space-y-3">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">{offer.school_name}</span>
                <Badge variant="secondary">{offer.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{offer.tour_name}</p>
              <div className="flex justify-between items-end mt-2">
                <div className="text-xs text-muted-foreground">
                  {offer.student_count} Students
                </div>
                <div className="font-bold text-primary">
                  {offer.total_price} {offer.currency}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
