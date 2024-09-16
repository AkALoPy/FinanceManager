using FinanceManagerApi.Data;
using FinanceManagerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly FinanceDbContext _context;

        public ExpensesController(FinanceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
        {
            return await _context.Expenses.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);

            if (expense == null)
            {
                return NotFound();
            }

            return expense;
        }

        [HttpPost]
        public async Task<ActionResult<Expense>> AddExpense([FromBody] Expense expense)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            expense.Date = expense.Date.ToUniversalTime();

            if (expense.recurringExpense && expense.RecurrenceEndDate.HasValue)
            {
                expense.RecurrenceEndDate = expense.RecurrenceEndDate.Value.ToUniversalTime();
            }

            _context.Expenses.Add(expense);

            if (expense.recurringExpense && expense.RecurrenceInterval != null && expense.RecurrenceEndDate != null)
            {
                DateTime nextDate = expense.Date;
                while (nextDate < expense.RecurrenceEndDate.Value)
                {
                    nextDate = nextDate.AddDays(GetRecurrenceIntervalDays(expense.RecurrenceInterval));
                    if (nextDate <= expense.RecurrenceEndDate.Value)
                    {
                        var newExpense = new Expense
                        {
                            Name = expense.Name,
                            Amount = expense.Amount,
                            Category = expense.Category,
                            Date = nextDate.ToUniversalTime(),
                            recurringExpense = true,
                            RecurrenceInterval = expense.RecurrenceInterval,
                            RecurrenceEndDate = expense.RecurrenceEndDate.Value.ToUniversalTime()
                        };
                        _context.Expenses.Add(newExpense);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }

        [HttpGet("monthly-total")]
        public async Task<ActionResult<decimal>> GetMonthlyTotal()
        {
            try
            {
                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                var monthlyTotal = await _context.Expenses
                    .Where(expense => expense.Date.Month == currentMonth && expense.Date.Year == currentYear)
                    .SumAsync(expense => expense.Amount);

                Console.WriteLine($"Monthly Total: {monthlyTotal}"); 

                return Ok(monthlyTotal);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calculating monthly total: {ex.Message}"); 
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, [FromBody] Expense expense)
        {
            if (id != expense.Id)
            {
                return BadRequest();
            }

            expense.Date = expense.Date.ToUniversalTime();

            if (expense.recurringExpense && expense.RecurrenceEndDate.HasValue)
            {
                expense.RecurrenceEndDate = expense.RecurrenceEndDate.Value.ToUniversalTime();
            }

            _context.Entry(expense).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExpenseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ExpenseExists(int id)
        {
            return _context.Expenses.Any(e => e.Id == id);
        }

        private int GetRecurrenceIntervalDays(string interval)
        {
            return interval.ToLower() switch
            {
                "daily" => 1,
                "weekly" => 7,
                "biweekly" => 14,
                "monthly" => 30,
                _ => 0,
            };
        }
    }
}
