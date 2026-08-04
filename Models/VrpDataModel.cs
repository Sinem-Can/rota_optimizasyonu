public class VrpDataModel
{
    // Fiziksel Yol Mesafesi (KM) Matrisi
    public long[,]? DistanceMatrix { get; set; }

    // Trafik yoğunluğuna göre Noktalar arası süre matrisleri
    public long[,]? TimeMatrixSabah { get; set; } 
    public long[,]? TimeMatrixOgle { get; set; } 
    public long[,]? TimeMatrixAksam { get; set; } 

    // Her siparişin ağırlık (Kg) talebi
    public long[]? WeightDemands { get; set; } 
    
    // Her siparişin hacim (m3) talebi
    public long[]? VolumeDemands { get; set; } 

    // Araçların kapasiteleri (Örn: 8 araç varsa 8 elemanlı dizi)
    public long[]? VehicleWeightCapacities { get; set; }
    public long[]? VehicleVolumeCapacities { get; set; }
    public long[]? VehicleKmCosts { get; set; }
    
    public int VehicleNumber { get; set; }

    // ÇOK MERKEZLİ (MULTI-DEPOT) YAPI İÇİN:
    // Hangi araç hangi düğümden (node) başlıyor ve nerede bitiriyor?
    // Örn: İlk 4 araç Avcılar'dan (Node 0), son 4 araç Üsküdar'dan (Node 1) başlasın.
    public int[]? Starts { get; set; }
    public int[]? Ends { get; set; }

    public long[]? VehicleMaxTimes { get; set; }
    public long[]? VehicleMaxStops { get; set; }

    // ZAMAN PENCERELERİ (Time Windows)
    // Her bir lokasyonun kabul saatleri: [Başlangıç(dk), Bitiş(dk)]
    // Örn: Sabah 08:00 = 480, Akşam 18:00 = 1080
    public long[,]? TimeWindows { get; set; }

    // KÖPRÜ/YAKA GEÇİŞ KISITLARI (Bridge Restrictions)
    // 0: Bilinmiyor/Farketmez, 1: Avrupa Yakası, 2: Anadolu Yakası
    public int[]? NodeRegions { get; set; } 
    public int[]? VehicleAllowedRegions { get; set; }

    // Orijinal Veritabanı ID'lerini (Müşteri Numaralarını) tutar. Matris küçültüldüğünde çıktı için gereklidir.
    public int[]? OriginalNodeIds { get; set; }

    // Düğümlerin gerçek isimlerini (Cari Kodlarını veya Depo Adlarını) tutacak dizi
    public string[]? NodeNames { get; set; }
} 