using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/persons")]
public class PersonsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonResponse>>> GetPersons()
    {
        var l_persons = await db.Persons
            .OrderBy(p => p.Order)
            .ThenBy(p => p.Name)
            .Select(p => new PersonResponse(p.Id, p.Name, p.Age))
            .ToListAsync();

        return Ok(l_persons);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PersonResponse>> GetPerson(int id)
    {
        var l_person = await db.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (l_person is null)
        {
            return NotFound();
        }

        return Ok(new PersonResponse(l_person.Id, l_person.Name, l_person.Age));
    }

    [HttpPost]
    public async Task<ActionResult<PersonResponse>> CreatePerson(PersonRequest request)
    {
        if (request.PetId is { } l_petId)
        {
            var l_requestedPet = await db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == l_petId);
            if (l_requestedPet is null)
            {
                return BadRequest("Das Haustier existiert nicht.");
            }

            if (l_requestedPet.PersonId is not null)
            {
                return BadRequest("Das Haustier ist bereits einer anderen Person zugeordnet.");
            }
        }

        var l_nextOrder = await db.Persons.CountAsync() + 1;

        var l_person = new Person
        {
            Name = request.Name.Trim(),
            Age = request.Age,
            Order = l_nextOrder
        };

        db.Persons.Add(l_person);
        await db.SaveChangesAsync();

        if (request.PetId is { } l_linkedPetId)
        {
            var l_pet = await db.Pets.SingleAsync(p => p.Id == l_linkedPetId);
            l_pet.PersonId = l_person.Id;
            await db.SaveChangesAsync();
        }

        var l_response = new PersonResponse(l_person.Id, l_person.Name, l_person.Age);

        return CreatedAtAction(nameof(GetPerson), new { id = l_person.Id }, l_response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePerson(int id, PersonRequest request)
    {
        var l_person = await db.Persons.FirstOrDefaultAsync(p => p.Id == id);
        if (l_person is null)
        {
            return NotFound();
        }

        if (request.PetId is { } l_targetPetId)
        {
            var l_targetPet = await db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == l_targetPetId);
            if (l_targetPet is null)
            {
                return BadRequest("Das Haustier existiert nicht.");
            }

            if (l_targetPet.PersonId is not null && l_targetPet.PersonId != l_person.Id)
            {
                return BadRequest("Das Haustier ist bereits einer anderen Person zugeordnet.");
            }
        }

        l_person.Name = request.Name.Trim();
        l_person.Age = request.Age;

        if (request.PetId is { } l_newPetId)
        {
            var l_newPet = await db.Pets.SingleAsync(p => p.Id == l_newPetId);
            var l_previousPet = await db.Pets.FirstOrDefaultAsync(p => p.PersonId == l_person.Id && p.Id != l_newPetId);
            if (l_previousPet is not null)
            {
                l_previousPet.PersonId = null;
            }

            l_newPet.PersonId = l_person.Id;
        }
        else
        {
            var l_currentPet = await db.Pets.FirstOrDefaultAsync(p => p.PersonId == l_person.Id);
            if (l_currentPet is not null)
            {
                l_currentPet.PersonId = null;
            }
        }

        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePerson(int id)
    {
        var l_person = await db.Persons.FirstOrDefaultAsync(p => p.Id == id);
        if (l_person is null)
        {
            return NotFound();
        }

        db.Persons.Remove(l_person);
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("reorder")]
    public async Task<IActionResult> UpdatePersonsPosition(PersonPositionRequest request)
    {
        var l_ids = request.Ids.Distinct().ToList();
        if (l_ids.Count == 0 || l_ids.Count != request.Ids.Count)
        {
            return BadRequest("Reihenfolge enthält doppelte oder fehlende Einträge.");
        }

        var l_persons = await db.Persons
            .Where(p => l_ids.Contains(p.Id))
            .ToListAsync();

        if (l_persons.Count != l_ids.Count)
        {
            return BadRequest("Reihenfolge enthält unbekannte Personen.");
        }

        var l_byId = l_persons.ToDictionary(p => p.Id);
        for (var l_i = 0; l_i < l_ids.Count; l_i++)
        {
            l_byId[l_ids[l_i]].Order = l_i + 1;
        }

        await db.SaveChangesAsync();

        return NoContent();
    }
}
