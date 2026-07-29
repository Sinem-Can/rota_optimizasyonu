using System;

namespace Uyumsoft.RouteOptimizer
{
    class Program
    {
        static void Main(string[] args)
        {
            // 1. ERP'den geliyormuş gibi SAHTE VERİ (Mock Data) üretiyoruz
            var data = new VrpDataModel();
            
            // 4 noktalı bir dünya (0: Avcılar Depo, 1, 2, 3: Müşteriler)
            data.TimeMatrix = new long[,] {
                {0, 10, 20, 15}, // Depodan müşterilere dakikalar
                {10, 0, 15, 30}, // 1. Müşteriden diğerlerine...
                {20, 15, 0, 10},
                {15, 30, 10, 0}
            };

            // Müşterilerin sipariş ağırlıkları (Kg) - Deponun (0. indeks) siparişi 0 olur
            data.WeightDemands = new long[] { 0, 50, 80, 40 }; 
            
            // Müşterilerin sipariş hacimleri (m3)
            data.VolumeDemands = new long[] { 0, 10, 20, 200 };

            // 2 Aracımız var. Kapasitelerini tanımlıyoruz
            data.VehicleNumber = 2;
            data.VehicleWeightCapacities = new long[] { 100, 100 }; // İkisi de max 100 Kg taşır
            data.VehicleVolumeCapacities = new long[] { 50, 50 };   // İkisi de max 50 m3 taşır

            // İki araç da Avcılar Depo'dan (0) çıkıp, Avcılar Depo'da (0) bitsin
            data.Starts = new int[] { 0, 0 };
            data.Ends = new int[] { 0, 0 };

            // 2. MOTORU ÇALIŞTIR
            Console.WriteLine("Uyumsoft Rotalama Motoru Çalışıyor...\n");
            
            var optimizer = new VrpOptimizer();
            optimizer.Solve(data);
            
            Console.ReadLine(); // Ekran kapanmasın diye
        }
    }
}
