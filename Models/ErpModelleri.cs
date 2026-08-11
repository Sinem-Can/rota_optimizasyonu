namespace Uyumsoft.RouteOptimizer.Models
{
    // API'den arayüze (Next.js'e) göndereceğimiz birleşik paket
    public class FaturaIrsaliyeGorunum
    {
        public string? FaturaNo { get; set; }
        public string? IrsaliyeNo { get; set; }
        public string? CariAdi { get; set; }
        public string? CikisDeposu { get; set; }
        public string? AracPlaka { get; set; }
        public decimal Tutar { get; set; }
        public string? OdemeTuru { get; set; }
        public string? Durum { get; set; }
        // Yeni eklenen alan: Veritabanından gelen JSON formatındaki ürün listesini tutar
        public string? KalemlerJson { get; set; }
    }

    // Arayüzden C#'a gelecek olan kesim paketi
    public class YeniFaturaIstegi
    {
        public string? IrsaliyeNo { get; set; }
        public string? CariAdi { get; set; }
        public string? AracPlaka { get; set; }
        public string? CikisDeposu { get; set; }
        public int KalemSayisi { get; set; }
    }
}