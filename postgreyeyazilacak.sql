-- MEVCUT TABLOLARI TEMİZLE
DROP TABLE IF EXISTS public.finans_fisi CASCADE;
DROP TABLE IF EXISTS public.trafik_matrisi CASCADE;
DROP TABLE IF EXISTS public.mesafe_matrisi CASCADE;
DROP TABLE IF EXISTS public.sevkiyat_plani CASCADE;
DROP TABLE IF EXISTS public.fatura CASCADE;
DROP TABLE IF EXISTS public.irsaliye CASCADE;
DROP TABLE IF EXISTS public.stok_hareketleri CASCADE;
DROP TABLE IF EXISTS public.satis_siparisi CASCADE;
DROP TABLE IF EXISTS public.satis_teklifi CASCADE;
DROP TABLE IF EXISTS public.fiyat_listesi CASCADE;
DROP TABLE IF EXISTS public.isyeri_stok CASCADE;
DROP TABLE IF EXISTS public.arac_kartlari CASCADE;
DROP TABLE IF EXISTS public.fiyat_listesi_kod CASCADE;
DROP TABLE IF EXISTS public.stok_karti CASCADE;
DROP TABLE IF EXISTS public.depo CASCADE;
DROP TABLE IF EXISTS public.cek_defteri CASCADE;
DROP TABLE IF EXISTS public.kasa CASCADE;
DROP TABLE IF EXISTS public.banka CASCADE;
DROP TABLE IF EXISTS public.cari_kart CASCADE;

-- YENİ EXCEL (VRPTW_Final) İLE %100 UYUMLU ŞEMA
CREATE TABLE public.cari_kart (
    cari_kodu VARCHAR(255) PRIMARY KEY,
    cari_adi VARCHAR(255),
    tip VARCHAR(255),
    mal_kabul_baslangic VARCHAR(50),
    mal_kabul_bitis VARCHAR(50)
);

CREATE TABLE public.banka (
    kod VARCHAR(255) PRIMARY KEY,
    banka VARCHAR(255)
);

CREATE TABLE public.kasa (
    kod VARCHAR(255) PRIMARY KEY,
    kasa VARCHAR(255)
);

CREATE TABLE public.cek_defteri (
    cek_no VARCHAR(255) PRIMARY KEY,
    durum VARCHAR(255)
);

CREATE TABLE public.depo (
    depo_kodu VARCHAR(255) PRIMARY KEY,
    depo_adi VARCHAR(255)
);

CREATE TABLE public.stok_karti (
    stok_kodu VARCHAR(255) PRIMARY KEY,
    urun VARCHAR(255),
    birim VARCHAR(255),
    birim_agirlik_kg NUMERIC,
    birim_hacim_m3 NUMERIC
);

CREATE TABLE public.fiyat_listesi_kod (
    kod VARCHAR(255) PRIMARY KEY,
    aciklama VARCHAR(255)
);

CREATE TABLE public.arac_kartlari (
    arac_kodu VARCHAR(255) PRIMARY KEY,
    plaka VARCHAR(255),
    marka_model VARCHAR(255),
    kasa_tipi VARCHAR(255),
    maks_agirlik_kg NUMERIC,
    maks_hacim_m3 NUMERIC,
    km_maliyeti_tl NUMERIC,
    maks_mesai_suresi_dk INT,
    maks_durak_sayisi INT,
    kopru_gecis_izni VARCHAR(255)
);

CREATE TABLE public.isyeri_stok (
    depo_kodu VARCHAR(255),
    depo_adi VARCHAR(255),
    stok VARCHAR(255),
    miktar INT
);

CREATE TABLE public.fiyat_listesi (
    stok VARCHAR(255),
    liste VARCHAR(255),
    fiyat NUMERIC
);

CREATE TABLE public.satis_teklifi (
    teklif_no VARCHAR(255) PRIMARY KEY,
    cari_kodu VARCHAR(255),
    cari_adi VARCHAR(255)
);

CREATE TABLE public.satis_siparisi (
    siparis_no VARCHAR(255) PRIMARY KEY,
    teklif VARCHAR(255),
    cari_kodu VARCHAR(255),
    cari_adi VARCHAR(255),
    arac_kodu VARCHAR(255),
    plaka VARCHAR(255),
    toplam_kg NUMERIC,
    toplam_hacim_m3 NUMERIC,
    kapasite_durumu VARCHAR(255),
    siparis_durumu VARCHAR(255),
    teslimat_pencere_baslangic VARCHAR(50),
    teslimat_penceresi_bitis VARCHAR(50)
);

CREATE TABLE public.stok_hareketleri (
    siparis VARCHAR(255),
    stok VARCHAR(255),
    miktar INT
);

CREATE TABLE public.irsaliye (
    irsaliye_no VARCHAR(255) PRIMARY KEY,
    siparis VARCHAR(255),
    depo_kodu VARCHAR(255),
    depo_adi VARCHAR(255),
    arac_kodu VARCHAR(255),
    plaka VARCHAR(255),
    toplam_kg NUMERIC,
    toplam_hacim_m3 NUMERIC,
    kapasite_durumu VARCHAR(255),
    teslimat_durumu VARCHAR(255),
    aciklama_iade_nedeni VARCHAR(255)
);

CREATE TABLE public.fatura (
    fatura_no VARCHAR(255) PRIMARY KEY,
    irsaliye_no VARCHAR(255),
    cari_kodu VARCHAR(255),
    cari_adi VARCHAR(255),
    tutar NUMERIC,
    odeme VARCHAR(255)
);

CREATE TABLE public.sevkiyat_plani (
    sevkiyat_no VARCHAR(255) PRIMARY KEY,
    arac_kodu VARCHAR(255),
    plaka VARCHAR(255),
    toplam_kg NUMERIC,
    toplam_hacim_m3 NUMERIC,
    sevkiyat_durumu VARCHAR(255)
);

CREATE TABLE public.mesafe_matrisi (
    kalkis_kodu VARCHAR(255),
    varis_kodu VARCHAR(255),
    mesafe_km NUMERIC
);

CREATE TABLE public.trafik_matrisi (
    kalkis_kodu VARCHAR(255),
    varis_kodu VARCHAR(255),
    sure_sabah_dk NUMERIC,
    sure_ogle_dk NUMERIC,
    sure_aksam_dk NUMERIC,
    kalkis_yaka INT,
    varis_yaka INT
);

CREATE TABLE public.finans_fisi (
    fis_no VARCHAR(255) PRIMARY KEY,
    cari_kodu VARCHAR(255),
    islem_tipi VARCHAR(50),
    tutar NUMERIC,
    vade_tarihi DATE,
    durum VARCHAR(50)
);