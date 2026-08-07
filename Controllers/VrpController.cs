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

        [HttpPost("import-erp-only")]
        public IActionResult ImportErpOnly()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            string? erpFilePath = Environment.GetEnvironmentVariable("ERP_EXCEL_PATH");

            if (string.IsNullOrEmpty(connString) || string.IsNullOrEmpty(erpFilePath))
            {
                return BadRequest("⚠️ UYARI: .env dosyasındaki veritabanı veya excel yolları eksik.");
            }

            try
            {
                DatabaseManager dbManager = new DatabaseManager(connString);
                ExcelProcessor excelProcessor = new ExcelProcessor(dbManager);
                
                excelProcessor.TransferErpData(erpFilePath);

                return Ok("🎉 Sadece ERP verileri başarıyla aktarıldı (Matrisler es geçildi)!");
            }
            catch (Exception ex)
            {
                return Problem($"❌ Veritabanı/ETL Hatası: {ex.Message}");
            }
        }

        [HttpGet("clean-web-orders")]
        public IActionResult CleanWebOrders()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            try
            {
                using (var conn = new Npgsql.NpgsqlConnection(connString))
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand("DELETE FROM satis_siparisi WHERE siparis_no LIKE 'WEB%';", conn))
                        cmd.ExecuteNonQuery();
                    using (var cmd = new Npgsql.NpgsqlCommand("ALTER TABLE stok_hareketleri DROP COLUMN IF EXISTS id;", conn))
                        cmd.ExecuteNonQuery();
                }
                return Ok("Web siparişleri temizlendi ve ID kolonu düşürüldü.");
            }
            catch (Exception ex)
            {
                return Problem($"Hata: {ex.Message}");
            }
        }

        [HttpGet("reset-db-hard")]
        public IActionResult ResetDbHard()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");

            try
            {
                string sql = System.IO.File.ReadAllText("postgreyeyazilacak.sql");
                using (var conn = new Npgsql.NpgsqlConnection(connString))
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand(sql, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok("DB tamamen silinip baştan oluşturuldu!");
            }
            catch (Exception ex)
            {
                return Problem($"DB Reset Hatası: {ex.Message}");
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
                
                string dbPlate = data.VehiclePlates != null && i < data.VehiclePlates.Length && !string.IsNullOrWhiteSpace(data.VehiclePlates[i]) ? data.VehiclePlates[i] : $"34 VHC 0{i + 1}";
                string dbName = data.VehicleNames != null && i < data.VehicleNames.Length && !string.IsNullOrWhiteSpace(data.VehicleNames[i]) ? data.VehicleNames[i] : $"Araç {i + 1}";

                drivers.Add(new DriverDto
                {
                    id = $"VHC-00{i + 1}",
                    label = dbName,
                    fullName = $"Şoför {i + 1}",
                    plate = dbPlate,
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
            int orderCounter = 1;

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
                                    orderNo = $"ORD-{orderCounter++}",
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
            return Ok(new 
            { 
                Status = "Başarılı",
                Message = $"Gelen {payload.SiparisIds?.Length ?? 0} sipariş başarıyla ERP'den alındı ve rota havuzuna eklendi.", 
                ReceivedData = payload 
            });
        }

        [HttpGet("erp/cari")]
        public IActionResult GetCariRecords()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            DatabaseManager dbManager = new DatabaseManager(connString);

            var records = new System.Collections.Generic.List<object>();
            try
            {
                using (var conn = dbManager.GetConnection())
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand("SELECT c.cari_kodu, c.cari_adi, c.tip, c.adres_metni, c.mal_kabul_baslangic, c.mal_kabul_bitis, COALESCE(SUM(s.toplam_hacim_m3), 0) FROM cari_kart c LEFT JOIN satis_siparisi s ON c.cari_kodu::text = s.cari_kodu::text GROUP BY c.cari_kodu, c.cari_adi, c.tip, c.adres_metni, c.mal_kabul_baslangic, c.mal_kabul_bitis ORDER BY c.cari_kodu ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string kod = reader.IsDBNull(0) ? "" : reader.GetString(0);
                            string ad = reader.IsDBNull(1) ? "" : reader.GetString(1);
                            string tip = reader.IsDBNull(2) ? "Müşteri" : reader.GetString(2);
                            string adres = reader.IsDBNull(3) ? "" : reader.GetString(3);
                            string windowStart = reader.IsDBNull(4) ? "08:00" : reader.GetString(4);
                            string windowEnd = reader.IsDBNull(5) ? "18:00" : reader.GetString(5);
                            double avgVolume = reader.IsDBNull(6) ? 0 : Convert.ToDouble(reader.GetValue(6));
                            
                            records.Add(new
                            {
                                id = kod,
                                code = kod,
                                name = ad,
                                type = tip,
                                district = "",
                                address = adres,
                                windowStart = windowStart,
                                windowEnd = windowEnd,
                                avgVolumeM3 = avgVolume,
                                status = "Aktif"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veritabanı hatası", error = ex.Message });
            }
            return Ok(records);
        }

        [HttpGet("erp/araclar")]
        public IActionResult GetAracRecords()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            DatabaseManager dbManager = new DatabaseManager(connString);

            var records = new System.Collections.Generic.List<object>();
            try
            {
                using (var conn = dbManager.GetConnection())
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand("SELECT a.arac_kodu, a.plaka, a.marka_model, a.kasa_tipi, a.maks_agirlik_kg, a.maks_hacim_m3, COALESCE(d.depo_adi, a.bagli_oldugu_depo::text) FROM arac_kartlari a LEFT JOIN depo d ON a.bagli_oldugu_depo::text = d.depo_kodu::text ORDER BY a.arac_kodu ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string depo = reader.IsDBNull(6) ? "" : reader.GetString(6);
                            if (depo == "0") depo = "Avcılar Merkez Depo";
                            else if (depo == "1") depo = "Üsküdar Merkez Depo";

                            records.Add(new
                            {
                                id = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                plate = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                driver = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                type = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                capacityKg = reader.IsDBNull(4) ? 0 : Convert.ToDouble(reader.GetValue(4)),
                                volumeM3 = reader.IsDBNull(5) ? 0 : Convert.ToDouble(reader.GetValue(5)),
                                depot = depo,
                                features = "",
                                status = "Aktif"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veritabanı hatası", error = ex.Message });
            }
            return Ok(records);
        }

        [HttpGet("erp/stoklar")]
        public IActionResult GetStokRecords()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            DatabaseManager dbManager = new DatabaseManager(connString);

            var records = new System.Collections.Generic.List<object>();
            try
            {
                using (var conn = dbManager.GetConnection())
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand(@"
                        SELECT s.stok_kodu, MAX(s.urun), MAX(s.birim), MAX(s.birim_agirlik_kg), MAX(s.birim_hacim_m3), SUM(COALESCE(i.miktar, 0)), STRING_AGG(DISTINCT d.depo_adi, ', ') 
                        FROM stok_karti s 
                        LEFT JOIN isyeri_stok i ON s.stok_kodu::text = i.stok::text 
                        LEFT JOIN depo d ON i.depo_kodu::text = d.depo_kodu::text 
                        GROUP BY s.stok_kodu 
                        ORDER BY s.stok_kodu ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            records.Add(new
                            {
                                id = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                code = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                name = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                category = "İçecek",
                                unit = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                weightKg = reader.IsDBNull(3) ? 0 : Convert.ToDouble(reader.GetValue(3)),
                                volumeM3 = reader.IsDBNull(4) ? 0 : Convert.ToDouble(reader.GetValue(4)),
                                quantity = reader.IsDBNull(5) ? 0 : Convert.ToInt32(reader.GetValue(5)),
                                warehouse = reader.IsDBNull(6) ? "" : reader.GetString(6),
                                criticalLevel = 100
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veritabanı hatası", error = ex.Message });
            }
            return Ok(records);
        }

        [HttpGet("erp/depolar")]
        public IActionResult GetDepoRecords()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            DatabaseManager dbManager = new DatabaseManager(connString);

            var records = new System.Collections.Generic.List<object>();
            try
            {
                using (var conn = dbManager.GetConnection())
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand("SELECT depo_kodu, depo_adi FROM depo ORDER BY depo_kodu ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string depoAdi = reader.IsDBNull(1) ? "" : reader.GetString(1);
                            records.Add(new
                            {
                                id = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                code = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                name = depoAdi,
                                district = depoAdi.Split(' ').Length > 0 ? depoAdi.Split(' ')[0] : "",
                                address = depoAdi
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veritabanı hatası", error = ex.Message });
            }
            return Ok(records);
        }

        [HttpGet("erp/siparisler")]
        public IActionResult GetSiparisRecords()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            DatabaseManager dbManager = new DatabaseManager(connString);

            var orders = new System.Collections.Generic.Dictionary<string, dynamic>();
            try
            {
                using (var conn = dbManager.GetConnection())
                {
                    conn.Open();
                    using (var cmd = new Npgsql.NpgsqlCommand(@"
                        SELECT 
                            s.siparis_no, s.teklif, s.cari_kodu, s.cari_adi, s.arac_kodu, 
                            s.toplam_kg, s.toplam_hacim_m3, s.siparis_durumu,
                            c.mal_kabul_baslangic, c.mal_kabul_bitis,
                            a.plaka,
                            sh.stok, sk.urun, sh.miktar, sk.birim
                        FROM satis_siparisi s
                        LEFT JOIN cari_kart c ON s.cari_kodu::text = c.cari_kodu::text 
                        LEFT JOIN arac_kartlari a ON s.arac_kodu::text = a.arac_kodu::text 
                        LEFT JOIN stok_hareketleri sh ON s.siparis_no::text = sh.siparis::text
                        LEFT JOIN stok_karti sk ON sh.stok::text = sk.stok_kodu::text
                        ORDER BY s.siparis_no ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string siparisNo = reader.IsDBNull(0) ? "" : reader.GetString(0);
                            if (string.IsNullOrEmpty(siparisNo)) continue;

                            string teklif = reader.IsDBNull(1) ? "" : reader.GetString(1);
                            string cariKodu = reader.IsDBNull(2) ? "" : reader.GetString(2);
                            string cariAdi = reader.IsDBNull(3) ? "" : reader.GetString(3);
                            string aracKodu = reader.IsDBNull(4) ? "" : reader.GetString(4);
                            double kg = reader.IsDBNull(5) ? 0 : Convert.ToDouble(reader.GetValue(5));
                            double m3 = reader.IsDBNull(6) ? 0 : Convert.ToDouble(reader.GetValue(6));
                            string durum = reader.IsDBNull(7) ? "Bekliyor" : reader.GetString(7);
                            string wStart = reader.IsDBNull(8) ? "08:00" : reader.GetString(8);
                            string wEnd = reader.IsDBNull(9) ? "18:00" : reader.GetString(9);
                            string plaka = reader.IsDBNull(10) ? "" : reader.GetString(10);

                            if (!orders.ContainsKey(siparisNo))
                            {
                                orders[siparisNo] = new
                                {
                                    id = siparisNo,
                                    offerId = teklif,
                                    cariName = cariAdi,
                                    cariCode = cariKodu,
                                    vehicleCode = aracKodu,
                                    vehiclePlate = plaka,
                                    totalKg = kg,
                                    totalM3 = m3,
                                    status = durum,
                                    windowStart = wStart,
                                    windowEnd = wEnd,
                                    lines = new System.Collections.Generic.List<dynamic>()
                                };
                            }

                            string stokKodu = reader.IsDBNull(11) ? "" : reader.GetString(11);
                            if (!string.IsNullOrEmpty(stokKodu))
                            {
                                string urunAdi = reader.IsDBNull(12) ? stokKodu : reader.GetString(12);
                                int miktar = reader.IsDBNull(13) ? 0 : Convert.ToInt32(reader.GetValue(13));
                                string birim = reader.IsDBNull(14) ? "Adet" : reader.GetString(14);
                                
                                bool lineExists = false;
                                foreach (var l in orders[siparisNo].lines)
                                {
                                    if (l.stockCode == stokKodu)
                                    {
                                        lineExists = true;
                                        break;
                                    }
                                }

                                if (!lineExists)
                                {
                                    orders[siparisNo].lines.Add(new
                                    {
                                        stockCode = stokKodu,
                                        stockName = urunAdi,
                                        quantity = Math.Abs(miktar),
                                        unit = birim
                                    });
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veritabanı hatası", error = ex.Message });
            }
            return Ok(orders.Values);
        }

        [HttpGet("erp/konumlar")]
        public IActionResult GetCariKonumlar()
        {
            string? connString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connString)) return BadRequest("DB_CONNECTION_STRING eksik.");
            DatabaseManager dbManager = new DatabaseManager(connString);

            var records = new System.Collections.Generic.List<object>();
            try
            {
                using (var conn = dbManager.GetConnection())
                {
                    conn.Open();
                    // Sütun isimlerini veritabanındaki tablo ile birebir eşleştirdik
                    using (var cmd = new Npgsql.NpgsqlCommand("SELECT cari_kodu, lat, lng FROM cari_konumlar ORDER BY cari_kodu ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            records.Add(new
                            {
                                cariCode = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                lat = reader.IsDBNull(1) ? 0 : reader.GetDecimal(1),
                                lng = reader.IsDBNull(2) ? 0 : reader.GetDecimal(2)
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veritabanı hatası", error = ex.Message });
            }
            return Ok(records);
        }
    }
}
