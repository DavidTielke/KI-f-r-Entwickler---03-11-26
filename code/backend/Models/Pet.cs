namespace PersonenApi.Models;

public class Pet
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public PetSpecies Species { get; set; }
    public int? PersonId { get; set; }
    public Person? Person { get; set; }
}

public enum PetSpecies
{
    Hund,
    Katze,
    Vogel,
    Dinosaurier
}
