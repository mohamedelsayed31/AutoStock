using AutoStock.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Helpers;

public sealed class SqlServerTestDatabase
    : IAsyncDisposable
{
    public string ConnectionString { get; }


    private SqlServerTestDatabase(
        string connectionString)
    {
        ConnectionString =
            connectionString;
    }


    public static async Task<SqlServerTestDatabase>
        CreateAsync()
    {
        var databaseName =
            $"AutoStock_Concurrency_Test_{Guid.NewGuid():N}";


        var connectionString =
            $"Server=localhost;" +
            $"Database={databaseName};" +
            $"Trusted_Connection=True;" +
            $"TrustServerCertificate=True;" +
            $"MultipleActiveResultSets=True;";


        var database =
            new SqlServerTestDatabase(
                connectionString);


        await using var context =
            database.CreateContext();


        /*
         * Apply the real AutoStock migrations
         * to a temporary SQL Server database.
         */
        await context.Database
            .MigrateAsync();


        return database;
    }


    public AppDbContext CreateContext()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer(
                    ConnectionString)
                .Options;


        return new AppDbContext(
            options);
    }


    public async ValueTask DisposeAsync()
    {
        await using var context =
            CreateContext();


        await context.Database
            .EnsureDeletedAsync();
    }
}