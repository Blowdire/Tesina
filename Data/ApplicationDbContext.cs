using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Tesina.Models;

namespace Tesina.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<PlaylistSong>().HasKey(c => new { c.IdPlaylist, c.IdSong });
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
        }

        public DbSet<Tesina.Models.Song> Song { get; set; }
        public DbSet<Tesina.Models.Playlist> PlayList { get; set; }
        public DbSet<Tesina.Models.PlaylistSong> PlayListSong { get; set; }
        public DbSet<Tesina.Models.User> Users { get; set; }
        public DbSet<Tesina.Models.ErrorModel> Errors { get; set; }
    }
}
