using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CasaDescanso.Domain.Entities;

[Table("Incidents")]
public class Incident
{
    public int Id { get; set; }

    public int ResidentId { get; set; }
    public Resident Resident { get; set; } = null!;

    public int RegisteredByUserId { get; set; }
    public UserAccount RegisteredByUser { get; set; } = null!;

    public DateTime Date { get; set; }

    [Required, MaxLength(100)]
    public string Type { get; set; } = null!;

    [Required, MaxLength(50)]
    public string SeverityLevel { get; set; } = null!;

    [Required]
    public string Description { get; set; } = null!;

    public bool Resolved { get; set; } = false;

    public DateTime? ResolvedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
