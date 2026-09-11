using AutoStock.Application.DTOs.Vin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.Interfaces
{
    public interface IVinDecoderService
    {
        Task<VinDecodeDto?> DecodeAsync(
            string vin,
            CancellationToken cancellationToken = default);
    }
}
