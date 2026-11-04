using System.Text.Json.Serialization;
using PersonenApi.Models;

namespace PersonenApi.Dtos;

public record PetDto(
    int Id,
    string Name,
    [property: JsonConverter(typeof(JsonStringEnumConverter))] PetSpecies Species,
    int? PersonId,
    string? PersonName);
