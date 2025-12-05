import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIOfferHelperProps {
  schoolName?: string;
  tourName?: string;
  studentCount?: number;
  teacherCount?: number;
  pricePerStudent?: number;
  totalPrice?: number;
  dateRange?: string;
  onTextGenerated?: (text: string) => void;
}

export function AIOfferHelper({
  schoolName = '',
  tourName = '',
  studentCount = 0,
  teacherCount = 0,
  pricePerStudent = 0,
  totalPrice = 0,
  dateRange = '',
  onTextGenerated
}: AIOfferHelperProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateOfferText = async () => {
    setLoading(true);
    setGeneratedText('');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const text = `Sayın ${schoolName || '[Okul Adı]'} Yetkilisi,

${tourName || '[Tur Adı]'} programımız için hazırladığımız özel teklifi dikkatinize sunarız.

📋 Tur Detayları:
• Tur Adı: ${tourName || '[Tur Adı]'}
• Öğrenci Sayısı: ${studentCount || '[Öğrenci Sayısı]'} kişi
• Öğretmen Sayısı: ${teacherCount || '[Öğretmen Sayısı]'} kişi
• Kişi Başı Ücret: ${pricePerStudent ? pricePerStudent.toLocaleString('tr-TR') + ' ₺' : '[Kişi Başı Ücret]'}
• Toplam Tutar: ${totalPrice ? totalPrice.toLocaleString('tr-TR') + ' ₺' : '[Toplam Tutar]'}
${dateRange ? `• Tarih Aralığı: ${dateRange}` : ''}

📌 Teklifimize Dahil Olan Hizmetler:
• Gidiş-dönüş ulaşım (Lüks otobüs)
• Konaklama (4 yıldızlı otel)
• Tam pansiyon yemek hizmeti
• Profesyonel rehberlik hizmeti
• Müze ve giriş ücretleri
• Tüm transferler
• Öğrenci sigortası

🎯 Neden Anka Travel?
• 15+ yıllık deneyim
• 500+ başarılı okul turu
• 7/24 acil destek hattı
• Tam kapsamlı sigorta
• Esnek ödeme seçenekleri

Bu teklifimiz 15 gün süreyle geçerlidir. Sorularınız için bizimle iletişime geçebilirsiniz.

Saygılarımızla,
Anka Travel Ekibi
📞 0850 XXX XX XX
✉️ info@ankatravel.com`;

    setGeneratedText(text);
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast({
      title: "Kopyalandı",
      description: "Teklif metni panoya kopyalandı.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    if (onTextGenerated) {
      onTextGenerated(generatedText);
    }
    setOpen(false);
    toast({
      title: "Metin Eklendi",
      description: "Teklif metni forma eklendi.",
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
        data-testid="button-ai-helper"
      >
        <Sparkles className="h-4 w-4" />
        Yapay Zeka ile Teklif Metni Öner
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Yapay Zeka Teklif Asistanı
            </DialogTitle>
            <DialogDescription>
              Teklif bilgilerinize göre otomatik olarak profesyonel bir teklif metni oluşturulacaktır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!generatedText && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Teklif bilgilerinizi kullanarak profesyonel bir teklif metni oluşturabiliriz.
                </p>
                <Button onClick={generateOfferText} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Teklif Metni Oluştur
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Teklif metni hazırlanıyor...</p>
                <p className="text-xs text-muted-foreground mt-1">Bu işlem birkaç saniye sürebilir</p>
              </div>
            )}

            {generatedText && !loading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Oluşturulan Teklif Metni</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Kopyala
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Oluşturulan metin burada görünecek..."
                />
                <p className="text-xs text-muted-foreground">
                  * Metni ihtiyacınıza göre düzenleyebilirsiniz
                </p>
              </div>
            )}
          </div>

          {generatedText && !loading && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => generateOfferText()}>
                Yeniden Oluştur
              </Button>
              <Button onClick={handleUse} className="gap-2">
                <Check className="h-4 w-4" />
                Teklife Ekle
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
