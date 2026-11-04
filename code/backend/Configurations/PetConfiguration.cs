using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonenApi.Models;

namespace PersonenApi.Configurations;

public class PetConfiguration : IEntityTypeConfiguration<Pet>
{
    public void Configure(EntityTypeBuilder<Pet> builder)
    {
        builder.ToTable("Pets");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedOnAdd();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(p => p.Species)
            .IsRequired()
            .HasConversion(
                s => s.ToString(),
                s => Enum.Parse<PetSpecies>(s));

        builder.HasOne(p => p.Person)
            .WithOne(p => p.Pet)
            .HasForeignKey<Pet>(p => p.PersonId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(p => p.PersonId).IsUnique();
    }
}
