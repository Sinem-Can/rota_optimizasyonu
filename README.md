# RotaPlan — Rota Optimizasyon ve ERP Yönetim Sistemi

RotaPlan; araç kapasitesi, teslimat zaman pencereleri, mesafe ve operasyonel
kısıtları dikkate alarak dağıtım rotalarını optimize eden web tabanlı bir
planlama uygulamasıdır.

Uygulama; rota planlama ekranını, harita üzerinde görselleştirmeyi, zaman
çizelgesini ve ERP yönetim modülünü tek bir arayüzde birleştirir.

## Proje Raporu

Projenin analizi, geliştirme süreci, test çalışmaları ve çıktıları için
[RotaPlan Staj Projesi Raporu (OneDrive)](https://onedrive.live.com/:w:/g/personal/cf043bba9744a23e/IQBSayvWeH80Tb70J25c9iY0AWsZeYE7SBkhcDAhJOpmM8I?rtime=0uTYrUf23kg&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3cvYy9jZjA0M2JiYTk3NDRhMjNlL0lRQlNheXZXZUg4MFRiNzBKMjVjOWlZMEFXc1plWUU3U0JraGNEQWhKT3BtTThJP2U9VENaaEFD) bağlantısını inceleyebilirsiniz.

## Öne Çıkan Özellikler

- Araç kapasitesi, ağırlık, hacim ve çalışma süresi kısıtlarıyla rota optimizasyonu
- Google OR-Tools tabanlı VRP çözüm yaklaşımı
- Rotaların harita üzerinde görüntülenmesi
- Çoklu rota görünümünde Odak Modu ile seçili rotayı öne çıkarma
- Araçlar ve teslimat durakları için detay paneli
- Dinamik zaman çizelgesi ve canlı saat göstergesi
- Atanmış ve atanmamış siparişlerin görüntülenmesi
- ERP yönetim ekranları
- Fatura ve e-İrsaliye kayıtlarının listelenmesi ve görüntülenmesi
- Salt-okunur veri yapısı ile merkezi backend/veritabanı entegrasyonu
- Açık ve koyu tema desteği

## Kullanılan Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| Frontend | React, Next.js, TypeScript |
| Arayüz | Tailwind CSS, Lucide Icons |
| Backend | C# .NET / ASP.NET Core |
| Optimizasyon | Google OR-Tools |
| Veritabanı | PostgreSQL |
| Harita | OpenStreetMap, Leaflet |
| Veri Aktarımı | Excel/CSV veri işleme |
| Geliştirme Araçları | Git, GitHub, npm |

## Sistem Mimarisi

```text
React / Next.js Arayüzü
          │
          ▼
ASP.NET Core Web API
          │
          ├── Google OR-Tools Rota Optimizasyon Motoru
          │
          ▼
PostgreSQL Veritabanı
```

Frontend; araç, sipariş, rota ve ERP verilerini backend API üzerinden alır.
Backend katmanı veritabanı işlemlerini ve rota optimizasyon hesaplamalarını
yönetir. Oluşturulan planlar harita, zaman çizelgesi ve detay panellerinde
kullanıcıya sunulur.

## Kurulum

### Gereksinimler

- Node.js 18 veya üzeri
- npm
- .NET SDK
- PostgreSQL
- Gerekli veritabanı bağlantı bilgileri

### 1. Projeyi klonlayın

```bash
git clone https://github.com/Sinem-Can/rota_optimizasyonu.git
cd rota_optimizasyonu
```

### 2. Frontend bağımlılıklarını yükleyin

```bash
npm install
```

### 3. Ortam değişkenlerini yapılandırın

Kök dizinde `.env.local` dosyasını oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:5100
```

> Backend farklı bir portta çalışıyorsa bu değeri backend adresiyle eşleştirin.

### 4. Backend'i başlatın

```bash
ASPNETCORE_URLS=http://localhost:5100 dotnet run
```

### 5. Frontend'i başlatın

Yeni bir terminal penceresinde:

```bash
npm run dev
```

Uygulama aşağıdaki adreste açılır:

```text
http://localhost:3000
```

## Kullanım Akışı

1. Uygulama açıldığında siparişler, araçlar ve ilgili operasyon verileri backend üzerinden yüklenir.
2. **Rotaları Optimize Et** aksiyonu çalıştırıldığında siparişler araç kısıtlarına göre değerlendirilir.
3. Uygun siparişler araçlara atanır; kapasite veya zaman kısıtını aşan siparişler atanmadı olarak görüntülenir.
4. Oluşturulan rotalar harita ve zaman çizelgesinde gösterilir.
5. Harita veya zaman çizelgesindeki bir durağa tıklandığında sağ panelde durak detayları görüntülenir.
6. ERP Yönetimi bölümünde müşteri, araç, stok, fatura ve irsaliye kayıtları incelenebilir.

## Ekranlar

- Planlama ve rota optimizasyon ekranı
- Harita ve rota odak modu
- Araç/durak detay paneli
- Zaman çizelgesi
- ERP yönetim ekranları
- İrsaliye listeleme ve görüntüleme ekranı

## Ekip

| Ekip Üyesi | Sorumluluk |
| --- | --- |
| Bilge Karayer | Yazılım geliştirme, entegrasyon ve proje desteği |
| Burhan Yıldız | ERP analizi ve süreç tasarımı |
| Burak Küçükbüce | Veritabanı tasarımı ve PostgreSQL işlemleri |
| Hanife Nursima Akman | Analiz ve ERP modülü çalışmaları |
| Sinem Can | Backend geliştirme ve optimizasyon entegrasyonu |
| Zelal Aydın | Frontend geliştirme ve kullanıcı arayüzü |

## Gelecek Geliştirmeler

- Daha büyük veri setleri için performans ve ölçeklenebilirlik testleri
- Otomatik birim ve entegrasyon testleri
- Gerçek zamanlı araç konumu takibi
- Sürücü mobil uygulaması
- Bildirim ve raporlama altyapısının geliştirilmesi
- Yetkilendirme ve kullanıcı rol yönetimi

## Lisans

Bu proje staj çalışması kapsamında geliştirilmiştir.
