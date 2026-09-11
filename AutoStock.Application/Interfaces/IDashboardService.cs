using AutoStock.Application.DTOs.Dashboard;

namespace AutoStock.Application.Interface
{
    public interface IDashboardService
    {
        Task<DashboardDto>
            GetDashboardAsync();
    }
}