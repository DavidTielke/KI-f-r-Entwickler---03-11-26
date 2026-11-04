using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Data.Configurations;

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
            .IsRequired();

        builder.HasOne<Person>()
            .WithOne()
            .HasForeignKey<Pet>(p => p.PersonId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(p => p.PersonId).IsUnique();
    }
}
