using AutoStock.Application.DTOs.Notifications;
using AutoStock.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class NotificationsController
    : ControllerBase
{
    private readonly INotificationService
        _notificationService;


    public NotificationsController(
        INotificationService notificationService)
    {
        _notificationService =
            notificationService;
    }


    /* =========================================
       My Notifications
    ========================================= */

    [HttpGet]
    public async Task<
        ActionResult<
            IReadOnlyList<NotificationDto>>>
        GetMine(
            [FromQuery] int take = 20)
    {
        var notifications =
            await _notificationService
                .GetMineAsync(
                    take);


        return Ok(
            notifications
        );
    }


    /* =========================================
       Unread Count
    ========================================= */

    [HttpGet("unread-count")]
    public async Task<ActionResult<object>>
        GetUnreadCount()
    {
        var count =
            await _notificationService
                .GetUnreadCountAsync();


        return Ok(
            new
            {
                count
            });
    }


    /* =========================================
       Mark As Read
    ========================================= */

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult>
        MarkAsRead(
            int id)
    {
        var updated =
            await _notificationService
                .MarkAsReadAsync(
                    id);


        if (!updated)
        {
            return NotFound(
                new
                {
                    detail =
                        "Notification not found."
                });
        }


        return NoContent();
    }


    /* =========================================
       Mark All As Read
    ========================================= */

    [HttpPatch("read-all")]
    public async Task<ActionResult<object>>
        MarkAllAsRead()
    {
        var updatedCount =
            await _notificationService
                .MarkAllAsReadAsync();


        return Ok(
            new
            {
                updatedCount
            });
    }
}