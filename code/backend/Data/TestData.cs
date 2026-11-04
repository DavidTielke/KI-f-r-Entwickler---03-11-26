using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class TestData
{
    /// <summary>
    /// Test-only: leert die Testdatenbank, setzt die Zähler zurück und füllt den
    /// deterministischen Basisdatensatz neu.
    /// </summary>
    public static async Task Reset(AppDbContext db)
    {
        await using var l_transaction = await db.Database.BeginTransactionAsync();

        await db.Database.ExecuteSqlRawAsync("""
            DELETE FROM "Pets";
            DELETE FROM "Persons";
            """);

        var l_sequenceTableExists = await db.Database
            .SqlQueryRaw<int>("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'")
            .ToListAsync();
        if (l_sequenceTableExists.Count > 0)
        {
            await db.Database.ExecuteSqlRawAsync("""
                DELETE FROM sqlite_sequence WHERE name IN ('Persons', 'Pets');
                """);
        }

        // Order 3 ist doppelt belegt und bewusst in umgekehrter Id-Reihenfolge
        // (Id 4 sortiert nach Name vor Id 3), damit das Backend-Sortierkriterium
        // "gleicher Order-Wert -> Name" im UI testbar ist.
        db.Persons.AddRange(
            new Person { Id = 1, Name = "Anna Berger", Age = 34, Order = 1 },
            new Person { Id = 2, Name = "Jonas Weber", Age = 41, Order = 2 },
            new Person { Id = 3, Name = "Tom Krüger", Age = 55, Order = 3 },
            new Person { Id = 4, Name = "Maria Schneider", Age = 28, Order = 3 });

        db.Pets.AddRange(
            new Pet { Id = 1, Name = "Fiete", Species = "Hund", PersonId = 1 },
            new Pet { Id = 2, Name = "Minka", Species = "Katze", PersonId = 4 },
            new Pet { Id = 3, Name = "Rex", Species = "Hund", PersonId = null });

        await db.SaveChangesAsync();
        await l_transaction.CommitAsync();
    }
}
