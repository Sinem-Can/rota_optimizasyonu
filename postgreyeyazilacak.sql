-- ==========================================
-- ANA TANIM TABLOLARI
-- ==========================================

CREATE TABLE cari_kart (
  cari_kodu VARCHAR(255) PRIMARY KEY,
  cari_adi VARCHAR(255),
  tip VARCHAR(255)
);

CREATE TABLE banka (
  kod VARCHAR(255) PRIMARY KEY,
  banka VARCHAR(255)
);

CREATE TABLE kasa (
  kod VARCHAR(255) PRIMARY KEY,
  kasa VARCHAR(255)
);

CREATE TABLE cek_defteri (
  cek_no VARCHAR(255) PRIMARY KEY,
  durum VARCHAR(255)
);

CREATE TABLE depo (
  kod VARCHAR(255) PRIMARY KEY,
  depo VARCHAR(255)
);

CREATE TABLE stok_karti (
  stok_kodu VARCHAR(255) PRIMARY KEY,
  urun VARCHAR(255),
  birim VARCHAR(255),
  birim_agirlik_kg INTEGER,
  birim_hacim_m3 NUMERIC
);

CREATE TABLE fiyat_listesi_kod (
  kod VARCHAR(255) PRIMARY KEY,
  aciklama VARCHAR(255)
);

CREATE TABLE arac_kartlari (
  arac_kodu VARCHAR(255) PRIMARY KEY,
  plaka VARCHAR(255),
  marka_model VARCHAR(255),
  kasa_tipi VARCHAR(255),
  maks_agirlik_kg INTEGER,
  maks_hacim_m3 NUMERIC,
  km_maliyeti_tl NUMERIC
);

-- ==========================================
-- İLİŞKİSEL VE İŞLEM TABLOLARI
-- ==========================================

CREATE TABLE isyeri_stok (
  depo VARCHAR(255),
  stok VARCHAR(255),
  miktar INTEGER,
  PRIMARY KEY (depo, stok)
);

CREATE TABLE fiyat_listesi (
  stok VARCHAR(255),
  liste VARCHAR(255),
  fiyat NUMERIC,
  PRIMARY KEY (stok, liste)
);

CREATE TABLE satis_teklifi (
  teklif_no VARCHAR(255) PRIMARY KEY,
  cari VARCHAR(255)
);

CREATE TABLE satis_siparisi (
  siparis_no VARCHAR(255) PRIMARY KEY,
  teklif VARCHAR(255),
  cari VARCHAR(255),
  arac_kodu VARCHAR(255),
  plaka VARCHAR(255),
  toplam_kg INTEGER,
  toplam_hacim_m3 NUMERIC,
  kapasite_durumu VARCHAR(255)
);

CREATE TABLE stok_hareketleri (
  siparis VARCHAR(255),
  stok VARCHAR(255),
  miktar INTEGER
);

CREATE TABLE irsaliye (
  irsaliye_no VARCHAR(255) PRIMARY KEY,
  siparis VARCHAR(255),
  depo VARCHAR(255),
  arac_kodu VARCHAR(255),
  plaka VARCHAR(255),
  toplam_kg INTEGER,
  toplam_hacim_m3 NUMERIC,
  kapasite_durumu VARCHAR(255)
);

CREATE TABLE fatura (
  fatura_no VARCHAR(255) PRIMARY KEY,
  irsaliye_no VARCHAR(255),
  cari VARCHAR(255),
  tutar NUMERIC,
  odeme VARCHAR(255)
);

CREATE TABLE sevkiyat_plani (
  sevkiyat_no VARCHAR(255) PRIMARY KEY,
  arac_kodu VARCHAR(255),
  plaka VARCHAR(255),
  toplam_kg NUMERIC,
  toplam_hacim_m3 NUMERIC
);

-- ==========================================
-- EKLENEN YENİ TABLOLAR (Finans & Lojistik)
-- ==========================================

-- Lojistik rotalama algoritması için Mesafe Matrisi
CREATE TABLE mesafe_matrisi (
    kalkis_kodu VARCHAR(255),
    varis_kodu VARCHAR(255),
    mesafe_km NUMERIC,
    PRIMARY KEY (kalkis_kodu, varis_kodu)
);

-- Notlarındaki "Finans -> Fiş" yapısına uygun genel finans/senet fişi
CREATE TABLE finans_fisi (
    fis_no VARCHAR(255) PRIMARY KEY,
    cari_kodu VARCHAR(255),
    islem_tipi VARCHAR(50), -- 'Senet', 'Çek', 'Nakit Nakil' vb.
    tutar NUMERIC,
    vade_tarihi DATE,
    durum VARCHAR(50)
);

-- ==========================================
-- YABANCI ANAHTAR (FOREIGN KEY) İLİŞKİLERİ
-- ==========================================

ALTER TABLE isyeri_stok ADD FOREIGN KEY (depo) REFERENCES depo (kod);
ALTER TABLE isyeri_stok ADD FOREIGN KEY (stok) REFERENCES stok_karti (stok_kodu);

ALTER TABLE fiyat_listesi ADD FOREIGN KEY (stok) REFERENCES stok_karti (stok_kodu);
ALTER TABLE fiyat_listesi ADD FOREIGN KEY (liste) REFERENCES fiyat_listesi_kod (kod);

ALTER TABLE satis_siparisi ADD FOREIGN KEY (teklif) REFERENCES satis_teklifi (teklif_no);
ALTER TABLE satis_siparisi ADD FOREIGN KEY (arac_kodu) REFERENCES arac_kartlari (arac_kodu);
ALTER TABLE satis_siparisi ADD FOREIGN KEY (cari) REFERENCES cari_kart (cari_kodu);

ALTER TABLE stok_hareketleri ADD FOREIGN KEY (siparis) REFERENCES satis_siparisi (siparis_no);
ALTER TABLE stok_hareketleri ADD FOREIGN KEY (stok) REFERENCES stok_karti (stok_kodu);

ALTER TABLE irsaliye ADD FOREIGN KEY (siparis) REFERENCES satis_siparisi (siparis_no);
ALTER TABLE irsaliye ADD FOREIGN KEY (depo) REFERENCES depo (kod);
ALTER TABLE irsaliye ADD FOREIGN KEY (arac_kodu) REFERENCES arac_kartlari (arac_kodu);

ALTER TABLE fatura ADD FOREIGN KEY (irsaliye_no) REFERENCES irsaliye (irsaliye_no);
ALTER TABLE fatura ADD FOREIGN KEY (cari) REFERENCES cari_kart (cari_kodu);

ALTER TABLE sevkiyat_plani ADD FOREIGN KEY (arac_kodu) REFERENCES arac_kartlari (arac_kodu);

ALTER TABLE finans_fisi ADD FOREIGN KEY (cari_kodu) REFERENCES cari_kart (cari_kodu);