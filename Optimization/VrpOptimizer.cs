using Google.OrTools.ConstraintSolver;
using System;
using System.Collections.Generic;

public class VrpOptimizer
{
    public void Solve(VrpDataModel data)
    {
        // 1. Yöneticiyi Başlat (Node sayısı, Araç Sayısı, Başlangıç ve Bitiş Noktaları)
        RoutingIndexManager manager = new RoutingIndexManager(
            data.TimeMatrix.GetLength(0), 
            data.VehicleNumber, 
            data.Starts, 
            data.Ends);

        RoutingModel routing = new RoutingModel(manager);

        // 2. Mesafe/Süre Maliyetini Ekle
        int transitCallbackIndex = routing.RegisterTransitCallback((long fromIndex, long toIndex) =>
        {
            var fromNode = manager.IndexToNode(fromIndex);
            var toNode = manager.IndexToNode(toIndex);
            return data.TimeMatrix[fromNode, toNode];
        });
        routing.SetArcCostEvaluatorOfAllVehicles(transitCallbackIndex);

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
            transitCallbackIndex,
            0,  // Bekleme süresi toleransı (Şimdilik 0)
            data.VehicleMaxTimes, // Modeldan gelen maksimum süreler
            true, 
            "Time"); 
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
        for (int i = 0; i < data.TimeMatrix.GetLength(0); ++i)
        {
            if (Array.Exists(data.Starts, start => start == i) || Array.Exists(data.Ends, end => end == i))
                continue;

            long nodeIndex = manager.NodeToIndex(i);
            routing.AddDisjunction(new long[] { nodeIndex }, penalty);
        }
        // ====================================================================

        // 3. Arama Parametrelerini Ayarla
        RoutingSearchParameters searchParameters = operations_research_constraint_solver.DefaultRoutingSearchParameters();
        searchParameters.FirstSolutionStrategy = FirstSolutionStrategy.Types.Value.PathCheapestArc;
        searchParameters.LocalSearchMetaheuristic = LocalSearchMetaheuristic.Types.Value.GuidedLocalSearch;
        searchParameters.TimeLimit = new Google.Protobuf.WellKnownTypes.Duration { Seconds = 30 };

        // 4. Çöz ve Yazdır
        Assignment solution = routing.SolveWithParameters(searchParameters);
        
        if (solution != null)
        {
            Console.WriteLine("\nOptimum Rota Başarıyla Bulundu!\n");

            List<int> droppedNodes = new List<int>();
            for (int node = 0; node < data.TimeMatrix.GetLength(0); ++node)
            {
                if (Array.Exists(data.Starts, start => start == node) || Array.Exists(data.Ends, end => end == node))
                    continue;

                long nodeIndex = manager.NodeToIndex(node);
                if (solution.Value(routing.NextVar(nodeIndex)) == nodeIndex)
                {
                    droppedNodes.Add(node);
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
                long routeTime = 0;
                long routeWeight = 0; 
                long routeVolume = 0; 
                long routeStops = 0; // YENİ: Uğranılan durak sayısını ekrana basmak için eklendi
                
                var index = routing.Start(i);
                string route = "";

                while (routing.IsEnd(index) == false)
                {
                    var node = manager.IndexToNode(index);
                    route += $"{node} -> ";
                    
                    routeWeight += data.WeightDemands[node];
                    routeVolume += data.VolumeDemands[node];
                    
                    // Depo harici her durakta sayacı 1 artır
                    if (!Array.Exists(data.Starts, start => start == node)) 
                    {
                        routeStops++;
                    }

                    var previousIndex = index;
                    index = solution.Value(routing.NextVar(index));

                    var previousNode = manager.IndexToNode(previousIndex);
                    var currentNode = manager.IndexToNode(index);
                    routeTime += data.TimeMatrix[previousNode, currentNode];
                }
                
                var endNode = manager.IndexToNode(index);
                route += $"{endNode}\n";
                
                Console.WriteLine(route);
                Console.WriteLine($"Toplam Süre: {routeTime} dakika / Maksimum Süre İzni: {data.VehicleMaxTimes[i]} dk");
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