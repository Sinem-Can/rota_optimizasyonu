using System.Collections.Generic;

namespace Uyumsoft.RouteOptimizer.Models
{
    public class StopDto
    {
        public string id { get; set; } = string.Empty;
        public string cariKod { get; set; } = string.Empty;
        public int sequence { get; set; }
        public string customerName { get; set; } = string.Empty;
        public string address { get; set; } = string.Empty;
        public string district { get; set; } = string.Empty;
        public string eta { get; set; } = string.Empty;
        public string windowStart { get; set; } = string.Empty;
        public string windowEnd { get; set; } = string.Empty;
        public int serviceMinutes { get; set; }
        public long weightKg { get; set; }
        public long volumeM3 { get; set; }
        public string status { get; set; } = "pending";
        public string priority { get; set; } = "Normal";
        public string phone { get; set; } = string.Empty;
        public string orderNo { get; set; } = string.Empty;
        public double x { get; set; }
        public double y { get; set; }
    }

    public class DriverDto
    {
        public string id { get; set; } = string.Empty;
        public string label { get; set; } = string.Empty;
        public string fullName { get; set; } = string.Empty;
        public string plate { get; set; } = string.Empty;
        public string vehicleType { get; set; } = string.Empty;
        public string colorKey { get; set; } = "a";
        public long totalDistanceKm { get; set; }
        public long totalDurationMin { get; set; }
        public long capacityUsedKg { get; set; }
        public long capacityMaxKg { get; set; }
        public string shiftStart { get; set; } = "08:00";
        public string shiftEnd { get; set; } = "18:00";
        public string depotName { get; set; } = string.Empty;
        public double depotX { get; set; } = 50;
        public double depotY { get; set; } = 50;
        public List<StopDto> stops { get; set; } = new List<StopDto>();
    }
}
