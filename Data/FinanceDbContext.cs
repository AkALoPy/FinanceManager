using Microsoft.EntityFrameworkCore;
using FinanceManagerApi.Models;

namespace FinanceManagerApi.Data
{
    public class FinanceDbContext : DbContext
    {
        public FinanceDbContext(DbContextOptions<FinanceDbContext> options) : base(options) { }

        public DbSet<Expense> Expenses { get; set; }
    }
}
