using System.ComponentModel.DataAnnotations;

namespace PersonenApi.Dtos;

public class PersonReorderRequest
{
    [Required(ErrorMessage = "Reihenfolge ist erforderlich.")]
    public List<int> Ids { get; set; } = [];
}
