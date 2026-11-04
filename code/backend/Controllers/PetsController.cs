using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/pets")]
public class PetsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetResponse>>> GetPets()
    {
        var l_pets = await ToResponses(db.Pets.OrderBy(p => p.Name).ThenBy(p => p.Id)).ToListAsync();

        return Ok(l_pets);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PetResponse>> GetPet(int id)
    {
        var l_pet = await ToResponses(db.Pets.Where(p => p.Id == id)).FirstOrDefaultAsync();
        if (l_pet is null)
        {
            return NotFound();
        }

        return Ok(l_pet);
    }

    [HttpPost]
    public async Task<ActionResult<PetResponse>> CreatePet(PetRequest request)
    {
        if (request.PersonId is { } l_pid)
        {
            if (await db.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.Id == l_pid) is null)
            {
                return BadRequest("Die Person existiert nicht.");
            }

            if (await db.Pets.AsNoTracking().AnyAsync(p => p.PersonId == l_pid))
            {
                return BadRequest("Die Person hat bereits ein Haustier.");
            }
        }

        var l_pet = new Pet
        {
            Name = request.Name.Trim(),
            Species = request.Species,
            PersonId = request.PersonId
        };

        db.Pets.Add(l_pet);
        await db.SaveChangesAsync();

        var l_response = await ToResponses(db.Pets.Where(p => p.Id == l_pet.Id)).FirstAsync();

        return CreatedAtAction(nameof(GetPet), new { id = l_pet.Id }, l_response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePet(int id, PetRequest request)
    {
        var l_pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == id);
        if (l_pet is null)
        {
            return NotFound();
        }

        if (request.PersonId is { } l_targetPid)
        {
            if (await db.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.Id == l_targetPid) is null)
            {
                return BadRequest("Die Person existiert nicht.");
            }

            if (await db.Pets.AsNoTracking().AnyAsync(p => p.PersonId == l_targetPid && p.Id != id))
            {
                return BadRequest("Die Person hat bereits ein Haustier.");
            }
        }

        l_pet.Name = request.Name.Trim();
        l_pet.Species = request.Species;
        l_pet.PersonId = request.PersonId;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        var l_pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == id);
        if (l_pet is null)
        {
            return NotFound();
        }

        db.Pets.Remove(l_pet);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<PetResponse> ToResponses(IQueryable<Pet> pets)
    {
        return pets.Select(p => new PetResponse(
            p.Id,
            p.Name,
            p.Species,
            p.PersonId,
            db.Persons.Where(person => person.Id == p.PersonId).Select(person => person.Name).FirstOrDefault()));
    }
}
