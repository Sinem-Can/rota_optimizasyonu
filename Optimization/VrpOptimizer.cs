using Google.OrTools.ConstraintSolver;
#nullable disable
using System;
using System.Collections.Generic;

public class VrpOptimizer
{
    public void Solve(VrpDataModel data)
    {
        // 1. Yöneticiyi Başlat (Node sayısı, Araç Sayısı, Başlangıç ve Bitiş Noktaları)
        RoutingIndexManager manager = new RoutingIndexManager(
            data.TimeMatrixOgle.GetLength(0), 
            data.VehicleNumber, 
            data.Starts, 
            data.Ends);

        RoutingModel routing = new RoutingModel(manager);

        // 2. Fiziksel Mesafe (KM) Callback'i
        int distanceCallbackIndex = routing.RegisterTransitCallback((long fromIndex, long toIndex) =>
        {
            var fromNode = manager.IndexToNode(fromIndex);
            var toNode = manager.IndexToNode(toIndex);
            
            if (data.DistanceMatrix != null)
                return data.DistanceMatrix[fromNode, toNode];
            return 0;
        });

        // ====================================================================
        // YENİ: ZAMAN BOYUTU (TIME DIMENSION) - VRPTW & HİZMET SÜRESİ & TRAFİK
        // ====================================================================
        int timeCallbackIndex = routing.RegisterTransitCallback((long fromIndex, long toIndex) =>
        {
            var fromNode = manager.IndexToNode(fromIndex);
            var toNode = manager.IndexToNode(toIndex);
            
            long toStartTime = 0;
            if (data.TimeWindows != null && data.TimeWindows.GetLength(0) > toNode)
            {
                toStartTime = data.TimeWindows[toNode, 0];
            }
            
            long travelTime = 0;
            // Mutlak Zaman (00:00 = 0)
            // Sabah: 08:00-10:00 (480-600) | Öğle: 10:00-16:00 (600-960) | Akşam: 16:00-19:00 (960-1140)
            if (toStartTime < 600) // 10:00'dan önceyse sabah
                travelTime = data.TimeMatrixSabah[fromNode, toNode];
            else if (toStartTime >= 960) // 16:00'dan sonraysa akşam
                travelTime = data.TimeMatrixAksam[fromNode, toNode];
            else
                travelTime = data.TimeMatrixOgle[fromNode, toNode];
            
            // Eğer 'fromNode' depo değilse, teslimat için sabit 15 dk hizmet süresi ekle
            long serviceTime = 0;
            if (!Array.Exists(data.Starts, s => s == fromNode) && !Array.Exists(data.Ends, e => e == fromNode))
            {
                serviceTime = 15; // Sabit 15 dk bekleme/indirme
            }
            
            return travelTime + serviceTime;
        });
        
        // ANA HEDEF (COST): Rota çizerken öncelikle Trafik Süresini minimize et!
        routing.SetArcCostEvaluatorOfAllVehicles(timeCallbackIndex);

        routing.AddDimension(
            timeCallbackIndex,
            120,    // Aracın erken varırsa kapıda maksimum bekleme süresi esnekliği (Örn 120 dk)
            1440,   // Aracın maksimum toplam mesaisi (Örn 24 saat = 1440 dk)
            false,  // Süreler kesin olarak 0'dan mı başlamalı? Hayır, esnek (false)
            "Time");

        RoutingDimension timeDimension = routing.GetMutableDimension("Time");

        // Her lokasyon için Mal Kabul Saatlerini (Zaman Pencerelerini) Uygula
        for (int i = 0; i < data.TimeMatrixSabah.GetLength(0); ++i)
        {
            long index = manager.NodeToIndex(i);
            
            // Veritabanından (mutlak dakika olarak, örn 08:00 = 480)
            long startTime = 480;
            long endTime = 1080; // 18:00

            if (data.TimeWindows != null && data.TimeWindows.GetLength(0) > i)
            {
                startTime = data.TimeWindows[i, 0];
                endTime = data.TimeWindows[i, 1];
            }

            // Düğüme kısıtı ekle
            timeDimension.CumulVar(index).SetRange(startTime, endTime);
        }
        // ====================================================================

        // ====================================================================
        // YENİ: KÖPRÜ (YAKA) GEÇİŞ KISITLARI (Bridge Restrictions)
        // ====================================================================
        if (data.NodeRegions != null && data.VehicleAllowedRegions != null)
        {
            for (int v = 0; v < data.VehicleNumber; v++)
            {
                int allowedRegion = data.VehicleAllowedRegions[v];
                if (allowedRegion == 0) continue; // Araç her yere gidebilir (Geçiş serbest)

                // Araç sadece belirli bir yakaya kısıtlanmışsa (Örn: Sadece Avrupa = 1)
                for (int node = 0; node < data.TimeMatrixSabah.GetLength(0); node++)
                {
                    // Depolara her halükarda gidebilmeli veya deponun yakası farklıysa başlamamalı,
                    // Şimdilik sadece müşterileri (Starts/Ends harici) yasaklıyoruz:
                    if (Array.Exists(data.Starts, s => s == node) || Array.Exists(data.Ends, e => e == node))
                        continue;

                    int nodeRegion = data.NodeRegions[node];
                    
                    // Eğer noktanın yakası belli (0 değilse) ve aracın izinli olduğu yaka ile uyuşmuyorsa
                    if (nodeRegion != 0 && nodeRegion != allowedRegion)
                    {
                        long index = manager.NodeToIndex(node);
                        // O araca, o müşteriyi ziyaret etmeyi YASAKLA
                        routing.VehicleVar(index).RemoveValue(v);
                    }
                }
            }
        }
        // ====================================================================

        // ====================================================================
        // ARAÇ SABİT MALİYETİ (Mümkün olan en az aracı kullanmaya zorlar)
        // ====================================================================
        long vehicleFixedCost = 5000; 
        routing.SetFixedCostOfAllVehicles(vehicleFixedCost);
        // ====================================================================

        // ====================================================================
        // KISIT 1: AĞIRLIK (Kg)
        // ====================================================================
        int weightCallbackIndex = routing.RegisterUnaryTransitCallback((long fromIndex) =>
        {
            var fromNode = manager.IndexToNode(fromIndex);
            return data.WeightDemands[fromNode];
        });
        
        routing.AddDimensionWithVehicleCapacity(
            weightCallbackIndex,
            0,  
            data.VehicleWeightCapacities, 
            true, 
            "Weight");

        // ====================================================================
        // KISIT 2: HACİM (m3)
        // ====================================================================
        if (data.VehicleVolumeCapacities != null && data.VehicleVolumeCapacities.Length > 0) {
            int volumeCallbackIndex = routing.RegisterUnaryTransitCallback((long fromIndex) =>
        {
            var fromNode = manager.IndexToNode(fromIndex);
            return data.VolumeDemands[fromNode];
        });

        routing.AddDimensionWithVehicleCapacity(
            volumeCallbackIndex,
            0,
            data.VehicleVolumeCapacities, 
            true,
            "Volume"); 
        }

        // ====================================================================
        // KISIT 3: MAKSİMUM MESAİ/SÜRÜŞ SÜRESİ
        // ====================================================================
        // Süre hesaplaması için 'transitCallbackIndex'i zaten en üstte tanımlamıştık, onu kullanıyoruz.
        if (data.VehicleMaxTimes != null && data.VehicleMaxTimes.Length > 0) {
            routing.AddDimensionWithVehicleCapacity(
            timeCallbackIndex, // Burada timeCallbackIndex kullanıyoruz (Artık süreleri bu tutuyor)
            0,  // Bekleme süresi toleransı
            data.VehicleMaxTimes, // Modelden gelen maksimum süreler
            true, 
            "MaxTimeDimension"); 
        }
        // ====================================================================
        // KISIT 4: MAKSİMUM DURAK (MÜŞTERİ) SAYISI
        // ====================================================================
        // Her gidilen noktayı "1" birim olarak sayan bir sayaç oluşturuyoruz
        if (data.VehicleMaxStops != null && data.VehicleMaxStops.Length > 0) {
            int stopsCallbackIndex = routing.RegisterUnaryTransitCallback((long fromIndex) =>
        {
            return 1; // Gidilen her durak maliyeti 1 artırır
        });
        
        routing.AddDimensionWithVehicleCapacity(
            stopsCallbackIndex,
            0,
            data.VehicleMaxStops, // Modelden gelen maksimum durak sayıları
            true,
            "Stops");
        }
        // ====================================================================

        // ====================================================================
        // ATANAMAYAN SİPARİŞLER (PENALTY / DISJUNCTION)
        // ====================================================================
        long penalty = 100000; 
        for (int i = 0; i < data.TimeMatrixOgle.GetLength(0); ++i)
        {
            if (Array.Exists(data.Starts, start => start == i) || Array.Exists(data.Ends, end => end == i))
                continue;

            long nodeIndex = manager.NodeToIndex(i);
            routing.AddDisjunction(new long[] { nodeIndex }, penalty);
        }
        // ====================================================================

        // 3. Arama Parametrelerini Ayarla
        RoutingSearchParameters searchParameters = operations_research_constraint_solver.DefaultRoutingSearchParameters();
        searchParameters.FirstSolutionStrategy = FirstSolutionStrategy.Types.Value.LocalCheapestInsertion;
        searchParameters.LocalSearchMetaheuristic = LocalSearchMetaheuristic.Types.Value.GuidedLocalSearch;
        searchParameters.TimeLimit = new Google.Protobuf.WellKnownTypes.Duration { Seconds = 30 };

        // 4. Çöz ve Yazdır
        Assignment solution = routing.SolveWithParameters(searchParameters);
        
        if (solution != null)
        {
            Console.WriteLine("\nOptimum Rota Başarıyla Bulundu!\n");

            List<int> droppedNodes = new List<int>();
            for (int node = 0; node < data.TimeMatrixOgle.GetLength(0); ++node)
            {
                if (Array.Exists(data.Starts, start => start == node) || Array.Exists(data.Ends, end => end == node))
                    continue;

                long nodeIndex = manager.NodeToIndex(node);
                if (solution.Value(routing.NextVar(nodeIndex)) == nodeIndex)
                {
                    int origNode = data.OriginalNodeIds != null ? data.OriginalNodeIds[node] : node;
                    droppedNodes.Add(origNode);
                }
            }

            if (droppedNodes.Count > 0)
            {
                Console.WriteLine($"[DİKKAT] ATANAMAYAN SİPARİŞLER (Kapasite/Süre yetmedi): Müşteri No {string.Join(", ", droppedNodes)}\n");
            }
            else
            {
                Console.WriteLine("Tüm siparişler başarıyla araçlara atandı!\n");
            }

            long gercekToplamSure = 0; 

            for (int i = 0; i < data.VehicleNumber; ++i)
            {
                Console.WriteLine($"--- Araç {i + 1} Rotası ---");
                long routeDistance = 0;
                long routeWeight = 0; 
                long routeVolume = 0; 
                long routeStops = 0; // YENİ: Uğranılan durak sayısını ekrana basmak için eklendi
                
                var index = routing.Start(i);
                string route = "";

                var startNode = manager.IndexToNode(index);
                int origStartNode = data.OriginalNodeIds != null ? data.OriginalNodeIds[startNode] : startNode;
                route += $"  [Çıkış] Depo {origStartNode}\n";

                while (routing.IsEnd(index) == false)
                {
                    var previousIndex = index;
                    index = solution.Value(routing.NextVar(index));

                    var previousNode = manager.IndexToNode(previousIndex);
                    var currentNode = manager.IndexToNode(index);
                    int origCurrentNode = data.OriginalNodeIds != null ? data.OriginalNodeIds[currentNode] : currentNode;
                    
                    long legDistance = 0;
                    if (data.DistanceMatrix != null)
                    {
                        legDistance = data.DistanceMatrix[previousNode, currentNode];
                        routeDistance += legDistance;
                    }
                    
                    long legTime = solution.Min(timeDimension.CumulVar(index)) - solution.Min(timeDimension.CumulVar(previousIndex));

                    if (routing.IsEnd(index))
                    {
                        route += $"  -> [Dönüş] Depo {origCurrentNode} (Mesafe: {legDistance} km, Süre: {legTime} dk)\n";
                    }
                    else
                    {
                        route += $"  -> Müşteri {origCurrentNode} (Mesafe: {legDistance} km, Süre: {legTime} dk)\n";
                    }

                    routeWeight += data.WeightDemands[currentNode];
                    routeVolume += data.VolumeDemands[currentNode];
                    
                    if (!Array.Exists(data.Starts, start => start == currentNode)) 
                    {
                        routeStops++;
                    }
                }
                
                long routeTime = solution.Min(timeDimension.CumulVar(index)) - solution.Min(timeDimension.CumulVar(routing.Start(i)));
                
                Console.WriteLine(route);
                Console.WriteLine($"Toplam Süre: {routeTime} dakika / Maksimum Süre İzni: {data.VehicleMaxTimes[i]} dk");
                Console.WriteLine($"Toplam Katedilen Mesafe: {routeDistance} birim");
                Console.WriteLine($"Ziyaret Edilen Müşteri: {routeStops} / Maksimum Müşteri İzni: {data.VehicleMaxStops[i]}");
                Console.WriteLine($"Taşınan Toplam Ağırlık: {routeWeight} Kg / Kapasite: {data.VehicleWeightCapacities[i]} Kg");
                Console.WriteLine($"Taşınan Toplam Hacim: {routeVolume} m3 / Kapasite: {data.VehicleVolumeCapacities[i]} m3\n");
                
                gercekToplamSure += routeTime; 
            }

            Console.WriteLine($"===================================================");
            Console.WriteLine($"SAHADAKİ GERÇEK TOPLAM SÜRÜŞ SÜRESİ: {gercekToplamSure} dakika");
            Console.WriteLine($"===================================================\n");
        }
        else
        {
            Console.WriteLine("Verilen kapasitelerle ve süre limitleriyle bu siparişler dağıtılamaz (Çözüm bulunamadı).");
        }
    }
}