#nullable disable
using System;
using DotNetEnv;

namespace UyumsoftETL
{
    class Program
    {
        static void Main(string[] args)
        {
            // .env dosyasını yükle
            Env.Load();
            
            // Değişkenleri çek
            string connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            string erpFilePath = Environment.GetEnvironmentVariable("ERP_EXCEL_PATH");
            string matrisFilePath = Environment.GetEnvironmentVariable("MATRIX_EXCEL_PATH");

            if (string.IsNullOrEmpty(connString) || string.IsNullOrEmpty(erpFilePath) || string.IsNullOrEmpty(matrisFilePath))
            {
                Console.WriteLine("❌ ERROR: Missing configuration in .env file! Ensure DB string and file paths are set.");
                return;
            }

            try
            {
                // 1. Veritabanı Yöneticisini Başlat
                DatabaseManager dbManager = new DatabaseManager(connString);
                Console.WriteLine("✅ Successfully configured Database connection.");

                // 2. Excel İşlemcisini Başlat
                ExcelProcessor excelProcessor = new ExcelProcessor(dbManager);
                Console.WriteLine("✅ Initialization complete. Starting transfer processes...\n");

                // 3. Verileri Aktar
                excelProcessor.TransferDistanceMatrix(matrisFilePath);
                excelProcessor.TransferErpData(erpFilePath);

                Console.WriteLine("\n🎉 All transfer processes completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ General Error: {ex.Message}");
            }
        }
    }
}