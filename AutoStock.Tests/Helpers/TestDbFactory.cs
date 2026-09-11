using AutoStock.Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace AutoStock.Tests.Helpers;

public static class TestDbFactory
{
    public static async Task<TestDatabase>
        CreateAsync()
    {
        var connection =
            new SqliteConnection(
                "Data Source=:memory:");

        await connection.OpenAsync();


        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite(connection)
                .Options;


        var context =
            new AppDbContext(
                options);


        await context.Database
            .EnsureCreatedAsync();


        return new TestDatabase(
            context,
            connection);
    }
}


public sealed class TestDatabase
    : IAsyncDisposable
{
    public AppDbContext Context { get; }

    private readonly SqliteConnection
        _connection;


    public TestDatabase(
        AppDbContext context,
        SqliteConnection connection)
    {
        Context =
            context;

        _connection =
            connection;
    }


    public async ValueTask DisposeAsync()
    {
        await Context
            .DisposeAsync();

        await _connection
            .DisposeAsync();
    }
}