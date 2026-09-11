using AutoStock.Application.DTOs.Vin;
using AutoStock.Application.Interface;
using AutoStock.Application.Interfaces;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace AutoStock.Infrastructure.Services
{
    public class VinDecoderService : IVinDecoderService
    {
        private readonly HttpClient _httpClient;


        public VinDecoderService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }


        public async Task<VinDecodeDto?> DecodeAsync(
            string vin,
            CancellationToken cancellationToken = default)
        {
            string encodedVin =
                Uri.EscapeDataString(vin);


            var response =
                await _httpClient.GetAsync(
                    $"vehicles/DecodeVinValues/{encodedVin}?format=json",
                    cancellationToken);


            response.EnsureSuccessStatusCode();


            var data =
                await response.Content
                    .ReadFromJsonAsync<VpicResponse>(
                        cancellationToken:
                            cancellationToken);


            var result =
                data?.Results.FirstOrDefault();


            if (result == null)
            {
                return null;
            }


            int? modelYear = null;

            if (int.TryParse(
                result.ModelYear,
                out int parsedYear))
            {
                modelYear = parsedYear;
            }


            return new VinDecodeDto
            {
                Vin = result.Vin,

                Make = result.Make,

                Model = result.Model,

                ModelYear = modelYear,

                VehicleType = result.VehicleType,

                BodyClass = result.BodyClass,

                FuelType = result.FuelTypePrimary,

                TransmissionStyle =
                    result.TransmissionStyle,

                DriveType = result.DriveType,

                PlantCountry = result.PlantCountry,

                ErrorCode = result.ErrorCode,

                ErrorText = result.ErrorText
            };
        }


        private class VpicResponse
        {
            [JsonPropertyName("Results")]
            public List<VpicResult> Results { get; set; }
                = new();
        }


        private class VpicResult
        {
            [JsonPropertyName("VIN")]
            public string Vin { get; set; }
                = string.Empty;

            [JsonPropertyName("Make")]
            public string Make { get; set; }
                = string.Empty;

            [JsonPropertyName("Model")]
            public string Model { get; set; }
                = string.Empty;

            [JsonPropertyName("ModelYear")]
            public string ModelYear { get; set; }
                = string.Empty;

            [JsonPropertyName("VehicleType")]
            public string VehicleType { get; set; }
                = string.Empty;

            [JsonPropertyName("BodyClass")]
            public string BodyClass { get; set; }
                = string.Empty;

            [JsonPropertyName("FuelTypePrimary")]
            public string FuelTypePrimary { get; set; }
                = string.Empty;

            [JsonPropertyName("TransmissionStyle")]
            public string TransmissionStyle { get; set; }
                = string.Empty;

            [JsonPropertyName("DriveType")]
            public string DriveType { get; set; }
                = string.Empty;

            [JsonPropertyName("PlantCountry")]
            public string PlantCountry { get; set; }
                = string.Empty;

            [JsonPropertyName("ErrorCode")]
            public string ErrorCode { get; set; }
                = string.Empty;

            [JsonPropertyName("ErrorText")]
            public string ErrorText { get; set; }
                = string.Empty;
        }
    }
}