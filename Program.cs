using System;
using DotNetEnv;

namespace Uyumsoft.RouteOptimizer
{
    class Program
    {
        static void Main(string[] args)
        {
            // 1. .env dosyasını yükle
            Env.Load();
            
            // 2. Değişkenleri çek
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            string? erpFilePath = Environment.GetEnvironmentVariable("ERP_EXCEL_PATH");
            string? matrisFilePath = Environment.GetEnvironmentVariable("MATRIX_EXCEL_PATH");
            string? trafikFilePath = Environment.GetEnvironmentVariable("TRAFFIC_EXCEL_PATH");

            if (string.IsNullOrEmpty(connString) || string.IsNullOrEmpty(erpFilePath) || string.IsNullOrEmpty(matrisFilePath) || string.IsNullOrEmpty(trafikFilePath))
            {
                Console.WriteLine("⚠️ UYARI: .env dosyasındaki veritabanı veya excel yolları eksik. Sadece Rotalama Motoru çalıştırılacak.");
            }
            else
            {
                Console.Write("Excel verileri veritabanına yeniden aktarılsın mı? (e/h): ");
                string? cevap = Console.ReadLine();
                if (cevap?.Trim().ToUpper() == "E")
                {
                    try
                    {
                        // 3. Veritabanı Yöneticisini Başlat
                        DatabaseManager dbManager = new DatabaseManager(connString);
                        Console.WriteLine("✅ Veritabanı bağlantısı yapılandırıldı.");

                        // 4. Excel İşlemcisini Başlat
                        ExcelProcessor excelProcessor = new ExcelProcessor(dbManager);
                        Console.WriteLine("✅ Aktarım işlemleri başlıyor...\n");

                        // 5. Verileri Aktar
                        excelProcessor.TransferDistanceMatrix(matrisFilePath);
                        excelProcessor.TransferTrafficMatrix(trafikFilePath);
                        excelProcessor.TransferErpData(erpFilePath);

                        Console.WriteLine("\n🎉 Tüm veritabanı/ETL aktarım işlemleri başarıyla tamamlandı!\n");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Veritabanı/ETL Hatası: {ex.Message}");
                    }
                }
                else
                {
                    Console.WriteLine("⏩ Excel aktarımı atlandı. Mevcut veritabanı kayıtları kullanılacak.");
                }
            }

            Console.WriteLine("===================================================");

            // 6. Veritabanından Rota Optimizasyonu İçin Veri Çekiyoruz
            Console.WriteLine("⏳ Veritabanından rotalama verileri çekiliyor...");
            VrpDataModel data = new VrpDataModel();

            try
            {
                DatabaseManager vrpDb = new DatabaseManager(connString ?? "");
                data = vrpDb.GetVrpData();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Veri çekme hatası: {ex.Message}");
                return;
            }

            if (data.VehicleNumber == 0 || data.TimeMatrixOgle == null || data.TimeMatrixOgle.GetLength(0) == 0)
            {
                Console.WriteLine("⚠️ Yeterli veri bulunamadı! (Araç veya lokasyon yok). Veritabanına aktarım yapıldığından emin olun.");
                return;
            }

            // 7. MOTORU ÇALIŞTIR
            Console.WriteLine("Uyumsoft Rotalama Motoru Çalışıyor...\n");
            
            var optimizer = new VrpOptimizer();
            optimizer.Solve(data);
            
            // Console.ReadLine(); // Ekran kapanmasın diye (CI/CD süreçlerinde vs engel olmasın diye yoruma alındı)
        }
    }
}
