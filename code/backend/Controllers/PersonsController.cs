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
        var nextOrder = await db.Persons.CountAsync() + 1;

        var person = new Person
        {
            Name = request.Name.Trim(),
            Age = request.Age,
            Order = nextOrder
        };

        db.Persons.Add(person);
        await db.SaveChangesAsync();

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

        person.Name = request.Name.Trim();
        person.Age = request.Age;
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

        for (var i = 0; i < persons.Count; i++)
        {
            persons[i].Order = i + 1;
        }

        await db.SaveChangesAsync();

        return NoContent();
    }
}
