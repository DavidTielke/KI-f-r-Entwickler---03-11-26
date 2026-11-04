using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonenApi.Data;
using PersonenApi.Dtos;
using PersonenApi.Models;

namespace PersonenApi.Controllers;

[ApiController]
[Route("api/pets")]
public class PetsController(PersonDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetDto>>> GetPets()
    {
        var pets = await db.Pets
            .OrderBy(p => p.Name)
            .ThenBy(p => p.Id)
            .Include(p => p.Person)
            .ToListAsync();

        var result = pets
            .Select(p => new PetDto(p.Id, p.Name, p.Species, p.PersonId, p.Person?.Name))
            .ToList();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PetDto>> GetPet(int id)
    {
        var pet = await db.Pets.AsNoTracking().Include(p => p.Person).FirstOrDefaultAsync(p => p.Id == id);
        if (pet is null)
        {
            return NotFound();
        }

        return Ok(new PetDto(pet.Id, pet.Name, pet.Species, pet.PersonId, pet.Person?.Name));
    }

    [HttpPost]
    public async Task<ActionResult<PetDto>> CreatePet(PetRequest request)
    {
        if (request.PersonId is int pid)
        {
            if (await db.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.Id == pid) is null)
            {
                return BadRequest("Die Person existiert nicht.");
            }

            if (await db.Pets.AsNoTracking().AnyAsync(p => p.PersonId == pid))
            {
                return BadRequest("Die Person hat bereits ein Haustier.");
            }
        }

        var pet = new Pet
        {
            Name = request.Name.Trim(),
            Species = request.Species!.Value,
            PersonId = request.PersonId
        };

        db.Pets.Add(pet);
        await db.SaveChangesAsync();

        string? personName = null;
        if (request.PersonId is int linkedPid)
        {
            personName = await db.Persons.AsNoTracking().Where(p => p.Id == linkedPid).Select(p => p.Name).FirstAsync();
        }

        return CreatedAtAction(nameof(GetPet), new { id = pet.Id }, new PetDto(pet.Id, pet.Name, pet.Species, pet.PersonId, personName));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePet(int id, PetRequest request)
    {
        var pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == id);
        if (pet is null)
        {
            return NotFound();
        }

        if (request.PersonId is int targetPid)
        {
            if (await db.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.Id == targetPid) is null)
            {
                return BadRequest("Die Person existiert nicht.");
            }

            if (await db.Pets.AsNoTracking().AnyAsync(p => p.PersonId == targetPid && p.Id != id))
            {
                return BadRequest("Die Person hat bereits ein Haustier.");
            }
        }

        pet.Name = request.Name.Trim();
        pet.Species = request.Species!.Value;
        pet.PersonId = request.PersonId;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        var pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == id);
        if (pet is null)
        {
            return NotFound();
        }

        db.Pets.Remove(pet);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
