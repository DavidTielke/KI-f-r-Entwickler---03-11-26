namespace PersonenApi.Models;

public class Person
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public int Order { get; set; }
    public Pet? Pet { get; set; }
}
