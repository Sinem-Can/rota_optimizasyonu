using System;
using Microsoft.AspNetCore.Mvc;
using Uyumsoft.RouteOptimizer;
using Uyumsoft.RouteOptimizer.Models;
using Microsoft.AspNetCore.Http;

namespace Uyumsoft.RouteOptimizer.Controllers
{
    [ApiController]
    [Route("api")]
    public class VrpController : ControllerBase
    {
        [HttpPost("import-excel")]
        public IActionResult ImportExcel()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            string? erpFilePath = Environment.GetEnvironmentVariable("ERP_EXCEL_PATH");
            string? matrisFilePath = Environment.GetEnvironmentVariable("MATRIX_EXCEL_PATH");
            string? trafikFilePath = Environment.GetEnvironmentVariable("TRAFFIC_EXCEL_PATH");

            if (string.IsNullOrEmpty(connString) || string.IsNullOrEmpty(erpFilePath) || string.IsNullOrEmpty(matrisFilePath) || string.IsNullOrEmpty(trafikFilePath))
            {
                return BadRequest("⚠️ UYARI: .env dosyasındaki veritabanı veya excel yolları eksik.");
            }

            try
            {
                DatabaseManager dbManager = new DatabaseManager(connString);
                ExcelProcessor excelProcessor = new ExcelProcessor(dbManager);
                
                excelProcessor.TransferDistanceMatrix(matrisFilePath);
                excelProcessor.TransferTrafficMatrix(trafikFilePath);
                excelProcessor.TransferErpData(erpFilePath);

                return Ok("🎉 Tüm veritabanı/ETL aktarım işlemleri başarıyla tamamlandı!");
            }
            catch (Exception ex)
            {
                return Problem($"❌ Veritabanı/ETL Hatası: {ex.Message}");
            }
        }

        [HttpPost("optimize")]
        public IActionResult RunOptimization()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");

            VrpDataModel data;
            try
            {
                DatabaseManager vrpDb = new DatabaseManager(connString);
                data = vrpDb.GetVrpData();
            }
            catch (Exception ex)
            {
                return Problem($"❌ Veri çekme hatası: {ex.Message}");
            }

            if (data.VehicleNumber == 0 || data.TimeMatrixOgle == null || data.TimeMatrixOgle.GetLength(0) == 0)
            {
                return BadRequest("⚠️ Yeterli veri bulunamadı! Lütfen önce /api/import-excel ile veri aktarın.");
            }

            // Optimizasyonu çalıştır
            Console.WriteLine($"\n[INFO] Optimizasyon başlatılıyor. Araç Sayısı: {data.VehicleNumber}");
            var optimizer = new VrpOptimizer();
            var result = optimizer.Solve(data);
            Console.WriteLine($"[INFO] Optimizasyon tamamlandı. Çıkarılan rotalar başarıyla frontend'e gönderiliyor.\n");

            return Ok(result);
        }
        [HttpGet("initial-state")]
        public IActionResult GetInitialState()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");

            VrpDataModel data;
            try
            {
                DatabaseManager vrpDb = new DatabaseManager(connString);
                data = vrpDb.GetVrpData();
            }
            catch (Exception ex)
            {
                return Problem($"❌ Veri çekme hatası: {ex.Message}");
            }

            var drivers = new System.Collections.Generic.List<DriverDto>();
            string[] colorKeys = new string[] { "a", "b", "c", "d", "e" };

            for (int i = 0; i < data.VehicleNumber; i++)
            {
                int startNode = data.Starts != null && i < data.Starts.Length ? data.Starts[i] : 0;
                string dName = (data.NodeNames != null && startNode < data.NodeNames.Length && !string.IsNullOrWhiteSpace(data.NodeNames[startNode])) ? data.NodeNames[startNode] : "Merkez Depo";
                double dX = (startNode == 1) ? 30 : 50;
                double dY = (startNode == 1) ? 70 : 50;

                drivers.Add(new DriverDto
                {
                    id = $"VHC-00{i + 1}",
                    label = $"Araç {i + 1}",
                    fullName = $"Şoför {i + 1}",
                    plate = $"34 VHC 0{i + 1}",
                    vehicleType = "Panelvan",
                    capacityMaxKg = data.VehicleWeightCapacities != null && i < data.VehicleWeightCapacities.Length ? data.VehicleWeightCapacities[i] : 1500,
                    colorKey = colorKeys[i % colorKeys.Length],
                    depotName = dName,
                    depotX = dX,
                    depotY = dY,
                    stops = new System.Collections.Generic.List<StopDto>()
                });
            }

            var unassigned = new System.Collections.Generic.List<StopDto>();
            int sequenceCounter = 1;

            if (data.WeightDemands != null)
            {
                for (int i = 0; i < data.WeightDemands.Length; i++)
                {
                    if (data.WeightDemands[i] > 0 || (data.VolumeDemands != null && data.VolumeDemands[i] > 0))
                    {
                        if ((data.Starts == null || !Array.Exists(data.Starts, s => s == i)) && 
                            (data.Ends == null || !Array.Exists(data.Ends, e => e == i)))
                        {
                            int origCurrentNode = data.OriginalNodeIds != null ? data.OriginalNodeIds[i] : i;
                            string gercekIsim = (data.NodeNames != null && i < data.NodeNames.Length && !string.IsNullOrEmpty(data.NodeNames[i]))
                                                ? data.NodeNames[i]
                                                : $"Müşteri {origCurrentNode}";
                            string cariKodu = (data.NodeCodes != null && i < data.NodeCodes.Length && !string.IsNullOrEmpty(data.NodeCodes[i]))
                                                ? data.NodeCodes[i]
                                                : string.Empty;

                            string gercekAdres = (data.NodeAddresses != null && i < data.NodeAddresses.Length && !string.IsNullOrEmpty(data.NodeAddresses[i]))
                                                ? data.NodeAddresses[i]
                                                : $"Adres {origCurrentNode}";

                            long toStartTime = 0;
                            if (data.TimeWindows != null && data.TimeWindows.GetLength(0) > i)
                            {
                                toStartTime = data.TimeWindows[i, 0];
                            }

                                Random rnd = new Random(origCurrentNode);
                                unassigned.Add(new StopDto
                                {
                                    id = $"ST-{origCurrentNode}-{Guid.NewGuid().ToString().Substring(0, 4)}",
                                    cariKod = cariKodu,
                                    sequence = sequenceCounter++,
                                    customerName = gercekIsim,
                                    address = gercekAdres,
                                    district = "",
                                    eta = toStartTime > 0 ? TimeSpan.FromMinutes(toStartTime).ToString(@"hh\:mm") : "10:00",
                                    windowStart = toStartTime > 0 ? TimeSpan.FromMinutes(toStartTime).ToString(@"hh\:mm") : "08:00",
                                    windowEnd = "18:00",
                                    serviceMinutes = (int)(5 + (data.WeightDemands[i] / 100) * 2),
                                    weightKg = data.WeightDemands[i],
                                    volumeM3 = data.VolumeDemands != null ? data.VolumeDemands[i] : 0,
                                    status = "pending",
                                    priority = "Normal",
                                    phone = "0555 000 0000",
                                    orderNo = $"ORD-{origCurrentNode}",
                                    x = 10 + (rnd.NextDouble() * 80),
                                    y = 10 + (rnd.NextDouble() * 80)
                                });
                        }
                    }
                }
            }

            return Ok(new { drivers = drivers, unassigned = unassigned });
        }

        [HttpPost("orders")]
        public IActionResult CreateMockOrder([FromBody] MockOrderPayload payload)
        {
            // Gerçek dünyada bu veri DatabaseManager aracılığıyla DB'ye INSERT edilir.
            // Şimdilik sadece başarılı yanıt (Mock) dönüyoruz.
            return Ok(new 
            { 
                Status = "Başarılı",
                Message = $"Gelen {payload.SiparisIds?.Length ?? 0} sipariş başarıyla ERP'den alındı ve rota havuzuna eklendi.", 
                ReceivedData = payload 
            });
        }
    }
}
