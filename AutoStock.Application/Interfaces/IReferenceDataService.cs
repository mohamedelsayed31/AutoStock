using AutoStock.Application.DTOs.Common;

namespace AutoStock.Application.Interface
{
    public interface IReferenceDataService
    {
        Task<IEnumerable<LookupDto>>
            GetBrandsAsync();

        Task<IEnumerable<LookupDto>>
            GetCategoriesAsync();

        Task<IEnumerable<LookupDto>>
            GetSuppliersAsync();
    }
}