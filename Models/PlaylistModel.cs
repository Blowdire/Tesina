using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Tesina.Models
{
    public class Playlist
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; }
        public string UserId { get; set; }
    }
}
