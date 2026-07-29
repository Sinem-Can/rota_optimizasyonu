#nullable disable
using System;
using System.Data;
using System.IO;
using Npgsql;
using ExcelDataReader;

namespace Uyumsoft.RouteOptimizer
{
    public class ExcelProcessor
    {
        private readonly DatabaseManager _dbManager;

        public ExcelProcessor(DatabaseManager dbManager)
        {
            _dbManager = dbManager;
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
        }

        public void TransferDistanceMatrix(string filePath)
        {
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"❌ ERROR: Distance Matrix file not found at {filePath}");
                return;
            }

            Console.WriteLine("🚚 Transferring Distance Matrix...");
            using (var conn = _dbManager.GetConnection())
            {
                conn.Open();
                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    var result = reader.AsDataSet(new ExcelDataSetConfiguration() { ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true } });
                    DataTable table = result.Tables[0];

                    using (var transaction = conn.BeginTransaction())
                    {
                        foreach (DataRow row in table.Rows)
                        {
                            string kalkisKodu = row["FirmID"]?.ToString() ?? "";
                            for (int i = 2; i < table.Columns.Count; i++)
                            {
                                string varisKodu = (i - 2).ToString();
                                string mesafeStr = row[i]?.ToString();

                                if (!string.IsNullOrEmpty(mesafeStr) && decimal.TryParse(mesafeStr, out decimal mesafe))
                                {
                                    string sql = "INSERT INTO mesafe_matrisi (kalkis_kodu, varis_kodu, mesafe_km) VALUES (@k, @v, @m) ON CONFLICT DO NOTHING";
                                    using (var cmd = new NpgsqlCommand(sql, conn))
                                    {
                                        cmd.Parameters.AddWithValue("k", kalkisKodu);
                                        cmd.Parameters.AddWithValue("v", varisKodu);
                                        cmd.Parameters.AddWithValue("m", mesafe);
                                        cmd.ExecuteNonQuery();
                                    }
                                }
                            }
                        }
                        transaction.Commit();
                    }
                }
            }
            Console.WriteLine("✅ Distance matrix completed.\n");
        }

        public void TransferErpData(string filePath)
        {
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"❌ ERROR: ERP Data file not found at {filePath}");
                return;
            }

            using (var conn = _dbManager.GetConnection())
            {
                conn.Open();
                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    var result = reader.AsDataSet(new ExcelDataSetConfiguration() { ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true } });

                    string[] sheetOrder = {
                        "Depo", "Stok Kartı", "Cari Kart", "Banka", "Kasa", "Çek Defteri", "Fiyat Listesi Kod",
                        "Arac Kartlari", "İşyeri Stok", "Fiyat Listesi", "Satış Teklifi", "Satış Siparişi",
                        "Stok Hareketleri", "İrsaliye", "Fatura", "Sevkiyat_Plani"
                    };

                    foreach (string sheet in sheetOrder)
                    {
                        DataTable table = result.Tables[sheet];
                        if (table == null) continue;

                        Console.WriteLine($"⏳ Transferring '{sheet}' sheet...");

                        foreach (DataRow row in table.Rows)
                        {
                            if (row[0] == DBNull.Value && sheet != "Cari Kart") continue;

                            try
                            {
                                NpgsqlCommand cmd = new NpgsqlCommand("", conn);
                                string val(int index) => (row.Table.Columns.Count > index && row[index] != DBNull.Value && row[index] != null) ? row[index].ToString().Trim() : "";

                                switch (sheet)
                                {
                                    case "Depo":
                                        cmd.CommandText = "INSERT INTO depo (depo_kodu, depo_adi) VALUES (@p1, @p2) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        break;

                                    case "Stok Kartı":
                                        cmd.CommandText = "INSERT INTO stok_karti (stok_kodu, urun, birim, birim_agirlik_kg, birim_hacim_m3) VALUES (@p1, @p2, @p3, @p4, @p5) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", row[3] != DBNull.Value ? Convert.ToDecimal(row[3]) : 0m);
                                        cmd.Parameters.AddWithValue("p5", row[4] != DBNull.Value ? Convert.ToDecimal(row[4]) : 0m);
                                        break;

                                    case "Cari Kart":
                                        cmd.CommandText = "INSERT INTO cari_kart (cari_kodu, cari_adi, tip, mal_kabul_baslangic, mal_kabul_bitis) VALUES (@p1, @p2, @p3, @p4, @p5) ON CONFLICT DO NOTHING";
                                        string cariKod = row[0] != DBNull.Value ? val(0) : val(1);
                                        if (string.IsNullOrEmpty(cariKod)) break;
                                        cmd.Parameters.AddWithValue("p1", cariKod);
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", val(4));
                                        break;

                                    case "Banka":
                                        cmd.CommandText = "INSERT INTO banka (kod, banka) VALUES (@p1, @p2) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        break;

                                    case "Kasa":
                                        cmd.CommandText = "INSERT INTO kasa (kod, kasa) VALUES (@p1, @p2) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        break;

                                    case "Çek Defteri":
                                        cmd.CommandText = "INSERT INTO cek_defteri (cek_no, durum) VALUES (@p1, @p2) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        break;

                                    case "Fiyat Listesi Kod":
                                        cmd.CommandText = "INSERT INTO fiyat_listesi_kod (kod, aciklama) VALUES (@p1, @p2) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        break;

                                    case "Arac Kartlari":
                                        cmd.CommandText = "INSERT INTO arac_kartlari (arac_kodu, plaka, marka_model, kasa_tipi, maks_agirlik_kg, maks_hacim_m3, km_maliyeti_tl, maks_mesai_suresi_dk, maks_durak_sayisi, kopru_gecis_izni) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", row[4] != DBNull.Value ? Convert.ToDecimal(row[4]) : 0m);
                                        cmd.Parameters.AddWithValue("p6", row[5] != DBNull.Value ? Convert.ToDecimal(row[5]) : 0m);
                                        cmd.Parameters.AddWithValue("p7", row[6] != DBNull.Value ? Convert.ToDecimal(row[6]) : 0m);
                                        cmd.Parameters.AddWithValue("p8", row[7] != DBNull.Value ? Convert.ToInt32(row[7]) : 0);
                                        cmd.Parameters.AddWithValue("p9", row[8] != DBNull.Value ? Convert.ToInt32(row[8]) : 0);
                                        cmd.Parameters.AddWithValue("p10", val(9));
                                        break;

                                    case "İşyeri Stok":
                                        cmd.CommandText = "INSERT INTO isyeri_stok (depo_kodu, depo_adi, stok, miktar) VALUES (@p1, @p2, @p3, @p4) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", row[3] != DBNull.Value ? Convert.ToInt32(row[3]) : 0);
                                        break;

                                    case "Fiyat Listesi":
                                        cmd.CommandText = "INSERT INTO fiyat_listesi (stok, liste, fiyat) VALUES (@p1, @p2, @p3) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", row[2] != DBNull.Value ? Convert.ToDecimal(row[2]) : 0m);
                                        break;

                                    case "Satış Teklifi":
                                        cmd.CommandText = "INSERT INTO satis_teklifi (teklif_no, cari_kodu, cari_adi) VALUES (@p1, @p2, @p3) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        break;

                                    case "Satış Siparişi":
                                        cmd.CommandText = "INSERT INTO satis_siparisi (siparis_no, teklif, cari_kodu, cari_adi, arac_kodu, plaka, toplam_kg, toplam_hacim_m3, kapasite_durumu, siparis_durumu, teslimat_pencere_baslangic, teslimat_penceresi_bitis) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", val(4));
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        cmd.Parameters.AddWithValue("p7", row[6] != DBNull.Value ? Convert.ToDecimal(row[6]) : 0m);
                                        cmd.Parameters.AddWithValue("p8", row[7] != DBNull.Value ? Convert.ToDecimal(row[7]) : 0m);
                                        cmd.Parameters.AddWithValue("p9", val(8));
                                        cmd.Parameters.AddWithValue("p10", val(9));
                                        cmd.Parameters.AddWithValue("p11", val(10));
                                        cmd.Parameters.AddWithValue("p12", val(11));
                                        break;

                                    case "Stok Hareketleri":
                                        cmd.CommandText = "INSERT INTO stok_hareketleri (siparis, stok, miktar) VALUES (@p1, @p2, @p3) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", row[2] != DBNull.Value ? Convert.ToInt32(row[2]) : 0);
                                        break;

                                    case "İrsaliye":
                                        cmd.CommandText = "INSERT INTO irsaliye (irsaliye_no, siparis, depo_kodu, depo_adi, arac_kodu, plaka, toplam_kg, toplam_hacim_m3, kapasite_durumu, teslimat_durumu, aciklama_iade_nedeni) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", val(4));
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        cmd.Parameters.AddWithValue("p7", row[6] != DBNull.Value ? Convert.ToDecimal(row[6]) : 0m);
                                        cmd.Parameters.AddWithValue("p8", row[7] != DBNull.Value ? Convert.ToDecimal(row[7]) : 0m);
                                        cmd.Parameters.AddWithValue("p9", val(8));
                                        cmd.Parameters.AddWithValue("p10", val(9));
                                        cmd.Parameters.AddWithValue("p11", val(10));
                                        break;

                                    case "Fatura":
                                        cmd.CommandText = "INSERT INTO fatura (fatura_no, irsaliye_no, cari_kodu, cari_adi, tutar, odeme) VALUES (@p1, @p2, @p3, @p4, @p5, @p6) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", row[4] != DBNull.Value ? Convert.ToDecimal(row[4]) : 0m);
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        break;

                                    case "Sevkiyat_Plani":
                                        cmd.CommandText = "INSERT INTO sevkiyat_plani (sevkiyat_no, arac_kodu, plaka, toplam_kg, toplam_hacim_m3, sevkiyat_durumu) VALUES (@p1, @p2, @p3, @p4, @p5, @p6) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", row[3] != DBNull.Value ? Convert.ToDecimal(row[3]) : 0m);
                                        cmd.Parameters.AddWithValue("p5", row[4] != DBNull.Value ? Convert.ToDecimal(row[4]) : 0m);
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        break;
                                }

                                if (!string.IsNullOrEmpty(cmd.CommandText))
                                {
                                    cmd.ExecuteNonQuery();
                                }
                                cmd.Dispose();
                            }
                            catch (Exception)
                            {
                                Console.WriteLine($"⚠️ [Row Skipped - {sheet}]: Missing Data Reference (e.g., Foreign Key not found in DB)");
                            }
                        }
                        Console.WriteLine($"✅ '{sheet}' transferred.");
                    }
                }
            }
        }
    }
}