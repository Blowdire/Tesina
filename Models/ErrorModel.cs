using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Tesina.Models
{
    public class ErrorModel
    {
        [Key]
        public int pkErrore { get; set; }
        public string errore { get; set; }
    }
}
