using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Dtos;

public record PersonResponse(
    [property: JsonInclude] int Id,
    [property: JsonInclude] string Name,
    [property: JsonInclude] int Age);

public class PersonRequest
{
    [JsonInclude]
    [Required(ErrorMessage = "Name ist erforderlich.")]
    [StringLength(150, ErrorMessage = "Name darf höchstens 150 Zeichen haben.")]
    public string Name { get; set; } = string.Empty;

    [JsonInclude]
    [Required(ErrorMessage = "Alter ist erforderlich.")]
    [Range(0, 150, ErrorMessage = "Alter muss zwischen 0 und 150 liegen.")]
    public int Age { get; set; }

    [JsonInclude]
    public int? PetId { get; set; }
}

public class PersonPositionRequest
{
    [JsonInclude]
    [Required(ErrorMessage = "Reihenfolge ist erforderlich.")]
    public IReadOnlyList<int> Ids { get; set; } = [];
}
