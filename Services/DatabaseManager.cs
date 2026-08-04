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
                using (var cmd = new NpgsqlCommand("SELECT maks_agirlik_kg, maks_hacim_m3, bagli_oldugu_depo, km_maliyeti_tl FROM arac_kartlari", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        weightCaps.Add(reader.IsDBNull(0) ? 0 : Convert.ToInt64(reader.GetDecimal(0)));
                        volCaps.Add(reader.IsDBNull(1) ? 0 : Convert.ToInt64(reader.GetDecimal(1)));
                        depots.Add(reader.IsDBNull(2) ? 0 : reader.GetInt32(2));
                        kmCosts.Add(reader.IsDBNull(3) ? 0 : Convert.ToInt64(reader.GetDecimal(3)));
                    }
                }
                
                data.VehicleNumber = weightCaps.Count;
                data.VehicleWeightCapacities = weightCaps.ToArray();
                data.VehicleVolumeCapacities = volCaps.ToArray();
                data.VehicleKmCosts = kmCosts.ToArray();
                
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
                        if (int.TryParse(reader.GetString(0), out int k) && int.TryParse(reader.GetString(1), out int v))
                        {
                            long m = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetDecimal(2));
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
                        if (int.TryParse(reader.GetString(0), out int k) && int.TryParse(reader.GetString(1), out int v))
                        {
                            long ss = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetDecimal(2));
                            long so = reader.IsDBNull(3) ? 0 : Convert.ToInt64(reader.GetDecimal(3));
                            long sa = reader.IsDBNull(4) ? 0 : Convert.ToInt64(reader.GetDecimal(4));
                            int ky = reader.IsDBNull(5) ? 0 : reader.GetInt32(5);
                            int vy = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);

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
                data.NodeNames[0] = "Merkez Depo";
                data.NodeNames[1] = "Şube Depo";
                // --------------------------------------------------

                using (var cmd = new NpgsqlCommand("SELECT cari_kodu, matris_id, SUM(toplam_kg), SUM(toplam_hacim_m3) FROM satis_siparisi GROUP BY cari_kodu, matris_id", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string cariKodu = reader.IsDBNull(0) ? "" : reader.GetString(0);
                        
                        if (!reader.IsDBNull(1))
                        {
                            int nodeIndex = reader.GetInt32(1); 
                            
                            if (nodeIndex >= 2 && nodeIndex < nodeCount)
                            {
                                data.NodeNames[nodeIndex] = cariKodu; 
                                data.WeightDemands[nodeIndex] = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetDecimal(2)); 
                                data.VolumeDemands[nodeIndex] = reader.IsDBNull(3) ? 0 : Convert.ToInt64(reader.GetDecimal(3));
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
                                string startStr = reader.IsDBNull(2) ? "" : reader.GetString(2);
                                string endStr = reader.IsDBNull(3) ? "" : reader.GetString(3);

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
    }
}