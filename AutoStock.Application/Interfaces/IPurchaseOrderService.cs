using AutoStock.Application.DTOs.PurchaseOrders;

namespace AutoStock.Application.Interface;

public interface IPurchaseOrderService
{
    Task<IReadOnlyList<PurchaseOrderDto>>
        GetAllAsync();


    Task<PurchaseOrderDto?>
        GetByIdAsync(
            int id);


    Task<SupplierPurchaseHistoryDto?>
    GetSupplierHistoryAsync(
        int supplierId);


    Task<PurchaseOrderDto>
        CreateAsync(
            CreatePurchaseOrderDto dto);


    Task<bool>
        SubmitAsync(
            int id);


    Task<bool>
        CancelAsync(
            int id);


    Task<bool>
        ReceiveAsync(
            int id);
}