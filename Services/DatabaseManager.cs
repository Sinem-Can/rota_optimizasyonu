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

                // 1. Araç kapasitelerini çek (arac_kartlari)
                var weightCaps = new System.Collections.Generic.List<long>();
                var volCaps = new System.Collections.Generic.List<long>();
                using (var cmd = new NpgsqlCommand("SELECT maks_agirlik_kg, maks_hacim_m3 FROM arac_kartlari", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        weightCaps.Add(reader.IsDBNull(0) ? 0 : Convert.ToInt64(reader.GetDecimal(0)));
                        volCaps.Add(reader.IsDBNull(1) ? 0 : Convert.ToInt64(reader.GetDecimal(1)));
                    }
                }
                
                data.VehicleNumber = weightCaps.Count;
                data.VehicleWeightCapacities = weightCaps.ToArray();
                data.VehicleVolumeCapacities = volCaps.ToArray();
                
                data.Starts = new int[data.VehicleNumber];
                data.Ends = new int[data.VehicleNumber];

                data.VehicleNumber = weightCaps.Count;
                data.VehicleWeightCapacities = weightCaps.ToArray();
                data.VehicleVolumeCapacities = volCaps.ToArray();
                
                data.Starts = new int[data.VehicleNumber];
                data.Ends = new int[data.VehicleNumber];

                // ==========================================
                // YENİ EKLENEN KISIM: SÜRE VE DURAK KISITLARI
                // ==========================================
                data.VehicleMaxTimes = new long[data.VehicleNumber];
                data.VehicleMaxStops = new long[data.VehicleNumber];

                for (int i = 0; i < data.VehicleNumber; i++)
                {
                    // Şimdilik veritabanında olmadığı için manuel varsayılan değerler veriyoruz:
                    data.VehicleMaxTimes[i] = 480; // Örnek: Her araç için maks 480 dakika (8 saat)
                    data.VehicleMaxStops[i] = 50;  // Örnek: Her araç için maks 50 durak
                }
                // ==========================================

                // 2. Nokta (Node) sayısını belirle ve Mesafe Matrisini çek
                int maxNode = -1;
                var distances = new System.Collections.Generic.List<(int k, int v, long m)>();
                using (var cmd = new NpgsqlCommand("SELECT kalkis_kodu, varis_kodu, mesafe_km FROM mesafe_matrisi", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        if (int.TryParse(reader.GetString(0), out int k) && int.TryParse(reader.GetString(1), out int v))
                        {
                            long m = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetDecimal(2));
                            distances.Add((k, v, m));
                            if (k > maxNode) maxNode = k;
                            if (v > maxNode) maxNode = v;
                        }
                    }
                }

                int nodeCount = maxNode + 1;
                data.TimeMatrix = new long[nodeCount, nodeCount];
                foreach (var d in distances)
                {
                    data.TimeMatrix[d.k, d.v] = d.m;
                }

                // 3. Sipariş taleplerini çek (satis_siparisi)
                data.WeightDemands = new long[nodeCount];
                data.VolumeDemands = new long[nodeCount];
                
                using (var cmd = new NpgsqlCommand("SELECT cari_kodu, SUM(toplam_kg), SUM(toplam_hacim_m3) FROM satis_siparisi GROUP BY cari_kodu", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string cari = reader.IsDBNull(0) ? "" : reader.GetString(0);
                        if (!string.IsNullOrEmpty(cari) && cari.StartsWith("CAR") && int.TryParse(cari.Substring(3), out int cariNum))
                        {
                            int nodeIndex = cariNum; // DÜZELTME: CAR001 -> Düğüm 1 (0 Depodur)
                            if (nodeIndex >= 0 && nodeIndex < nodeCount)
                            {
                                data.WeightDemands[nodeIndex] = reader.IsDBNull(1) ? 0 : Convert.ToInt64(reader.GetDecimal(1)); 
                                data.VolumeDemands[nodeIndex] = reader.IsDBNull(2) ? 0 : Convert.ToInt64(reader.GetDecimal(2));
                            }
                        }
                    }
                }
            }

            return data;
        }
    }
}