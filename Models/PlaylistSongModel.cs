using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Tesina.Models
{
    public class PlaylistSong
    {
        
        public int IdSong { get; set; }
        
        public int IdPlaylist { get; set; }
    }
}
