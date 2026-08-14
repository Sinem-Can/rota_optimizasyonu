using Npgsql;

namespace Uyumsoft.RouteOptimizer;

public static class DatabaseInitializer
{
    public static void EnsureSchema(string connectionString, string contentRootPath)
    {
        using var connection = new NpgsqlConnection(connectionString);
        connection.Open();
        using var check = new NpgsqlCommand("SELECT to_regclass('public.arac_kartlari') IS NOT NULL", connection);
        if (check.ExecuteScalar() is true) return;

        var path = Path.Combine(contentRootPath, "postgreyeyazilacak.sql");
        var schema = string.Join(Environment.NewLine, File.ReadLines(path)
            .Where(line => !line.TrimStart().StartsWith("DROP TABLE", StringComparison.OrdinalIgnoreCase)));
        using var command = new NpgsqlCommand(schema, connection);
        command.ExecuteNonQuery();

        const string seed = """
            INSERT INTO depo (depo_kodu, depo_adi) VALUES ('DP001','Avcılar Merkez Depo'), ('DP002','Üsküdar Merkez Depo');
            INSERT INTO arac_kartlari VALUES
            ('VHC-001','34 LIX 01','Panelvan','Kapalı Kasa',1600,16,8,480,50,'Evet','DP001'),
            ('VHC-002','34 LIX 02','Panelvan','Kapalı Kasa',3200,18,8,480,50,'Evet','DP001'),
            ('VHC-003','34 LIX 03','Panelvan','Kapalı Kasa',3500,22,8,480,50,'Evet','DP002');
            INSERT INTO cari_kart VALUES
            ('CAR001','Beylikdüzü Migros 5M','Müşteri','Beylikdüzü/İstanbul','08:00','18:00',2),
            ('CAR002','Şirinevler Şok Market','Müşteri','Bahçelievler/İstanbul','08:00','18:00',3),
            ('CAR003','Küçükçekmece Çağrı Market','Müşteri','Küçükçekmece/İstanbul','08:00','18:00',4);
            INSERT INTO satis_siparisi VALUES
            ('ORD-001',NULL,'CAR001','Beylikdüzü Migros 5M',NULL,NULL,1040,7,'Uygun','Bekliyor','08:00','18:00',2),
            ('ORD-002',NULL,'CAR002','Şirinevler Şok Market',NULL,NULL,560,4,'Uygun','Bekliyor','08:00','18:00',3),
            ('ORD-003',NULL,'CAR003','Küçükçekmece Çağrı Market',NULL,NULL,920,6,'Uygun','Bekliyor','08:00','18:00',4);
            DO $$ DECLARE i int; j int; d int; BEGIN FOR i IN 0..4 LOOP FOR j IN 0..4 LOOP d := CASE WHEN i=j THEN 0 ELSE 5 + abs(i-j)*4 END; INSERT INTO mesafe_matrisi VALUES (i::text,j::text,d); INSERT INTO trafik_matrisi VALUES (i::text,j::text,d*2,d*2,d*2,0,0); END LOOP; END LOOP; END $$;
            """;
        using var seedCommand = new NpgsqlCommand(seed, connection);
        seedCommand.ExecuteNonQuery();
    }
}
