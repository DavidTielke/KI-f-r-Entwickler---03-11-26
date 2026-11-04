using System.ComponentModel.DataAnnotations;

namespace PersonenApi.Dtos;

public class PersonRequest
{
    [Required(ErrorMessage = "Name ist erforderlich.")]
    [StringLength(150, ErrorMessage = "Name darf höchstens 150 Zeichen haben.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Alter ist erforderlich.")]
    [Range(0, 150, ErrorMessage = "Alter muss zwischen 0 und 150 liegen.")]
    public int Age { get; set; }

    public int? PetId { get; set; }
}
