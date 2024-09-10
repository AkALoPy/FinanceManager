using System;
using System.ComponentModel.DataAnnotations; 

namespace FinanceManagerApi.Models
{
    public class Expense
    {
        public int Id { get; set; }

        [Required]  
        public string? Name { get; set; }

        [Required] 
        public decimal Amount { get; set; }

        [Required]
        [DataType(DataType.DateTime)]  
        public DateTime Date { get; set; }  

        public string? Category { get; set; }
    }
}