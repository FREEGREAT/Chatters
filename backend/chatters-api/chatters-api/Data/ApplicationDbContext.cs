using chatters_api.Models;
using Microsoft.EntityFrameworkCore;


namespace chatters_api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Message> Messages { get; set; } = null!; // Коллекция сообщений

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Message>()
                .Property(m => m.Timestamp)
                .HasDefaultValueSql("GETUTCDATE()"); 
        }
    }
}