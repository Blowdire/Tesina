using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Tesina.Models;
using Tesina.Data;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.WebUtilities;
using System.Net.Http.Headers;
using System.Net;
using Newtonsoft.Json;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Objects;

namespace Tesina.Controllers
{
    public class SongsController : Controller
    {
        private readonly ApplicationDbContext _context;
        private UserManager<ApplicationUser> _userManager;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly SignInManager<ApplicationUser> _signInManager;


        public SongsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IHostingEnvironment hostingEnvironment, SignInManager<ApplicationUser> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _hostingEnvironment = hostingEnvironment;
            _signInManager = signInManager;
        }

        // GET: Songs
        [Authorize]
        public async Task<IActionResult> Index(int? id)
        {
            if (id != null)
            {
                var song = _context.Song.Where(item => item.ID == id).First();

                if (song.UserId == _userManager.GetUserId(User))
                {
                    Byte[] bytes = System.IO.File.ReadAllBytes(song.Filepath);
                    String file = Convert.ToBase64String(bytes);
                    ViewData["base64"] = file;
                }
            }
            var userId = _userManager.GetUserId(User);
            var userToken = _context.Users.Where(item => item.UserId == userId).First().Token;
            ViewData["UserToken"] = userToken;
            var playlists = await _context.PlayList.Where(item => item.UserId == _userManager.GetUserId(User)).ToListAsync();
            ViewData["Playlists"] = playlists;
            return View(await _context.Song.Where(item => item.UserId == _userManager.GetUserId(User)).ToListAsync());
        }

        [HttpGet]
        [Authorize]
        public async Task<IEnumerable<object>> prova()
        {
            var userId = _userManager.GetUserId(User);
            List<object> lista = new List<object>();
            var prova = (await _context.Song.Where(item => item.UserId == _userManager.GetUserId(User)).ToListAsync());
            var userToken = _context.Users.Where(item => item.UserId == userId).First().Token;
            foreach (var item in prova)
            {
                lista.Add(new { item.ID, userToken, item.AlbumArtBig, item.Title, item.Artist, item.Album, item.Genre });
            }
            return lista;
        }

        [HttpGet]
        [Authorize]
        public async Task<IEnumerable<Playlist>> provaPlaylist()
        {
            var playlists = await _context.PlayList.Where(item => item.UserId == _userManager.GetUserId(User)).ToListAsync();
            return playlists;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Playlist()
        {
            var playlists = _context.PlayList.Where(item => item.UserId == _userManager.GetUserId(User)).ToList();
            return View(playlists);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> getPlaylist(int id)
        {
            var ricerca = _context.PlayListSong.Where(item => item.IdPlaylist == id).ToList();
            var playlist = _context.PlayList.Where(item => item.Id == id).First();
            ViewData["Title"] = playlist.Nome;
            ViewData["id"] = playlist.Id;
            var idCanzoni = _context.PlayListSong.Select(item => item.IdSong).ToList();
            var songs = _context.Song.Where(x => idCanzoni.Contains(x.ID)).ToList();
            var userId = _userManager.GetUserId(User);
            var userToken = _context.Users.Where(item => item.UserId == userId).First().Token;
            ViewData["UserToken"] = userToken;
            return View(songs);
        }

        [HttpPost]
        [Authorize]
        public async Task<string> song2playlist(int songId, int playlistId)
        {
            var song = _context.Song.Where(item => item.ID == songId).First();
            var playlist = _context.PlayList.Where(item => item.Id == playlistId).First();
            var userid = _userManager.GetUserId(User);

            var songpl = new PlaylistSong { IdPlaylist = playlistId, IdSong = songId };
            if (song.UserId != userid) return "Negato";
            if (playlist.UserId != userid) return "Negato";
            if (_context.PlayListSong.Any(x => x.IdPlaylist == playlistId && x.IdSong == songId)) return "canzone gia presente nella playlist";
            else
            {

                _context.PlayListSong.Add(songpl);
                _context.SaveChanges();
                return "Success";
            }

        }

        // GET: Songs/Details/5
        [Authorize]
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var song = await _context.Song
                .SingleOrDefaultAsync(m => m.ID == id);
            if (song == null)
            {
                return NotFound();
            }

            return View(song);
        }

        // GET: Songs/Create
        [Authorize]
        public IActionResult Create()
        {
            return View();
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> Create([Bind("ID,Title,ReleaseDate,Genre,Price,SongFile")] Song song)
        {
            if (ModelState.IsValid)
            {
                _context.Add(song);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(song);
        }

        [HttpPost]
        [Authorize]
        public void createPlaylist([Bind("Nome")]Playlist playlist)
        {
            playlist.UserId = _userManager.GetUserId(User);
            _context.Add(playlist);
            _context.SaveChanges();
            return;
        }
        //progressbar upload---------------------------------------------------------

        [HttpPost]

        [DisableRequestSizeLimit]
        [RequestSizeLimit(1000000000)]
        public async Task<string> Upload(List<IFormFile> files)
        {
            long size = files.Sum(f => f.Length);
            // full path to file in temp location
            var filePath = Path.GetTempFileName();
            var id = _userManager.GetUserId(User);
            var path = _hostingEnvironment.ContentRootPath + "\\wwwroot\\" + id;
            try
            {
                foreach (var formFile in files)
                {
                    if (formFile.Length > 0)
                    {
                        using (var stream = new FileStream(path + formFile.FileName, FileMode.Create))
                        {
                            await formFile.CopyToAsync(stream);

                        }

                        Song song = new Song();
                        _context.Song.Add(new Song { Title = formFile.FileName.Substring(0, formFile.FileName.Length - 4), Filepath = path + formFile.FileName, UserId = id, filename = formFile.FileName });
                        await _context.SaveChangesAsync();

                    }
                }
                return "success";
            }
            catch (Exception ex)
            {
                _context.Errors.Add(new ErrorModel { errore = ex.Message });
                _context.SaveChanges();
                return "Error";
            }
        }

        // GET: Songs/Edit/5
        [Authorize]
        public IActionResult Play(int id)
        {
            var song = _context.Song.Where(item => item.ID == id).First();
            if (song.UserId == _userManager.GetUserId(User))
            {
                Byte[] bytes = System.IO.File.ReadAllBytes(song.Filepath);
                String file = Convert.ToBase64String(bytes);
                ViewData["base64"] = file;
            }
            else
            {
                return RedirectToAction(nameof(Index));
            }
            return View();
        }

        [Authorize]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var song = await _context.Song.SingleOrDefaultAsync(m => m.ID == id);
            if (song == null)
            {
                return NotFound();
            }
            return View(song);
        }

        [HttpGet]
        [ProducesResponseType(206)]
        [Authorize]
        public FileStreamResult streaming(int? id)
        {
            var song = _context.Song.Where(item => item.ID == id).First();

            if (song.UserId == _userManager.GetUserId(User))
            {

                var stream = System.IO.File.OpenRead(song.Filepath);
                return new FileStreamResult(stream, "audio/mp3");

            }
            return null;
        }

        [HttpPost]
        [Authorize]
        public async Task Edit(int id, string titolo, string artista)
        {
            try
            {
                titolo = titolo.Trim();
                artista = artista.Trim();
                Song c = (from x in _context.Song
                          where x.ID == id
                          select x).First();
                c.Title = titolo;
                c.Artist = artista;
                if (titolo != null && artista != null)
                {
                    try
                    {
                        var client = new LastfmClient("71465dd8f4ec55f6df53ff7b015c9ba1", "9f6aa87f2e9636875073a6e0b0904954");
                        var response = await client.Track.GetInfoAsync(titolo, artista);
                        LastTrack track = response.Content;
                        var alb = await client.Album.GetInfoAsync(track.ArtistName, track.AlbumName);
                        LastAlbum album = alb.Content;
                        c.Title = track.Name;
                        c.Artist = track.ArtistName;
                        c.Album = album.Name;
                        //c.ReleaseDate =DateTime.Parse(album.ReleaseDateUtc.ToString());
                        c.AlbumArtSmall = album.Images.Small.ToString();
                        c.AlbumArtMedium = album.Images.Medium.ToString();
                        c.AlbumArtBig = album.Images.Large.ToString();
                    }
                    catch (Exception ex)
                    {
                        c.Title = titolo;
                        c.Artist = artista;
                    }

                    _context.SaveChanges();
                }
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                _context.Errors.Add(new ErrorModel { errore = ex.Message });
                _context.SaveChanges();
            }

        }

        [HttpPost]
        [Authorize]
        public async Task<IEnumerable<object>> dynamicSearch(string searchString)
        {
            var userId = _userManager.GetUserId(User);
            List<object> lista = new List<object>();
            var userToken = _context.Users.Where(item => item.UserId == userId).First().Token;

            if (searchString == null)
            {
                var provalista = await _context.Song.Where(item => item.UserId == _userManager.GetUserId(User)).ToListAsync();
                foreach (var item in provalista)
                {
                    lista.Add(new { item.ID, userToken, item.AlbumArtBig, item.Title, item.Artist, item.Album, item.Genre });
                }
                return lista;
            }
            else
            {
                var prova = (await _context.Song.Where(item => item.UserId == _userManager.GetUserId(User) && item.Title.ToLower().Contains(searchString.ToLower())).ToListAsync());

                var provArtist = await _context.Song.Where(item => item.UserId == _userManager.GetUserId(User) && item.Artist.ToLower().Contains(searchString.ToLower())).ToListAsync();

                var provAlbum = await _context.Song.Where(item => item.UserId == _userManager.GetUserId(User) && item.Album.ToLower().Contains(searchString.ToLower())).ToListAsync();

                foreach (var item in prova)
                {
                    object newitem = new { item.ID, userToken, item.AlbumArtBig, item.Title, item.Artist, item.Album, item.Genre };
                    if (!lista.Contains(newitem))
                    {
                        lista.Add(newitem);
                    }
                }
                foreach (var item in provArtist)
                {
                    object newitem = new { item.ID, userToken, item.AlbumArtBig, item.Title, item.Artist, item.Album, item.Genre };
                    if (!lista.Contains(newitem))
                    {
                        lista.Add(newitem);
                    }
                }
                foreach (var item in provAlbum)
                {
                    object newitem = new { item.ID, userToken, item.AlbumArtBig, item.Title, item.Artist, item.Album, item.Genre };
                    if (!lista.Contains(newitem))
                    {
                        lista.Add(newitem);
                    }
                    
                }
                return lista;
            }

        }

        // GET: Songs/Delete/5
        [Authorize]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var song = await _context.Song
                .SingleOrDefaultAsync(m => m.ID == id);

            if (song == null)
            {
                return NotFound();
            }

            return View(song);
        }

        // POST: Songs/Delete/5
        [HttpPost, ActionName("Delete")]
        [Authorize]
        public string DeleteConfirmed(int id)
        {
            try
            {
                var song = _context.Song.SingleOrDefault(m => m.ID == id);
                var path = song.Filepath;
                System.IO.File.Delete(path);
                _context.Song.Remove(song);
                _context.SaveChanges();
                return "Success";
            }
            catch (Exception ex)
            {
                _context.Errors.Add(new ErrorModel { errore = ex.Message });
                _context.SaveChanges();
            }
            return null;
        }

        [HttpPost]
        [Authorize]
        public string deleteSongPlaylistplaylist(int songID,int playlistID)
        {
            return songID.ToString() + " " + playlistID.ToString() ;
        }

        private bool SongExists(int id)
        {
            return _context.Song.Any(e => e.ID == id);
        }
    }
}
