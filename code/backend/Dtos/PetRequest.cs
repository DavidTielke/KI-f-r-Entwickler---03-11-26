using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PersonenApi.Models;

namespace PersonenApi.Dtos;

public class PetRequest
{
    [Required(ErrorMessage = "Name ist erforderlich.")]
    [StringLength(150, ErrorMessage = "Name darf höchstens 150 Zeichen haben.")]
    public string Name { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    [Required(ErrorMessage = "Spezies ist erforderlich.")]
    public PetSpecies? Species { get; set; }

    public int? PersonId { get; set; }
}
