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

        private Dictionary<string, int> _nameToIdMapping = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

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

            Console.WriteLine("🚚 Transferring Distance Matrix (KM)...");
            using (var conn = _dbManager.GetConnection())
            {
                conn.Open();
                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    var result = reader.AsDataSet(new ExcelDataSetConfiguration() { ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true } });

                    DataTable table = result.Tables[0];
                    if (result.Tables.Contains("Mesafe Matrisi")) table = result.Tables["Mesafe Matrisi"];

                    // Mevcut tabloyu temizle
                    using (var delCmd = new NpgsqlCommand("TRUNCATE TABLE mesafe_matrisi", conn)) delCmd.ExecuteNonQuery();

                    using (var transaction = conn.BeginTransaction())
                    {
                        foreach (DataRow row in table.Rows)
                        {
                            string kalkisKodu = row["FirmID"]?.ToString() ?? "";
                            string kalkisAdi = row["FirmName"]?.ToString().Trim() ?? ""; // İsim burada!

                            // Sözlüğe ekle: İsim -> ID
                            if (int.TryParse(kalkisKodu, out int id))
                            {
                                _nameToIdMapping[kalkisAdi] = id;
                            }

                            for (int i = 2; i < table.Columns.Count; i++)
                            {
                                string colName = table.Columns[i].ColumnName;
                                string varisKodu = (i - 2).ToString();
                                string mesafeStr = row[i]?.ToString().Replace(',', '.');

                                if (!string.IsNullOrEmpty(mesafeStr) && decimal.TryParse(mesafeStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal mesafe))
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
            Console.WriteLine("✅ Distance matrix (KM) completed.\n");
        }

        public void TransferTrafficMatrix(string filePath)
        {
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"❌ ERROR: Traffic Matrix file not found at {filePath}");
                return;
            }

            Console.WriteLine("🚚 Transferring Traffic Matrix (15-min blocks)...");
            using (var conn = _dbManager.GetConnection())
            {
                conn.Open();
                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    var result = reader.AsDataSet(new ExcelDataSetConfiguration() { ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true } });

                    DataTable table = result.Tables[0];
                    if (result.Tables.Contains("Mesafe Matrisi")) table = result.Tables["Mesafe Matrisi"];

                    using (var delCmd = new NpgsqlCommand("TRUNCATE TABLE trafik_matrisi", conn)) delCmd.ExecuteNonQuery();

                    using (var transaction = conn.BeginTransaction())
                    {
                        foreach (DataRow row in table.Rows)
                        {
                            if (row[0] == DBNull.Value) continue;

                            string kalkisKodu = row[0]?.ToString() ?? "";
                            string kalkisAd = row.Table.Columns.Count > 1 ? row[1]?.ToString() ?? "" : "";
                            string varisKodu = row.Table.Columns.Count > 2 ? row[2]?.ToString() ?? "" : "";
                            string varisAd = row.Table.Columns.Count > 3 ? row[3]?.ToString() ?? "" : "";

                            int kalkisYaka = kalkisAd.Contains("(Avrupa)") ? 1 : (kalkisAd.Contains("(Anadolu)") ? 2 : 0);
                            int varisYaka = varisAd.Contains("(Avrupa)") ? 1 : (varisAd.Contains("(Anadolu)") ? 2 : 0);

                            decimal sabahToplam = 0, ogleToplam = 0, aksamToplam = 0;
                            int sabahSay = 0, ogleSay = 0, aksamSay = 0;

                            for (int i = 5; i < table.Columns.Count; i++)
                            {
                                string colName = table.Columns[i].ColumnName;
                                if (colName.StartsWith("Sure_") && row[i] != DBNull.Value)
                                {
                                    // GÜVENLİ PARSE YÖNTEMİ
                                    string valStr = row[i]?.ToString()?.Replace(',', '.');
                                    if (decimal.TryParse(valStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal val))
                                    {
                                        string[] parts = colName.Split('_');
                                        if (parts.Length > 1 && int.TryParse(parts[1], out int timeVal))
                                        {
                                            if (timeVal < 1000) { sabahToplam += val; sabahSay++; }
                                            else if (timeVal < 1600) { ogleToplam += val; ogleSay++; }
                                            else { aksamToplam += val; aksamSay++; }
                                        }
                                    }
                                }
                            }

                            decimal sureSabah = sabahSay > 0 ? sabahToplam / sabahSay : 0;
                            decimal sureOgle = ogleSay > 0 ? ogleToplam / ogleSay : sureSabah;
                            decimal sureAksam = aksamSay > 0 ? aksamToplam / aksamSay : sureOgle;

                            string sql = "INSERT INTO trafik_matrisi (kalkis_kodu, varis_kodu, sure_sabah_dk, sure_ogle_dk, sure_aksam_dk, kalkis_yaka, varis_yaka) VALUES (@k, @v, @ss, @so, @sa, @ky, @vy)";
                            using (var cmd = new NpgsqlCommand(sql, conn))
                            {
                                cmd.Parameters.AddWithValue("k", kalkisKodu);
                                cmd.Parameters.AddWithValue("v", varisKodu);
                                cmd.Parameters.AddWithValue("ss", sureSabah);
                                cmd.Parameters.AddWithValue("so", sureOgle);
                                cmd.Parameters.AddWithValue("sa", sureAksam);
                                cmd.Parameters.AddWithValue("ky", kalkisYaka);
                                cmd.Parameters.AddWithValue("vy", varisYaka);
                                cmd.ExecuteNonQuery();
                            }
                        }
                        transaction.Commit();
                    }
                }
            }
            Console.WriteLine("✅ Traffic matrix completed.\n");
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
                                int toInt(int index) => (row.Table.Columns.Count > index && row[index] != DBNull.Value && int.TryParse(row[index].ToString(), out int v)) ? v : 0;
                                decimal toDec(int index) => (row.Table.Columns.Count > index && row[index] != DBNull.Value && decimal.TryParse(row[index].ToString(), out decimal v)) ? v : 0m;

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
                                        cmd.Parameters.AddWithValue("p4", toDec(3));
                                        cmd.Parameters.AddWithValue("p5", toDec(4));
                                        break;

                                    case "Cari Kart":
                                        string cariAdi = val(1); // Excel'deki Cari Adi (Bakırköy Migros vb.)

                                        // SÖZLÜĞE SOR: "Bakırköy Migros" kaç numaralı ID?
                                        int matrisId = _nameToIdMapping.ContainsKey(cariAdi) ? _nameToIdMapping[cariAdi] : -1;

                                        if (matrisId == -1)
                                        {
                                            Console.WriteLine($"⚠️ UYARI: '{cariAdi}' matriste bulunamadı!");
                                        }
                                        cmd.CommandText = "INSERT INTO cari_kart (cari_kodu, cari_adi, tip, mal_kabul_baslangic, mal_kabul_bitis, matris_id) VALUES (@p1, @p2, @p3, @p4, @p5, @p6) ON CONFLICT (cari_kodu) DO UPDATE SET cari_adi = EXCLUDED.cari_adi, tip = EXCLUDED.tip, mal_kabul_baslangic = EXCLUDED.mal_kabul_baslangic, mal_kabul_bitis = EXCLUDED.mal_kabul_bitis, matris_id = EXCLUDED.matris_id;";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", val(4));
                                        cmd.Parameters.AddWithValue("p6", matrisId);
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
                                        cmd.CommandText = "INSERT INTO arac_kartlari (arac_kodu, plaka, marka_model, kasa_tipi, maks_agirlik_kg, maks_hacim_m3, km_maliyeti_tl, maks_mesai_suresi_dk, maks_durak_sayisi, kopru_gecis_izni, bagli_oldugu_depo) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", toDec(4));
                                        cmd.Parameters.AddWithValue("p6", toDec(5));
                                        cmd.Parameters.AddWithValue("p7", toDec(6));
                                        cmd.Parameters.AddWithValue("p8", toInt(7));
                                        cmd.Parameters.AddWithValue("p9", toInt(8));
                                        cmd.Parameters.AddWithValue("p10", val(9));
                                        cmd.Parameters.AddWithValue("p11", row.Table.Columns.Count > 10 && row[10] != DBNull.Value ? Convert.ToInt32(row[10]) : 0);
                                        break;

                                    case "İşyeri Stok":
                                        cmd.CommandText = "INSERT INTO isyeri_stok (depo_kodu, depo_adi, stok, miktar) VALUES (@p1, @p2, @p3, @p4) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", toInt(3));
                                        break;

                                    case "Fiyat Listesi":
                                        cmd.CommandText = "INSERT INTO fiyat_listesi (stok, liste, fiyat) VALUES (@p1, @p2, @p3) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", toDec(2));
                                        break;

                                    case "Satış Teklifi":
                                        cmd.CommandText = "INSERT INTO satis_teklifi (teklif_no, cari_kodu, cari_adi) VALUES (@p1, @p2, @p3) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        break;

                                    case "Satış Siparişi":
                                        cmd.CommandText = "INSERT INTO satis_siparisi (siparis_no, teklif, cari_kodu, cari_adi, arac_kodu, plaka, toplam_kg, toplam_hacim_m3, kapasite_durumu, siparis_durumu, teslimat_pencere_baslangic, teslimat_penceresi_bitis, matris_id) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13) ON CONFLICT (siparis_no) DO UPDATE SET matris_id = EXCLUDED.matris_id";
                                        cariAdi = val(3);

                                        // 2. İsim üzerinden matris_id'yi sözlükten bul
                                        // Eğer isim eşleşmezse -1 döner, böylece veritabanında hatayı kolay fark edersin
                                        int siparisMatrisId = _nameToIdMapping.ContainsKey(cariAdi) ? _nameToIdMapping[cariAdi] : -1;

                                        if (siparisMatrisId == -1)
                                        {
                                            Console.WriteLine($"⚠️ UYARI: Sipariş aktarılırken '{cariAdi}' matriste bulunamadı! Lütfen Excel isimlerini kontrol et.");
                                        }
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", val(4));
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        cmd.Parameters.AddWithValue("p7", toDec(6));
                                        cmd.Parameters.AddWithValue("p8", toDec(7));
                                        cmd.Parameters.AddWithValue("p9", val(8));
                                        cmd.Parameters.AddWithValue("p10", val(9));
                                        cmd.Parameters.AddWithValue("p11", val(10));
                                        cmd.Parameters.AddWithValue("p12", val(11));
                                        cmd.Parameters.AddWithValue("p13", siparisMatrisId);
                                        break;

                                    case "Stok Hareketleri":
                                        cmd.CommandText = "INSERT INTO stok_hareketleri (siparis, stok, miktar) VALUES (@p1, @p2, @p3) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", toInt(2));
                                        break;

                                    case "İrsaliye":
                                        cmd.CommandText = "INSERT INTO irsaliye (irsaliye_no, siparis, depo_kodu, depo_adi, arac_kodu, plaka, toplam_kg, toplam_hacim_m3, kapasite_durumu, teslimat_durumu, aciklama_iade_nedeni) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", val(3));
                                        cmd.Parameters.AddWithValue("p5", val(4));
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        cmd.Parameters.AddWithValue("p7", toDec(6));
                                        cmd.Parameters.AddWithValue("p8", toDec(7));
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
                                        cmd.Parameters.AddWithValue("p5", toDec(4));
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        break;

                                    case "Sevkiyat_Plani":
                                        cmd.CommandText = "INSERT INTO sevkiyat_plani (sevkiyat_no, arac_kodu, plaka, toplam_kg, toplam_hacim_m3, sevkiyat_durumu) VALUES (@p1, @p2, @p3, @p4, @p5, @p6) ON CONFLICT DO NOTHING";
                                        cmd.Parameters.AddWithValue("p1", val(0));
                                        cmd.Parameters.AddWithValue("p2", val(1));
                                        cmd.Parameters.AddWithValue("p3", val(2));
                                        cmd.Parameters.AddWithValue("p4", toDec(3));
                                        cmd.Parameters.AddWithValue("p5", toDec(4));
                                        cmd.Parameters.AddWithValue("p6", val(5));
                                        break;
                                }

                                if (!string.IsNullOrEmpty(cmd.CommandText))
                                {
                                    cmd.ExecuteNonQuery();
                                }
                                cmd.Dispose();
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"⚠️ [Row Skipped - {sheet}]: {ex.Message}");
                            }
                        }
                        Console.WriteLine($"✅ '{sheet}' transferred.");
                    }
                }
            }
        }
    }
}