public class VrpDataModel
{
    // Noktalar arası süre veya mesafe matrisi (Dinamik olarak ERP'den gelecek)
    public long[,]? TimeMatrix { get; set; } 

    // Her siparişin ağırlık (Kg) talebi
    public long[]? WeightDemands { get; set; } 
    
    // Her siparişin hacim (m3) talebi
    public long[]? VolumeDemands { get; set; } 

    // Araçların kapasiteleri (Örn: 8 araç varsa 8 elemanlı dizi)
    public long[]? VehicleWeightCapacities { get; set; }
    public long[]? VehicleVolumeCapacities { get; set; }
    
    public int VehicleNumber { get; set; }

    // ÇOK MERKEZLİ (MULTI-DEPOT) YAPI İÇİN:
    // Hangi araç hangi düğümden (node) başlıyor ve nerede bitiriyor?
    // Örn: İlk 4 araç Avcılar'dan (Node 0), son 4 araç Üsküdar'dan (Node 1) başlasın.
    public int[]? Starts { get; set; }
    public int[]? Ends { get; set; }

    public long[]? VehicleMaxTimes { get; set; }
    public long[]? VehicleMaxStops { get; set; }
} 