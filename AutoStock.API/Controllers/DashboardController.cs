using AutoStock.Application.DTOs.Dashboard;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController
        : ControllerBase
    {
        private readonly IDashboardService
            _dashboardService;


        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService =
                dashboardService;
        }


        [HttpGet]
        [ProducesResponseType(
            typeof(DashboardDto),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult>
            GetDashboard()
        {
            var result =
                await _dashboardService
                    .GetDashboardAsync();

            return Ok(result);
        }
    }
}