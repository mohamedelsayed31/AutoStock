using AutoStock.Domain.Entities;
using AutoStock.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Infrastructure.Data
{
    public class AppDbContext
        : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }


        /* =========================
           DbSets
        ========================= */

        public DbSet<Car> Cars
            => Set<Car>();

        public DbSet<Brand> Brands
            => Set<Brand>();

        public DbSet<Category> Categories
            => Set<Category>();

        public DbSet<Supplier> Suppliers
            => Set<Supplier>();

        public DbSet<StockTransaction> StockTransactions
            => Set<StockTransaction>();

        public DbSet<Customer> Customers
            => Set<Customer>();

        public DbSet<Sale> Sales
            => Set<Sale>();

        public DbSet<SaleItem> SaleItems
            => Set<SaleItem>();

        public DbSet<AuditLog> AuditLogs
            => Set<AuditLog>();

        public DbSet<Notification> Notifications
            => Set<Notification>();

        public DbSet<PurchaseOrder> PurchaseOrders
            => Set<PurchaseOrder>();

        public DbSet<PurchaseOrderItem> PurchaseOrderItems
            => Set<PurchaseOrderItem>();


        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(
                modelBuilder);


            /* =========================
               Customer
            ========================= */

            modelBuilder.Entity<Customer>(
                entity =>
                {
                    entity.HasKey(
                        customer =>
                            customer.Id);


                    entity.Property(
                            customer =>
                                customer.FullName)
                        .IsRequired()
                        .HasMaxLength(
                            150);


                    entity.Property(
                            customer =>
                                customer.PhoneNumber)
                        .IsRequired()
                        .HasMaxLength(
                            30);


                    entity.Property(
                            customer =>
                                customer.Email)
                        .HasMaxLength(
                            200);


                    entity.Property(
                            customer =>
                                customer.Address)
                        .HasMaxLength(
                            500);


                    entity.Property(
                            customer =>
                                customer.CreatedAt)
                        .IsRequired();
                });


            /* =========================
               Sale
            ========================= */

            modelBuilder.Entity<Sale>(
                entity =>
                {
                    entity.HasKey(
                        sale =>
                            sale.Id);


                    entity.Property(
                            sale =>
                                sale.SaleDate)
                        .IsRequired();


                    entity.Property(
                            sale =>
                                sale.PaymentMethod)
                        .IsRequired();


                    entity.Property(
                            sale =>
                                sale.TotalAmount)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            sale =>
                                sale.Notes)
                        .HasMaxLength(
                            1000);


                    entity.HasOne(
                            sale =>
                                sale.Customer)
                        .WithMany(
                            customer =>
                                customer.Sales)
                        .HasForeignKey(
                            sale =>
                                sale.CustomerId)
                        .OnDelete(
                            DeleteBehavior.Restrict);


                    entity.HasIndex(
                        sale =>
                            sale.CustomerId);


                    entity.HasIndex(
                        sale =>
                            sale.SaleDate);
                });


            /* =========================
               Sale Item
            ========================= */

            modelBuilder.Entity<SaleItem>(
                entity =>
                {
                    entity.HasKey(
                        item =>
                            item.Id);


                    entity.Property(
                            item =>
                                item.Quantity)
                        .IsRequired();


                    entity.Property(
                            item =>
                                item.UnitPrice)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            item =>
                                item.LineTotal)
                        .HasPrecision(
                            18,
                            2);


                    /* =========================
                       Cost Accounting
                    ========================= */

                    entity.Property(
                            item =>
                                item.UnitCost)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            item =>
                                item.CostOfGoodsSold)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            item =>
                                item.GrossProfit)
                        .HasPrecision(
                            18,
                            2);


                    entity.HasOne(
                            item =>
                                item.Sale)
                        .WithMany(
                            sale =>
                                sale.SaleItems)
                        .HasForeignKey(
                            item =>
                                item.SaleId)
                        .OnDelete(
                            DeleteBehavior.Cascade);


                    entity.HasOne(
                            item =>
                                item.Car)
                        .WithMany()
                        .HasForeignKey(
                            item =>
                                item.CarId)
                        .OnDelete(
                            DeleteBehavior.Restrict);


                    entity.HasIndex(
                        item =>
                            item.SaleId);


                    entity.HasIndex(
                        item =>
                            item.CarId);
                });


            /* =========================
               Audit Log
            ========================= */

            modelBuilder.Entity<AuditLog>(
                entity =>
                {
                    entity.HasKey(
                        log =>
                            log.Id);


                    entity.Property(
                            log =>
                                log.UserId)
                        .HasMaxLength(
                            450);


                    entity.Property(
                            log =>
                                log.UserEmail)
                        .HasMaxLength(
                            256);


                    entity.Property(
                            log =>
                                log.Action)
                        .IsRequired()
                        .HasMaxLength(
                            50);


                    entity.Property(
                            log =>
                                log.EntityName)
                        .IsRequired()
                        .HasMaxLength(
                            100);


                    entity.Property(
                            log =>
                                log.EntityId)
                        .HasMaxLength(
                            100);


                    entity.Property(
                            log =>
                                log.Details)
                        .HasMaxLength(
                            1000);


                    entity.Property(
                            log =>
                                log.CreatedAt)
                        .IsRequired();


                    entity.HasIndex(
                        log =>
                            log.CreatedAt);


                    entity.HasIndex(
                        log =>
                            log.UserId);
                });


            /* =========================
               Notification
            ========================= */

            modelBuilder.Entity<Notification>(
                entity =>
                {
                    entity.HasKey(
                        notification =>
                            notification.Id);


                    entity.Property(
                            notification =>
                                notification.RecipientUserId)
                        .IsRequired()
                        .HasMaxLength(
                            450);


                    entity.Property(
                            notification =>
                                notification.Type)
                        .IsRequired();


                    entity.Property(
                            notification =>
                                notification.Title)
                        .IsRequired()
                        .HasMaxLength(
                            150);


                    entity.Property(
                            notification =>
                                notification.Message)
                        .IsRequired()
                        .HasMaxLength(
                            500);


                    entity.Property(
                            notification =>
                                notification.EntityName)
                        .HasMaxLength(
                            100);


                    entity.Property(
                            notification =>
                                notification.EntityId)
                        .HasMaxLength(
                            100);


                    entity.Property(
                            notification =>
                                notification.CreatedAt)
                        .IsRequired();


                    entity.HasIndex(
                        notification =>
                            notification.RecipientUserId);


                    entity.HasIndex(
                        notification =>
                            notification.CreatedAt);


                    entity.HasIndex(
                        notification =>
                            new
                            {
                                notification.RecipientUserId,
                                notification.IsRead
                            });
                });


            /* =========================
               Purchase Order
            ========================= */

            modelBuilder.Entity<PurchaseOrder>(
                entity =>
                {
                    entity.HasKey(
                        order =>
                            order.Id);


                    entity.Property(
                            order =>
                                order.TotalAmount)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            order =>
                                order.Notes)
                        .HasMaxLength(
                            1000);


                    entity.HasOne(
                            order =>
                                order.Supplier)
                        .WithMany(
                            supplier =>
                                supplier.PurchaseOrders)
                        .HasForeignKey(
                            order =>
                                order.SupplierId)
                        .OnDelete(
                            DeleteBehavior.Restrict);


                    entity.HasIndex(
                        order =>
                            order.SupplierId);


                    entity.HasIndex(
                        order =>
                            order.OrderDate);


                    entity.HasIndex(
                        order =>
                            order.Status);
                });


            /* =========================
               Purchase Order Item
            ========================= */

            modelBuilder.Entity<PurchaseOrderItem>(
                entity =>
                {
                    entity.HasKey(
                        item =>
                            item.Id);


                    entity.Property(
                            item =>
                                item.UnitCost)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            item =>
                                item.LineTotal)
                        .HasPrecision(
                            18,
                            2);


                    entity.HasOne(
                            item =>
                                item.PurchaseOrder)
                        .WithMany(
                            order =>
                                order.Items)
                        .HasForeignKey(
                            item =>
                                item.PurchaseOrderId)
                        .OnDelete(
                            DeleteBehavior.Cascade);


                    entity.HasOne(
                            item =>
                                item.Car)
                        .WithMany(
                            car =>
                                car.PurchaseOrderItems)
                        .HasForeignKey(
                            item =>
                                item.CarId)
                        .OnDelete(
                            DeleteBehavior.Restrict);


                    entity.HasIndex(
                        item =>
                            item.PurchaseOrderId);


                    entity.HasIndex(
                        item =>
                            item.CarId);
                });

            /* =========================
   Stock Transaction
========================= */

            modelBuilder.Entity<StockTransaction>(
                entity =>
                {
                    entity.HasKey(
                        transaction =>
                            transaction.Id);


                    entity.Property(
                            transaction =>
                                transaction.TransactionType)
                        .IsRequired()
                        .HasMaxLength(
                            20);


                    entity.Property(
                            transaction =>
                                transaction.Quantity)
                        .IsRequired();


                    entity.Property(
                            transaction =>
                                transaction.TransactionDate)
                        .IsRequired();


                    entity.Property(
                            transaction =>
                                transaction.UnitCost)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            transaction =>
                                transaction.InventoryValue)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            transaction =>
                                transaction.SourceType)
                        .HasMaxLength(
                            30);


                    entity.Property(
                            transaction =>
                                transaction.Notes)
                        .HasMaxLength(
                            250);


                    entity.HasOne(
                            transaction =>
                                transaction.Car)
                        .WithMany(
                            car =>
                                car.StockTransactions)
                        .HasForeignKey(
                            transaction =>
                                transaction.CarId)
                        .OnDelete(
                            DeleteBehavior.Restrict);


                    entity.HasIndex(
                        transaction =>
                            transaction.CarId);


                    entity.HasIndex(
                        transaction =>
                            transaction.TransactionDate);


                    entity.HasIndex(
                        transaction =>
                            new
                            {
                                transaction.SourceType,
                                transaction.SourceId
                            });
                });

            /* =========================
               Car
            ========================= */

            modelBuilder.Entity<Car>(
                entity =>
                {
                    entity.Property(
                            car =>
                                car.Price)
                        .HasPrecision(
                            18,
                            2);


                    entity.Property(
                            car =>
                                car.AverageUnitCost)
                        .HasPrecision(
                            18,
                            2);
                });
        }
    }
}