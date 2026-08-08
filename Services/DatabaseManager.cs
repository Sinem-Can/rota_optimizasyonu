#nullable disable
using System;
using Npgsql;

namespace Uyumsoft.RouteOptimizer
{
    public class DatabaseManager
    {
        private readonly string _connectionString;

        public DatabaseManager(string connectionString)
        {
            // Tırnak işaretlerini temizle
            if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("\""))
            {
                _connectionString = connectionString.Trim('"');
            }
            else
            {
                _connectionString = connectionString;
            }
        }

        public NpgsqlConnection GetConnection()
        {
            return new NpgsqlConnection(_connectionString);
        }

        public VrpDataModel GetVrpData()
        {
            var data = new VrpDataModel();

            using (var conn = GetConnection())
            {
                conn.Open();

                // 1. Araç kapasitelerini ve bağlı oldukları depoları çek (arac_kartlari)
                var weightCaps = new System.Collections.Generic.List<long>();
                var volCaps = new System.Collections.Generic.List<long>();
                var depots = new System.Collections.Generic.List<int>();
                var kmCosts = new System.Collections.Generic.List<long>();
                var plates = new System.Collections.Generic.List<string>();
                var names = new System.Collections.Generic.List<string>();
                using (var cmd = new NpgsqlCommand("SELECT maks_agirlik_kg, maks_hacim_m3, bagli_oldugu_depo, km_maliyeti_tl, plaka, arac_kodu FROM arac_kartlari ORDER BY arac_kodu ASC", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        weightCaps.Add(reader.IsDBNull(0) ? 0 : Convert.ToInt64(reader.GetValue(0)));
                        volCaps.Add(reader.IsDBNull(1) ? 0 : Convert.ToInt64(reader.GetValue(1)));
                        string depoKodu = reader.IsDBNull(2) ? "" : Convert.ToString(reader.GetValue(2));
                        depots.Add((depoKodu == "DP002" || depoKodu == "1") ? 1 : 0);
                        kmCosts.Add(reader.IsDBNull(3) ? 0 : Convert.ToInt64(reader.GetValue(3)));
                        plates.Add(reader.IsDBNull(4) ? "" : Convert.ToString(reader.GetValue(4)));
                        names.Add(reader.IsDBNull(5) ? "" : Convert.ToString(reader.GetValue(5)));
                    }
                }

                data.VehicleNumber = weightCaps.Count;
                data.VehicleWeightCapacities = weightCaps.ToArray();
                data.VehicleVolumeCapacities = volCaps.ToArray();
                data.VehicleKmCosts = kmCosts.ToArray();
                data.VehiclePlates = plates.ToArray();
                data.VehicleNames = names.ToArray();

                data.Starts = depots.ToArray();
                data.Ends = depots.ToArray();

                // ==========================================
                // SÜRE VE DURAK KISITLARI
                // ==========================================
                data.VehicleMaxTimes = new long[data.VehicleNumber];
                data.VehicleMaxStops = new long[data.VehicleNumber];

                for (int i = 0; i < data.VehicleNumber; i++)
                {
                    data.VehicleMaxTimes[i] = 480;
                    data.VehicleMaxStops[i] = 50;
                }

                // 2. Nokta (Node) sayısını belirle ve Mesafe Matrisini (KM) çek
                int maxNode = -1;
                var distList = new System.Collections.Generic.List<(int k, int v, long m)>();
                using (var cmd = new NpgsqlCommand("SELECT kalkis_kodu, varis_kodu, mesafe_km FROM mesafe_matrisi", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        if (int.TryParse(Convert.ToString(reader.GetValue(0)), out int k) && int.TryParse(Convert.ToString(reader.GetValue(1)), out int v))
                        {
                            long m = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetValue(2));
                            distList.Add((k, v, m));
                            if (k > maxNode) maxNode = k;
                            if (v > maxNode) maxNode = v;
                        }
                    }
                }

                // Trafik Matrisini (Süre) çek
                var timeList = new System.Collections.Generic.List<(int k, int v, long ss, long so, long sa, int ky, int vy)>();
                using (var cmd = new NpgsqlCommand("SELECT kalkis_kodu, varis_kodu, sure_sabah_dk, sure_ogle_dk, sure_aksam_dk, kalkis_yaka, varis_yaka FROM trafik_matrisi", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        if (int.TryParse(Convert.ToString(reader.GetValue(0)), out int k) && int.TryParse(Convert.ToString(reader.GetValue(1)), out int v))
                        {
                            long ss = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetValue(2));
                            long so = reader.IsDBNull(3) ? 0 : Convert.ToInt64(reader.GetValue(3));
                            long sa = reader.IsDBNull(4) ? 0 : Convert.ToInt64(reader.GetValue(4));
                            int ky = reader.IsDBNull(5) ? 0 : Convert.ToInt32(reader.GetValue(5));
                            int vy = reader.IsDBNull(6) ? 0 : Convert.ToInt32(reader.GetValue(6));

                            timeList.Add((k, v, ss, so, sa, ky, vy));
                            if (k > maxNode) maxNode = k;
                            if (v > maxNode) maxNode = v;
                        }
                    }
                }

                int nodeCount = maxNode + 1;
                data.DistanceMatrix = new long[nodeCount, nodeCount];
                data.TimeMatrixSabah = new long[nodeCount, nodeCount];
                data.TimeMatrixOgle = new long[nodeCount, nodeCount];
                data.TimeMatrixAksam = new long[nodeCount, nodeCount];
                data.NodeRegions = new int[nodeCount];

                foreach (var d in distList)
                {
                    data.DistanceMatrix[d.k, d.v] = d.m;
                }

                foreach (var t in timeList)
                {
                    data.TimeMatrixSabah[t.k, t.v] = t.ss;
                    data.TimeMatrixOgle[t.k, t.v] = t.so;
                    data.TimeMatrixAksam[t.k, t.v] = t.sa;

                    data.NodeRegions[t.k] = t.ky;
                    data.NodeRegions[t.v] = t.vy;
                }

                // 3. Sipariş taleplerini çek (satis_siparisi)
                data.WeightDemands = new long[nodeCount];
                data.VolumeDemands = new long[nodeCount];

                // --- EKSİK OLAN VE EKLENEN İSİM DİZİSİ BAŞLATMA ---
                data.NodeNames = new string[nodeCount];
                data.NodeCodes = new string[nodeCount];
                data.NodeAddresses = new string[nodeCount];
                data.NodeNames[0] = "Merkez Depo";
                data.NodeNames[1] = "Şube Depo";
                data.NodeCodes[0] = "DP001";
                data.NodeCodes[1] = "DP002";
                data.NodeAddresses[0] = "Merkez Depo Adresi";
                data.NodeAddresses[1] = "Şube Depo Adresi";
                
                try 
                {
                    using (var cmd = new NpgsqlCommand("SELECT depo_kodu, depo_adi FROM depo ORDER BY depo_kodu ASC", conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        int dIdx = 0;
                        while (reader.Read())
                        {
                            string kod = Convert.ToString(reader.GetValue(0));
                            string adi = reader.IsDBNull(1) ? kod : Convert.ToString(reader.GetValue(1));
                            if (kod == "DP001" || dIdx == 0) { data.NodeNames[0] = adi; data.NodeCodes[0] = kod; }
                            else if (kod == "DP002" || dIdx == 1) { data.NodeNames[1] = adi; data.NodeCodes[1] = kod; }
                            dIdx++;
                        }
                    }
                } catch { } // Depo tablosu yoksa veya hatalıysa yoksay

                using (var cmd = new NpgsqlCommand("SELECT s.cari_kodu, s.matris_id, SUM(s.toplam_kg), SUM(s.toplam_hacim_m3), MAX(c.cari_adi), MAX(c.adres_metni) as adres_metni FROM satis_siparisi s LEFT JOIN cari_kart c ON s.cari_kodu = c.cari_kodu GROUP BY s.cari_kodu, s.matris_id", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string cariKodu = reader.IsDBNull(0) ? "" : Convert.ToString(reader.GetValue(0));

                        if (!reader.IsDBNull(1))
                        {
                            int nodeIndex = reader.GetInt32(1);

                            if (nodeIndex >= 2 && nodeIndex < nodeCount)
                            {
                                string unvan = reader.IsDBNull(4) ? "" : Convert.ToString(reader.GetValue(4));
                                string adres = reader.IsDBNull(5) ? "" : Convert.ToString(reader.GetValue(5));
                                data.NodeNames[nodeIndex] = string.IsNullOrWhiteSpace(unvan) ? cariKodu : unvan;
                                data.NodeCodes[nodeIndex] = cariKodu;
                                data.NodeAddresses[nodeIndex] = string.IsNullOrWhiteSpace(adres) ? "Adres Yok" : adres;
                                data.WeightDemands[nodeIndex] = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetValue(2));
                                data.VolumeDemands[nodeIndex] = reader.IsDBNull(3) ? 0 : Convert.ToInt64(reader.GetValue(3));
                            }
                        }
                    }
                }

                // 4. Zaman Pencerelerini (VRPTW) çek (cari_kart)
                data.TimeWindows = new long[nodeCount, 2];
                for (int i = 0; i < nodeCount; i++)
                {
                    data.TimeWindows[i, 0] = 480;
                    data.TimeWindows[i, 1] = 1080;
                }

                using (var cmd = new NpgsqlCommand("SELECT cari_kodu, matris_id, mal_kabul_baslangic, mal_kabul_bitis FROM cari_kart", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        if (!reader.IsDBNull(1))
                        {
                            int nodeIndex = reader.GetInt32(1);

                            if (nodeIndex >= 2 && nodeIndex < nodeCount)
                            {
                                string startStr = reader.IsDBNull(2) ? "" : Convert.ToString(reader.GetValue(2));
                                string endStr = reader.IsDBNull(3) ? "" : Convert.ToString(reader.GetValue(3));

                                if (TimeSpan.TryParse(startStr, out TimeSpan startTs))
                                    data.TimeWindows[nodeIndex, 0] = (long)startTs.TotalMinutes;

                                if (TimeSpan.TryParse(endStr, out TimeSpan endTs))
                                    data.TimeWindows[nodeIndex, 1] = (long)endTs.TotalMinutes;
                            }
                        }
                    }
                }

                // 5. MATRİSLERİ FİLTRELEME VE KÜÇÜLTME AŞAMASI
                var activeNodes = new System.Collections.Generic.List<int>();

                int totalNodes = data.DistanceMatrix.GetLength(0);
                for (int i = 0; i < totalNodes; i++)
                {
                    if (i == 0 || i == 1 || data.WeightDemands[i] > 0 || data.VolumeDemands[i] > 0)
                    {
                        activeNodes.Add(i);
                    }
                }

                int newCount = activeNodes.Count;
                var filteredData = new VrpDataModel();

                filteredData.VehicleNumber = data.VehicleNumber;
                filteredData.VehicleWeightCapacities = data.VehicleWeightCapacities;
                filteredData.VehicleVolumeCapacities = data.VehicleVolumeCapacities;
                filteredData.VehicleKmCosts = data.VehicleKmCosts;
                filteredData.VehicleMaxTimes = data.VehicleMaxTimes;
                filteredData.VehicleMaxStops = data.VehicleMaxStops;
                filteredData.VehicleAllowedRegions = data.VehicleAllowedRegions;
                filteredData.VehiclePlates = data.VehiclePlates;
                filteredData.VehicleNames = data.VehicleNames;

                filteredData.Starts = new int[data.VehicleNumber];
                filteredData.Ends = new int[data.VehicleNumber];
                for (int v = 0; v < data.VehicleNumber; v++)
                {
                    int oldStartNode = data.Starts[v];

                    if (oldStartNode >= data.WeightDemands.Length)
                    {
                        oldStartNode = 0;
                    }

                    int newStartNode = activeNodes.IndexOf(oldStartNode);
                    if (newStartNode == -1) newStartNode = 0;

                    filteredData.Starts[v] = newStartNode;
                    filteredData.Ends[v] = newStartNode;
                }

                filteredData.DistanceMatrix = new long[newCount, newCount];
                filteredData.TimeMatrixSabah = new long[newCount, newCount];
                filteredData.TimeMatrixOgle = new long[newCount, newCount];
                filteredData.TimeMatrixAksam = new long[newCount, newCount];
                filteredData.TimeWindows = new long[newCount, 2];

                filteredData.WeightDemands = new long[newCount];
                filteredData.VolumeDemands = new long[newCount];
                filteredData.NodeRegions = new int[newCount];
                filteredData.OriginalNodeIds = new int[newCount];

                filteredData.NodeNames = new string[newCount];
                filteredData.NodeCodes = new string[newCount];
                filteredData.NodeAddresses = new string[newCount];

                for (int i = 0; i < newCount; i++)
                {
                    int old_i = activeNodes[i];
                    filteredData.OriginalNodeIds[i] = old_i;
                    filteredData.WeightDemands[i] = data.WeightDemands[old_i];
                    filteredData.VolumeDemands[i] = data.VolumeDemands[old_i];
                    filteredData.NodeRegions[i] = data.NodeRegions[old_i];

                    filteredData.NodeNames[i] = data.NodeNames != null && old_i < data.NodeNames.Length
                                                ? data.NodeNames[old_i]
                                                : $"Düğüm {old_i}";
                                                
                    filteredData.NodeCodes[i] = data.NodeCodes != null && old_i < data.NodeCodes.Length
                                                ? data.NodeCodes[old_i]
                                                : $"CAR{old_i:000}";

                    filteredData.NodeAddresses[i] = data.NodeAddresses != null && old_i < data.NodeAddresses.Length
                                                ? data.NodeAddresses[old_i]
                                                : "Adres Yok";

                    filteredData.TimeWindows[i, 0] = data.TimeWindows[old_i, 0];
                    filteredData.TimeWindows[i, 1] = data.TimeWindows[old_i, 1];

                    for (int j = 0; j < newCount; j++)
                    {
                        int old_j = activeNodes[j];
                        filteredData.DistanceMatrix[i, j] = data.DistanceMatrix[old_i, old_j];
                        filteredData.TimeMatrixSabah[i, j] = data.TimeMatrixSabah[old_i, old_j];
                        filteredData.TimeMatrixOgle[i, j] = data.TimeMatrixOgle[old_i, old_j];
                        filteredData.TimeMatrixAksam[i, j] = data.TimeMatrixAksam[old_i, old_j];
                    }
                }
                return filteredData;
            }
        }
        // 1. Arayüzden gelen veriyi PostgreSQL'e kaydeder (Hem İrsaliye Hem Fatura)
        public void FaturaKesVeKaydet(string irsaliyeNo, string cariAdi, string plaka, string depo, int kalemSayisi)
        {
            using (var conn = GetConnection())
            {
                conn.Open();
                
                // İki tabloya birden kayıt atacağımız için Transaction başlatıyoruz
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // --- ADIM 1: İRSALİYE TABLOSUNA KAYIT ---
                        string insertIrsaliyeQuery = @"
                            INSERT INTO irsaliye (irsaliye_no, depo_adi, plaka, teslimat_durumu) 
                            VALUES (@i1, @i2, @i3, 'Planlandı')";

                        using (var cmdIrsaliye = new NpgsqlCommand(insertIrsaliyeQuery, conn, transaction))
                        {
                            cmdIrsaliye.Parameters.AddWithValue("i1", irsaliyeNo);
                            cmdIrsaliye.Parameters.AddWithValue("i2", string.IsNullOrEmpty(depo) ? "Merkez Depo" : depo);
                            cmdIrsaliye.Parameters.AddWithValue("i3", string.IsNullOrEmpty(plaka) ? "" : plaka);
                            
                            cmdIrsaliye.ExecuteNonQuery();
                        }

                        // --- ADIM 2: FATURA TABLOSUNA KAYIT ---
                        // Otomatik bir fatura numarası ve temsili bir tutar oluşturuyoruz
                        string faturaNo = "FTR-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                        decimal rastgeleTutar = kalemSayisi > 0 ? kalemSayisi * 1500.50m : 2500.00m; 

                        string insertFaturaQuery = @"
                            INSERT INTO fatura (fatura_no, irsaliye_no, cari_kodu, cari_adi, tutar, odeme) 
                            VALUES (@f1, @f2, @f3, @f4, @f5, @f6)";

                        using (var cmdFatura = new NpgsqlCommand(insertFaturaQuery, conn, transaction))
                        {
                            cmdFatura.Parameters.AddWithValue("f1", faturaNo);
                            cmdFatura.Parameters.AddWithValue("f2", irsaliyeNo);
                            cmdFatura.Parameters.AddWithValue("f3", "C-1001"); // Varsayılan cari kodu
                            cmdFatura.Parameters.AddWithValue("f4", string.IsNullOrEmpty(cariAdi) ? "Genel Müşteri" : cariAdi);
                            cmdFatura.Parameters.AddWithValue("f5", rastgeleTutar);
                            cmdFatura.Parameters.AddWithValue("f6", "Banka Transferi"); // Varsayılan ödeme yöntemi
                            
                            cmdFatura.ExecuteNonQuery();
                        }

                        // Hata yoksa işlemi onayla ve veritabanına yaz
                        transaction.Commit();
                    }
                    catch (System.Exception)
                    {
                        // Bir hata olursa tüm işlemleri geri al (Rollback)
                        transaction.Rollback();
                        throw; 
                    }
                }
            }
        }
public System.Collections.Generic.List<Models.FaturaIrsaliyeGorunum> GetFaturaVeIrsaliyeler()
        {
            var liste = new System.Collections.Generic.List<Models.FaturaIrsaliyeGorunum>();

            try 
            {
                using (var conn = GetConnection())
                {
                    conn.Open();

                    string query = @"
                SELECT 
                    f.fatura_no, 
                    i.irsaliye_no, 
                    COALESCE(f.cari_adi, c.cari_adi, 'Genel Müşteri') AS cari_adi, 
                    i.depo_adi, 
                    i.plaka, 
                    
                    COALESCE(
                        (
                            SELECT SUM(ABS(t_sum.gercek_miktar::numeric) * COALESCE((SELECT fiyat::numeric FROM fiyat_listesi WHERE stok = t_sum.stok AND liste = 'FL001' LIMIT 1), 0)) * 1.20
                            FROM (
                                SELECT stok, MAX(miktar) as gercek_miktar
                                FROM stok_hareketleri
                                WHERE siparis = i.siparis
                                GROUP BY stok
                            ) t_sum
                        ), 0
                    ) AS tutar,
                    
                    f.odeme, 
                    COALESCE(i.teslimat_durumu, 'Planlandı') AS durum,
                    (
                        SELECT COALESCE(json_agg(
                            json_build_object(
                                'code', t.stok,
                                'name', COALESCE((SELECT urun FROM stok_karti WHERE stok_kodu = t.stok LIMIT 1), t.stok),
                                'qty', ABS(t.gercek_miktar::numeric),                 
                                'unit', COALESCE((SELECT birim FROM stok_karti WHERE stok_kodu = t.stok LIMIT 1), 'Adet'),                       
                                'price', COALESCE((SELECT fiyat::numeric FROM fiyat_listesi WHERE stok = t.stok AND liste = 'FL001' LIMIT 1), 0)
                            )
                        )::text, '[]')
                        FROM (
                            SELECT stok, MAX(miktar) as gercek_miktar
                            FROM stok_hareketleri
                            WHERE siparis = i.siparis
                            GROUP BY stok
                        ) t
                    ) AS kalemler_json
                FROM irsaliye i
                LEFT JOIN fatura f ON i.irsaliye_no = f.irsaliye_no
                LEFT JOIN satis_siparisi s ON i.siparis = s.siparis_no
                LEFT JOIN cari_kart c ON s.cari_kodu = c.cari_kodu";

                    using (var cmd = new NpgsqlCommand(query, conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            liste.Add(new Models.FaturaIrsaliyeGorunum
                            {
                                FaturaNo = reader.IsDBNull(0) ? "FTR-BEKLEYEN" : reader.GetString(0),
                                IrsaliyeNo = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                CariAdi = reader.IsDBNull(2) ? "Genel Müşteri" : reader.GetString(2),
                                CikisDeposu = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                AracPlaka = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                Tutar = reader.IsDBNull(5) ? 0 : reader.GetDecimal(5),
                                OdemeTuru = reader.IsDBNull(6) ? "-" : reader.GetString(6),
                                Durum = reader.IsDBNull(7) ? "Belirsiz" : reader.GetString(7),
                                KalemlerJson = reader.IsDBNull(8) ? "[]" : reader.GetString(8) 
                            });
                        }
                    }
                }
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine("\n=== [ UYARI: VERİTABANI HATASI YAKALANDI ] ===");
                System.Console.WriteLine(ex.Message);
                System.Console.WriteLine("==============================================\n");
            }
            
            return liste;
        }

        // Rota optimizasyonu bittikten sonra tüm araçların duraklarını irsaliye tablosuna kaydeder
        public void SaveOptimizationWaybills(VrpOptimizer.OptimizationResult optimizationResult)
        {
            using (var conn = GetConnection())
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        string insertQuery = @"
                    INSERT INTO irsaliye (
                        irsaliye_no, siparis, depo_kodu, depo_adi, arac_kodu, 
                        plaka, toplam_kg, toplam_hacim_m3, kapasite_durumu, teslimat_durumu
                    )
                    VALUES (@i1, @i2, @i3, @i4, @i5, @i6, @i7, @i8, @i9, @i10)
                    ON CONFLICT (irsaliye_no) DO UPDATE SET 
                        siparis = EXCLUDED.siparis,
                        toplam_kg = EXCLUDED.toplam_kg,
                        toplam_hacim_m3 = EXCLUDED.toplam_hacim_m3,
                        kapasite_durumu = EXCLUDED.kapasite_durumu;";

                        foreach (var driver in optimizationResult.drivers)
                        {
                            if (driver.stops == null || driver.stops.Count == 0) continue;

                            foreach (var stop in driver.stops)
                            {
                                // 1. ADIM: Bu müşteri (cariKod) için veritabanındaki GERÇEK siparis_no'yu buluyoruz
                                string gercekSiparisNo = null;
                                string getOrderQuery = "SELECT siparis_no FROM satis_siparisi WHERE cari_kodu = @cari LIMIT 1";

                                using (var cmdOrder = new NpgsqlCommand(getOrderQuery, conn, transaction))
                                {
                                    cmdOrder.Parameters.AddWithValue("cari", (object)stop.cariKod ?? DBNull.Value);
                                    var res = cmdOrder.ExecuteScalar();
                                    if (res != null) gercekSiparisNo = res.ToString();
                                }

                                // Eğer o cariye ait sipariş bulunamazsa, yabancı anahtar hatası vermemesi için boş geçebiliriz veya atlayabiliriz
                                if (string.IsNullOrEmpty(gercekSiparisNo)) continue;

                                string uniqueSuffix = Guid.NewGuid().ToString().Substring(0, 5).ToUpper();
                                string cleanPlate = (driver.plate ?? "34VHC").Replace(" ", "");
                                string irsaliyeNo = $"IRS-{cleanPlate}-{uniqueSuffix}";

                                string depoAdi = driver.depotName ?? "Merkez Depo";
                                string depoKodu = depoAdi.Contains("Üsküdar") ? "DP002" : "DP001";
                                string kapasiteDurumu = driver.capacityMaxKg > 0
                                    ? $"%{Math.Round((double)driver.capacityUsedKg / driver.capacityMaxKg * 100)}"
                                    : "%0";

                                using (var cmd = new NpgsqlCommand(insertQuery, conn, transaction))
                                {
                                    cmd.Parameters.AddWithValue("i1", irsaliyeNo);
                                    cmd.Parameters.AddWithValue("i2", gercekSiparisNo); // Artık veritabanındaki gerçek sipariş numarası!
                                    cmd.Parameters.AddWithValue("i3", depoKodu);
                                    cmd.Parameters.AddWithValue("i4", depoAdi);
                                    cmd.Parameters.AddWithValue("i5", driver.id);
                                    cmd.Parameters.AddWithValue("i6", driver.plate);
                                    cmd.Parameters.AddWithValue("i7", (decimal)stop.weightKg);
                                    cmd.Parameters.AddWithValue("i8", (decimal)stop.volumeM3);
                                    cmd.Parameters.AddWithValue("i9", kapasiteDurumu);
                                    cmd.Parameters.AddWithValue("i10", "Planlandı");

                                    cmd.ExecuteNonQuery();
                                }
                            }
                        }

                        transaction.Commit();
                        Console.WriteLine("[INFO] Tüm irsaliyeler veritabanına başarıyla kaydedildi.");
                    }
                    catch (System.Exception ex)
                    {
                        transaction.Rollback();
                        Console.WriteLine($"[SQL HATA DETAYI]: {ex.Message}");
                        throw;
                    }
                }
            }
        }
    }
}