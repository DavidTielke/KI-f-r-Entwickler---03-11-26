namespace Backend.Models;

public class Person
{
    public int Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public int Order { get; set; }
}
