using Backend.Data;
using Microsoft.EntityFrameworkCore;

var l_builder = WebApplication.CreateBuilder(args);

l_builder.Services.AddOpenApi();
l_builder.Services.AddControllers();

var l_connectionString = l_builder.Configuration.GetConnectionString("PersonsDb")
    ?? "Data Source=persons.db";

l_builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(l_connectionString));

const string frontendOrigin = "http://localhost:5173";
l_builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy => policy
        .WithOrigins(frontendOrigin)
        .AllowAnyMethod()
        .AllowAnyHeader());
});

var l_app = l_builder.Build();

using (var l_scope = l_app.Services.CreateScope())
{
    var l_db = l_scope.ServiceProvider.GetRequiredService<AppDbContext>();
    l_db.Database.Migrate();
}

if (l_app.Environment.IsDevelopment())
{
    l_app.MapOpenApi();
}

l_app.UseCors("AllowFrontend");
l_app.MapControllers();

// Test-only: exists only with EnableTestEndpoints=true and only resets *.tests.db files.
if (l_app.Configuration["EnableTestEndpoints"] == "true")
{
    l_app.MapPost("/api/testdata/reset", async (AppDbContext db) =>
    {
        if (!l_connectionString.EndsWith(".tests.db", StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest("Der Reset ist nur gegen eine Testdatenbank (.tests.db) erlaubt.");
        }

        await TestData.Reset(db);

        return Results.Ok();
    });
}

l_app.Run();
