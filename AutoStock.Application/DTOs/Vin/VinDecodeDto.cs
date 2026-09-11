using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.DTOs.Vin
{
    public class VinDecodeDto
    {
        public string Vin { get; set; } = string.Empty;

        public string Make { get; set; } = string.Empty;

        public string Model { get; set; } = string.Empty;

        public int? ModelYear { get; set; }

        public string VehicleType { get; set; } = string.Empty;

        public string BodyClass { get; set; } = string.Empty;

        public string FuelType { get; set; } = string.Empty;

        public string TransmissionStyle { get; set; } = string.Empty;

        public string DriveType { get; set; } = string.Empty;

        public string PlantCountry { get; set; } = string.Empty;

        public string ErrorCode { get; set; } = string.Empty;

        public string ErrorText { get; set; } = string.Empty;
    }
}
