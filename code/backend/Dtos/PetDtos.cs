using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Dtos;

public record PetResponse(
    [property: JsonInclude] int Id,
    [property: JsonInclude] string Name,
    [property: JsonInclude] string Species,
    [property: JsonInclude] int? PersonId,
    [property: JsonInclude] string? PersonName);

public class PetRequest
{
    [JsonInclude]
    [Required(ErrorMessage = "Name ist erforderlich.")]
    [StringLength(150, ErrorMessage = "Name darf höchstens 150 Zeichen haben.")]
    public string Name { get; set; } = string.Empty;

    [JsonInclude]
    [Required(ErrorMessage = "Spezies ist erforderlich.")]
    [RegularExpression("^(Hund|Katze|Vogel|Dinosaurier)$", ErrorMessage = "Spezies ist ungültig.")]
    public string Species { get; set; } = string.Empty;

    [JsonInclude]
    public int? PersonId { get; set; }
}
