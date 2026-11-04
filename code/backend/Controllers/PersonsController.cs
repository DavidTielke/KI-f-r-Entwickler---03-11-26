using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonenApi.Data;
using PersonenApi.Dtos;
using PersonenApi.Models;

namespace PersonenApi.Controllers;

[ApiController]
[Route("api/persons")]
public class PersonsController(PersonDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonDto>>> GetPersons()
    {
        var persons = await db.Persons
            .OrderBy(p => p.Order)
            .ThenBy(p => p.Name)
            .Select(p => new PersonDto(p.Id, p.Name, p.Age))
            .ToListAsync();

        return Ok(persons);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PersonDto>> GetPerson(int id)
    {
        var person = await db.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (person is null)
        {
            return NotFound();
        }

        return Ok(new PersonDto(person.Id, person.Name, person.Age));
    }

    [HttpPost]
    public async Task<ActionResult<PersonDto>> CreatePerson(PersonRequest request)
    {
        if (request.PetId is int petId)
        {
            var requestedPet = await db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == petId);
            if (requestedPet is null)
            {
                return BadRequest("Das Haustier existiert nicht.");
            }

            if (requestedPet.PersonId is not null)
            {
                return BadRequest("Das Haustier ist bereits einer anderen Person zugeordnet.");
            }
        }

        var nextOrder = await db.Persons.CountAsync() + 1;

        var person = new Person
        {
            Name = request.Name.Trim(),
            Age = request.Age,
            Order = nextOrder
        };

        db.Persons.Add(person);
        await db.SaveChangesAsync();

        if (request.PetId is int linkedPetId)
        {
            var pet = await db.Pets.SingleAsync(p => p.Id == linkedPetId);
            pet.PersonId = person.Id;
            await db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetPerson), new { id = person.Id }, new PersonDto(person.Id, person.Name, person.Age));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePerson(int id, PersonRequest request)
    {
        var person = await db.Persons.FirstOrDefaultAsync(p => p.Id == id);
        if (person is null)
        {
            return NotFound();
        }

        if (request.PetId is int targetPetId)
        {
            var targetPet = await db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == targetPetId);
            if (targetPet is null)
            {
                return BadRequest("Das Haustier existiert nicht.");
            }

            if (targetPet.PersonId is not null && targetPet.PersonId != person.Id)
            {
                return BadRequest("Das Haustier ist bereits einer anderen Person zugeordnet.");
            }
        }

        person.Name = request.Name.Trim();
        person.Age = request.Age;

        if (request.PetId is int newPetId)
        {
            var newPet = await db.Pets.SingleAsync(p => p.Id == newPetId);
            var previousPet = await db.Pets.FirstOrDefaultAsync(p => p.PersonId == person.Id && p.Id != newPetId);
            if (previousPet is not null)
            {
                previousPet.PersonId = null;
            }

            newPet.PersonId = person.Id;
        }
        else
        {
            var currentPet = await db.Pets.FirstOrDefaultAsync(p => p.PersonId == person.Id);
            if (currentPet is not null)
            {
                currentPet.PersonId = null;
            }
        }

        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePerson(int id)
    {
        var person = await db.Persons.FirstOrDefaultAsync(p => p.Id == id);
        if (person is null)
        {
            return NotFound();
        }

        db.Persons.Remove(person);
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("reorder")]
    public async Task<IActionResult> ReorderPersons(PersonReorderRequest request)
    {
        var ids = request.Ids.Distinct().ToList();
        if (ids.Count == 0 || ids.Count != request.Ids.Count)
        {
            return BadRequest("Reihenfolge enthält doppelte oder fehlende Einträge.");
        }

        var persons = await db.Persons
            .Where(p => ids.Contains(p.Id))
            .ToListAsync();

        if (persons.Count != ids.Count)
        {
            return BadRequest("Reihenfolge enthält unbekannte Personen.");
        }

        var byId = persons.ToDictionary(p => p.Id);
        for (var i = 0; i < ids.Count; i++)
        {
            byId[ids[i]].Order = i + 1;
        }

        await db.SaveChangesAsync();

        return NoContent();
    }
}
