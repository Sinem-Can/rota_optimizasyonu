# Ürün Gereksinim Dokümanı (PRD)
## Dinamik Rota Optimizasyon Modülü (Multi-Depot Destekli)

**Durum:** Taslak (Draft)
**Geliştirme Ortamı:** C# / .NET
**Çekirdek Kütüphane:** Google OR-Tools

### 1. Projenin Amacı ve Vizyonu
Bu projenin amacı, ERP sistemi üzerinden oluşan günlük sevkiyat ve dağıtım operasyonlarını matematiksel olarak optimize etmektir. Sisteme düşen müşteri siparişleri, araç filosu kısıtları (ağırlık ve hacim) ve saha trafik/süre verileri dikkate alınarak en az maliyetli, en kısa süreli ve kapasite kurallarına %100 uyan teslimat rotalarının otomatik olarak oluşturulması hedeflenmektedir. Bu sayede manuel planlama hataları ortadan kalkacak, araç kullanım maliyetleri (yakıt, amortisman) düşecek ve çoklu depo operasyonları tek bir merkezden yönetilebilecektir.[cite: 1]

### 2. Kapsam (In-Scope)
- **Çoklu Depo (Multi-Depot) Yönetimi:** Birden fazla depo lokasyonundan çıkan araçların müşteri noktalarına uğrayıp kendi ana depolarına döndüğü MDVRP (Multi-Depot Vehicle Routing Problem) senaryosunun çözülmesi.[cite: 1]
- **Süre Bazlı Optimizasyon:** Algoritmanın mesafe(km) yerine, trafiği ve gerçek sürüş sürelerini yansıtan "Zaman Matrisi (Time Matrix)" bazlı çalışması.[cite: 1]
- **Çok Boyutlu Kapasite Kontrolü:** Ağırlık (Kg) ve Hacim (m³) kapasite kısıtlarının eşzamanlı olarak kontrol edilmesi.[cite: 1]
- **Dinamik Filo Kullanımı:** Optimum araç sayısının seçilmesi (Araç sabit maliyeti mantığı ile gereksiz araç çıkışının önlenmesi).[cite: 1]
- **Güvenlik Duvarı:** Kapasiteye sığmayan siparişlerin tespit edilip sistemi çökertmeden "Atanamayan Siparişler" olarak dışarıda bırakılması.[cite: 1]
- **Entegrasyon Çıktısı:** Sonuçların arayüz (Frontend) ve sistemin geri kalanı tarafından tüketilebilecek yapılandırılmış bir JSON/Web API formatına dönüştürülmesi.[cite: 1]

### 3. Kullanıcı Rolleri ve Hikayeleri (User Stories)
- **Bölge Lojistik Yöneticisi:** "Bir lojistik yöneticisi olarak; birden fazla depo lokasyonum olduğunda, sistemi tüm araçlar ve depolar için tek seferde çalıştırıp, hangi deponun aracıyla hangi müşteriye gitmem gerektiğini tek ekranda görmek istiyorum."[cite: 1]
- **Operasyon Sorumlusu:** "Bir operasyon sorumlusu olarak; eğer günlük siparişler mevcut filomun toplam kapasitesini aşıyorsa, sistemin çökmesini değil, hangi siparişlerin ertesi güne kaldığını (Atanamayanlar) net bir şekilde görmek istiyorum."[cite: 1]
- **Sistem Aktörü (ERP - Operasyonel):** "Araç rotaları kesinleştiğinde, bu rotalara bağlı olarak ilgili irsaliye ve siparişlerin statülerini 'Rotaya Alındı' olarak otomatik güncelleyebilmeliyim."[cite: 1]
- **Sistem Aktörü (ERP - Finansal Kapanış):** "Saha teslimatı tamamlandığında, ilgili irsaliyenin e-faturaya dönüştürülmesini ve tutarın cari bakiyeye işlenmesini otomatik tetikleyebilmeliyim."

### 4. Fonksiyonel Gereksinimler (Functional Requirements)
1. **Dinamik Matris İşleme:** Modül, dışarıdan (harita servisinden) beslenen çapraz sürüş süresi (dakika) matrisini eksiksiz işleyebilmelidir.[cite: 1]
2. **Kesin Kapasite Yönetimi:** Her araç için tanımlanan Maksimum Ağırlık ve Maksimum Hacim değerleri, rotalama esnasında esnetilemez (Hard Constraint) kurallar olarak uygulanmalıdır.[cite: 1]
3. **Minimum Araç Hedefi (Fixed Cost):** Modül, verilen siparişleri dağıtmak için en az sayıda aracı kullanmaya zorlanmalıdır. (Örn: 5 araçlık filoda iş 2 araca sığıyorsa, 3 araç depoda bırakılmalıdır).[cite: 1]
4. **Esnek Başlangıç/Bitiş Noktaları:** Modül, her bir aracın hangi indeksli depodan çıkıp hangi depoya döneceğini dışarıdan gelen dizilerle (Starts/Ends arrays) dinamik olarak alabilmelidir.[cite: 1]

### 5. Teknik Gereksinimler ve Mimari (Technical Requirements)
- **Programlama Dili:** C#[cite: 1]
- **Optimizasyon Motoru:** Google OR-Tools (`Google.OrTools.ConstraintSolver`)[cite: 1]
- **Arama Stratejisi (First Solution):** `PathCheapestArc`[cite: 1]
- **Meta-Sezgisel İyileştirme (Metaheuristics):** `GuidedLocalSearch` (İlk çözüm bulunduktan sonra algoritmanın verilen süre limiti boyunca rotayı yerel arama ile iyileştirmeye devam etmesini sağlar).
- **Zaman Kısıtı:** Optimizasyon çözüm süresi maksimum 30 saniye (`searchParameters.TimeLimit`) ile sınırlandırılmalıdır.[cite: 1]
- **Mesafe ve Süre Veri Kaynağı:** Algoritmanın ihtiyaç duyduğu 'Zaman Matrisi (Time Matrix)', arayüz veya veritabanı katmanı tarafından C# motoruna JSON olarak iletilecektir. Bu veri; canlı harita servislerinden (Google Maps, OSRM vb.) anlık olarak çekilebileceği gibi, sistemde önceden hesaplanmış statik veritabanı/Excel tablolarından da beslenebilecek esnekliğe sahiptir.[cite: 1]

### 6. Gelecek Fazlar / Kapsam Dışı (Out of Scope - Phase 2)
- *Hizmet Süresi (Service Time):* Şoförlerin kapıda yük indirme ve teslimat sürelerinin toplam rota süresine dahil edilmesi.[cite: 1]
- *Zaman Pencereleri (Time Windows):* Müşterilerin "Sadece 13:00 - 15:00 arası teslimat alabilirim" gibi spesifik saat kısıtlamalarının algoritmaya eklenmesi.[cite: 1]