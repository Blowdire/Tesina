using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tesina.Models
{
    public class Song
    {
        public int ID { get; set; }
        public string Title { get; set; }
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime ReleaseDate { get; set; }
        public string Genre { get; set; }
        public string Album { get; set; }
        public string Artist { get; set; }
        public decimal Price { get; set; }
        public string filename { get; set; }
        public string Filepath { get; set; }
        public string UserId { get; set; }
        public string AlbumArtSmall { get; set; }
        public string AlbumArtMedium { get; set; }
        public string AlbumArtBig { get; set; }
        //[ForeignKey("UserId")]
        //public virtual ApplicationUser User { get; set; }

    }
}
