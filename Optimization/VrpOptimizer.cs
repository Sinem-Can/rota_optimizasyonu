using Google.OrTools.ConstraintSolver;
using System;
using System.Collections.Generic; // Listeler için eklendi

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
        // YENİ: ARAÇ SABİT MALİYETİ (Mümkün olan en az aracı kullanmaya zorlar)
        // ====================================================================
        long vehicleFixedCost = 5000; // Depodan çıkmanın maliyeti (Süre maliyetinden yüksek olmalı ki mecbur kalmadıkça çıkmasın)
        routing.SetFixedCostOfAllVehicles(vehicleFixedCost);
        // ====================================================================

        // ====================================================================
        // KISIT 1: AĞIRLIK (Kg)
        int weightCallbackIndex = routing.RegisterUnaryTransitCallback((long fromIndex) =>
        {
            var fromNode = manager.IndexToNode(fromIndex);
            return data.WeightDemands[fromNode];
        });
        
        routing.AddDimensionWithVehicleCapacity(
            weightCallbackIndex,
            0,  // Boşluk (slack)
            data.VehicleWeightCapacities, 
            true, 
            "Weight");

        // KISIT 2: HACİM (m3)
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
        // ====================================================================

        // ====================================================================
        // YENİ EKLENEN KISIM: ATANAMAYAN SİPARİŞLER (PENALTY / DISJUNCTION)
        // ====================================================================
        long penalty = 100000; // Siparişi atlamanın cezası (Mecbur kalmadıkça atlamaz)
        for (int i = 0; i < data.TimeMatrix.GetLength(0); ++i)
        {
            // Sadece müşterilere (depo harici noktalara) bu cezayı tanımlıyoruz
            if (Array.Exists(data.Starts, start => start == i) || Array.Exists(data.Ends, end => end == i))
                continue;

            long nodeIndex = manager.NodeToIndex(i);
            routing.AddDisjunction(new long[] { nodeIndex }, penalty);
        }
        // ====================================================================

        // 3. Arama Parametrelerini Ayarla
        RoutingSearchParameters searchParameters = operations_research_constraint_solver.DefaultRoutingSearchParameters();
        
        // 1. Adım: İlk mantıklı rotayı bul
        searchParameters.FirstSolutionStrategy = FirstSolutionStrategy.Types.Value.PathCheapestArc;
        
        // 2. Adım (YENİ EKLENEN): İlk çözümü bulduktan sonra, süre bitene kadar rotayı sürekli daha iyiye optimize et
        searchParameters.LocalSearchMetaheuristic = LocalSearchMetaheuristic.Types.Value.GuidedLocalSearch;
        
        // 3. Adım: Bu arama ve iyileştirme işlemi için maksimum süreyi belirle (30 saniye)
        searchParameters.TimeLimit = new Google.Protobuf.WellKnownTypes.Duration { Seconds = 30 };

        // 4. Çöz ve Yazdır
        Assignment solution = routing.SolveWithParameters(searchParameters);
        
        if (solution != null)
        {
            // YENİ: ObjectiveValue'yu süre değil, "Algoritma Maliyeti" olarak yazdırıyoruz
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
                Console.WriteLine($"[DİKKAT] ATANAMAYAN SİPARİŞLER (Kapasite yetmedi): Müşteri No {string.Join(", ", droppedNodes)}\n");
            }
            else
            {
                Console.WriteLine("Tüm siparişler başarıyla araçlara atandı!\n");
            }

            long gercekToplamSure = 0; // YENİ: Araçların gerçekte yolda geçirdiği toplam süreyi tutacak

            // Her bir araç için rotayı hesapla ve ekrana yazdır
            for (int i = 0; i < data.VehicleNumber; ++i)
            {
                Console.WriteLine($"--- Araç {i + 1} Rotası ---");
                long routeTime = 0;
                long routeWeight = 0; 
                long routeVolume = 0; 
                
                var index = routing.Start(i);
                string route = "";

                while (routing.IsEnd(index) == false)
                {
                    var node = manager.IndexToNode(index);
                    route += $"{node} -> ";
                    
                    routeWeight += data.WeightDemands[node];
                    routeVolume += data.VolumeDemands[node];
                    var previousIndex = index;
                    index = solution.Value(routing.NextVar(index));

                    // YENİ: Süreyi OR-Tools'un cezalı maliyetinden değil, doğrudan kendi matrisimizden okuyoruz!
                    var previousNode = manager.IndexToNode(previousIndex);
                    var currentNode = manager.IndexToNode(index);
                    routeTime += data.TimeMatrix[previousNode, currentNode];

                }
                
                var endNode = manager.IndexToNode(index);
                route += $"{endNode}\n";
                
                Console.WriteLine(route);
                Console.WriteLine($"Toplam Süre: {routeTime} dakika");
                Console.WriteLine($"Taşınan Toplam Ağırlık: {routeWeight} Kg / Kapasite: {data.VehicleWeightCapacities[i]} Kg");
                Console.WriteLine($"Taşınan Toplam Hacim: {routeVolume} m3 / Kapasite: {data.VehicleVolumeCapacities[i]} m3\n");
                
                gercekToplamSure += routeTime; // YENİ: Aracın süresini genel toplama ekle
            }

            // YENİ: Gerçek süreyi en sonda göster
            Console.WriteLine($"===================================================");
            Console.WriteLine($"SAHADAKİ GERÇEK TOPLAM SÜRÜŞ SÜRESİ: {gercekToplamSure} dakika");
            Console.WriteLine($"===================================================\n");
        }
        else
        {
            Console.WriteLine("Verilen kapasitelerle bu siparişler dağıtılamaz (Çözüm bulunamadı).");
        }
    }
}