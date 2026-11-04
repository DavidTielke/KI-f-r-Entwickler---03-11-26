namespace Backend.Models;

public class Pet
{
    public int Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public int? PersonId { get; set; }
}
