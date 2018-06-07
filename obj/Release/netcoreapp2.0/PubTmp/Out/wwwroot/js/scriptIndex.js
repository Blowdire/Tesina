var currentPlaying;
var nextPlaying;
var currentTr;
var nextTr;
function uploadFiles(inputId) {
    //alert(inputId)
    var input = document.getElementById(inputId);
    var files = input.files;
    var formData = new FormData();

    for (var i = 0; i != files.length; i++) {
        formData.append("files", files[i]);
    }
    alert("ciao");
    startUpdatingProgressIndicator();
    $.ajax(
        {
            url: "http://80.211.174.166:8000/Songs/Upload_prog",
            data: formData,
            processData: false,
            contentType: false,
            type: "POST",
            success: function (data) {
                stopUpdatingProgressIndicator();
                alert("Files Uploaded!");
            }
        }
    );
}
function startUpdatingProgressIndicator() {

    intervalId = setInterval(
        function () {
            // We use the POST requests here to avoid caching problems (we could use the GET requests and disable the cache instead)
            $.post(
                "http://80.211.174.166:8000/Songs/progress",
                function (progress) {
                    $("#progress").html(progress + "%");
                }
            );
        },
        10
    );
}

function stopUpdatingProgressIndicator() {
    clearInterval(intervalId);
}
//pannello update setup dati precedenti

$(document).ready(function () {
    $(".update").click(function () {
        var id = $(this).attr("name");
        var title = $(this).attr("title");
        var Artist = $(this).attr("artist");
        $("#updateTitle").val(title);
        $("#updateArtist").val(Artist);
        $("#dragUpdate").fadeToggle("fast");
        $("#updateId").attr("value", id);

    });
    //------------------------------------------
    //chiamata ajax per modifica dati file
    $("#buttonUpdate").click(function () {
        var id = $("#updateId").val();
        var song = { "id": id, "titolo": $("#updateTitle").val(), "artista": $("#updateArtist").val() };
        $.ajax({
            url: 'http://80.211.174.166:8000/Songs/edit/',
            type: 'POST',
            data: song,
            success: function (result) {
                //location.reload();
                $(".drag").slideUp();
                createList();
                
            }
        });
    });
    //---------------------------------------------------------
    //togli canzone da playlist
    $("#deleteSongPlaylist").click(function () {
        var songID = $("#deleteId").val();
        var playlistID = $("#deleteplID").val();
        var data = {
            "songID": songID, "playlistID": playlistID
        };
        $.ajax({
            url: 'http://80.211.174.166:8000/Songs/deleteSongPlaylistplaylist/',
            type='POST',
            data: data,
            success: function (data) {
                console.log(data);
            }
        });
    });
    //download della canzone
    $(".download").click(function () {
        var id = $(this).attr("name");
        var token = $(this).attr("token");
        window.open('http://80.211.174.166:61000/download/' + id + '/' + token, '_blank');
    });
    //---------------------------------------------------------
    //mostra pannello elimina
    $(".deletePL").click(function () {
        var idpl = $(this).attr("idpl");
        var id = $(this).attr("name");
        $("#dragDelete").fadeToggle("fast");
        $("#deleteId").attr("value", id);
        $("#deleteplID").attr("value", idpl);
    });
    //mostra pannello elimina
    $(".delete").click(function () {
        var id = $(this).attr("name");
        $("#dragDelete").fadeToggle("fast");
        $("#deleteId").attr("value", id);
    });
    //eliminazione canzone  dalla playlist
    $("#deleteSongPlaylist").click(function () {
        var songID = $("#deleteId").val();
        var playlistID = $("#deleteplID").val();
    });
    //---------------------------------------------------------
    //mostra pannello playlist
    $(".createPlaylist").click(function () {
        $("#dragPlaylist").fadeToggle();
    });
    //---------------------------------------------------------
    //chiamata ajax per eliminare canzone
    $("#deleteSong").click(function () {
        var id = $("#deleteId").val();
        $.ajax({
            url: 'http://80.211.174.166:8000/Songs/delete/',
            type: 'POST',
            data: { id: id },
            success: function (result) {
                //location.reload();
                $(".drag").slideUp();
                createList();
            }
        });
    });
    //---------------------------------------------------------
    //boh
    $(".drag").click(function () {
        $(this).css("z-index", "999");

    });
    //---------------------------------------------------------
    //fa partire la canzone successiva
    $('#player').on('ended', function () {

        $(currentTr).css("background-color", "transparent");
        $(currentTr).bind("mouseenter", backgroundEnter);
        $(currentTr).bind("mouseleave", backgroundLeave);
        currentPlaying = nextPlaying;
        currentTr = nextTr;
        nextTr = $(currentTr).closest('tr').next('tr');
        nextPlaying = $(nextTr).attr("name");
        $(currentTr).css("background-color", 'rgba(0, 68, 225,.4)');
        $(currentTr).unbind("mouseenter");
        $(currentTr).unbind("mouseleave");
        $("#albumArt").attr("src", "http://80.211.174.166:61000/greyImage");
        var albumart = $(currentTr).attr("imgbig");
        if (albumart) {
            $("#albumArt").attr("src", albumart);
        }
        $("#playing").html($(currentTr).attr("titolo"));
        var token = $(currentTr).attr("token");
        $('#player').attr("src", 'http://80.211.174.166:61000/stream/' + currentPlaying + '/' + token);

    });
    //---------------------------------------
    //evento cella click
    $(".cella").click(function () {
        var trParent = $(this).closest("tr");
        var id = $(trParent).attr("name");
        var token = $(trParent).attr("token");
        var albumart = $(trParent).attr("imgbig");
        $('#player').attr("src", 'http://80.211.174.166:61000/stream/' + id + '/' + token);
        $("#albumArt").attr("src", albumart);
        currentPlaying = id;
        currentTr = $(trParent);
        $(".trInner").bind("mouseenter", backgroundEnter);
        $(".trInner").bind("mouseleave", backgroundLeave);
        $(".trInner").css("background-color", 'transparent');
        $("#playing").html($(trParent).attr("titolo"));
        $(trParent).unbind("mouseenter");
        $(trParent).unbind("mouseleave");
        $(trParent).css("background-color", 'rgba(0, 68, 225,.4)');
        nextTr = $(trParent).closest('tr').next('tr');
        nextPlaying = $(trParent).closest('tr').next('tr').attr("name");
    });
    //dynamic search search bar
    $(".searchBar").on("change paste keyup", function () {
        var searchString = $(this).val();
        console.log(searchString);
        var data = {"searchString": searchString};
        $.ajax({
            url: 'http://80.211.174.166:8000/Songs/dynamicSearch',
            type: 'POST',
            data:data,
            success: function (data) {
                $("#tBody").empty();
                $.each(data, function (index) {
                    console.log(data[index]);
                    if (data[index].title == null) {
                        data[index].title = "";
                    }
                    if (data[index].artist == null) {
                        data[index].artist = "";
                    }
                    if (data[index].album == null) {
                        data[index].album = "";
                    }
                    if (data[index].albumArtBig == null) {
                        data[index].albumArtBig = "";
                    }
                    $("#tBody").append('<tr class="trInner" name="' + data[index].id + '" token="' + data[index].userToken + '" imgbig="' + data[index].albumArtBig + '" titolo="' + data[index].title + '"><td class="cella">' + data[index].title + '</td><td class="cella">' + data[index].artist + '</td><td class="cella">' + data[index].album + '</td><td><div style="float:left;width:100%"><button style= "cursor:pointer;width:48%;font-size:90%" title= "' + data[index].title + '" artist= "' + data[index].artist + '" genre= "' + data[index].genre + '" name= "' + data[index].id + '" class="update"> Modifica</button> <br class="break" /><button style="cursor:pointer;width:48%;font-size:90%" name="' + data[index].id + '" class="delete">Elimina</button></div ><br /><br /><div style="float:left;width:100%"><button style= "width:48%;font-size:90%" class="download" name= "' + data[index].id + '" token= "' + data[index].userToken + '"> Download</button > <br class="break" /><button style="width:48%;font-size:90%" name="' + data[index].id + '" class="openContext">Aggiungi alla Playlist</button> <br /> <div class="context" canzone="' + data[index].id + '" ></div></div></td></tr>');
                })
                $(".trInner").bind("click", trinnerClickHadler);
                $(".trInner").bind("mouseenter", backgroundEnter);
                $(".trInner").bind("mouseleave", backgroundLeave);
                $(".update").bind("click", buttonUpdateClickHandler);
                $(".delete").bind("click", buttonEliminaClickHandler);
                $(".download").bind("click", buttonDownloadClickHandler);
                $(".openContext").bind("click", buttonOpenContextClickHandler);
                $.ajax({
                    url: 'http://80.211.174.166:8000/Songs/provaPlaylist',
                    type: 'GET',
                    success: function (data) {
                        $(".context").empty();
                        $.each(data, function (index) {
                            $(".context").each(function () {
                                var songID = $(this).closest('div').attr('canzone');
                                $(this).append('<button style="width:45%;right:0;margin-right:3%;font-size:0.9vw;float:right;" class="addToPlaylist" song="' + songID + '" key="' + data[index].id + '">' + data[index].nome + '</button><br /><br />');
                            });
                        });
                        $(".addToPlaylist").bind("click", buttonAddToPlaylistClickHandler);
                    }
                });
            }
        });
        $(".trInner").bind("click", trinnerClickHadler);
    });
    //----------------------------------------------------------
    //eliminazione focus txtsearch
    $(".searchBar").mouseleave(function () {
        $(this).blur();
    });
    //---------------------------------------------------------
    //funzione cambia sfondo per entrata mouse
    var backgroundEnter = function () {
        $(this).css('background-color', 'rgba(0, 68, 225,.6)');
    }
    //---------------------------------------------------------
    //funzione ripristina sfondo mouse lascia
    var backgroundLeave = function () {
        $(this).css('background-color', 'transparent');
    }
    //---------------------------------------------------------
    //mostra menu contestuale per playlist
    $(".openContext").click(function () {
        $(this).next().next().slideToggle();
        $("#player").stop();
    });
    //---------------------------------------------------------
    //fa partire la canzone cliccata
    //$(".trInner").click(function () {
    //    var id = $(this).attr("name");
    //    var token = $(this).attr("token");
    //    var albumart = $(this).attr("imgbig");
    //    $('#player').attr("src", 'http://80.211.174.166:61000/stream/' + id + '/' + token);
    //    $("#albumArt").attr("src", albumart);
    //    currentPlaying = id;
    //    currentTr = $(this);
    //    $(".trInner").bind("mouseenter", backgroundEnter);
    //    $(".trInner").bind("mouseleave", backgroundLeave);
    //    $(".trInner").css("background-color", 'transparent');
    //    $("#playing").html($(this).attr("titolo"));
    //    $(this).unbind("mouseenter");
    //    $(this).unbind("mouseleave");
    //    $(this).css("background-color", 'rgba(0, 68, 225,.4)');
    //    nextTr = $(this).closest('tr').next('tr');
    //    nextPlaying = $(this).closest('tr').next('tr').attr("name");

    //});
    //---------------------------------------------------------
    function createList() {
        $.ajax({
            url: 'http://80.211.174.166:8000/Songs/prova',
            type: 'GET',
            success: function (data) {
                $("#tBody").empty();
                $.each(data, function (index) {
                    console.log(data[index]);
                    if (data[index].title == null) {
                        data[index].title = "";
                    }
                    if (data[index].artist == null) {
                        data[index].artist = "";
                    }
                    if (data[index].album == null) {
                        data[index].album = "";
                    }
                    if (data[index].albumArtBig == null) {
                        data[index].albumArtBig = "";
                    }
                    $("#tBody").append('<tr class="trInner" name="' + data[index].id + '" token="' + data[index].userToken + '" imgbig="' + data[index].albumArtBig + '" titolo="' + data[index].title + '"><td class="cella">' + data[index].title + '</td><td class="cella">' + data[index].artist + '</td><td class="cella">' + data[index].album + '</td><td><div style="float:left;width:100%"><button style= "cursor:pointer;width:48%;font-size:90%" title= "' + data[index].title + '" artist= "' + data[index].artist + '" genre= "' + data[index].genre + '" name= "' + data[index].id + '" class="update"> Modifica</button> <br class="break" /><button style="cursor:pointer;width:48%;font-size:90%" name="' + data[index].id + '" class="delete">Elimina</button></div ><br /><br /><div style="float:left;width:100%"><button style= "width:48%;font-size:90%" class="download" name= "' + data[index].id + '" token= "' + data[index].userToken + '"> Download</button > <br class="break" /><button style="width:48%;font-size:90%" name="' + data[index].id + '" class="openContext">Aggiungi alla Playlist</button> <br /> <div class="context" canzone="' + data[index].id + '" ></div></div></td></tr>');
                })
                $(".trInner").bind("click", trinnerClickHadler);
                $(".trInner").bind("mouseenter", backgroundEnter);
                $(".trInner").bind("mouseleave", backgroundLeave);
                $(".update").bind("click", buttonUpdateClickHandler);
                $(".delete").bind("click", buttonEliminaClickHandler);
                $(".download").bind("click", buttonDownloadClickHandler);
                $(".openContext").bind("click", buttonOpenContextClickHandler);
                $.ajax({
                    url: 'http://80.211.174.166:8000/Songs/provaPlaylist',
                    type: 'GET',
                    success: function (data) {
                        $(".context").empty();
                        $.each(data, function (index) {
                            $(".context").each(function () {
                                var songID = $(this).closest('div').attr('canzone');
                                $(this).append('<button style="width:45%;right:0;margin-right:3%;font-size:0.9vw;float:right;" class="addToPlaylist" song="' + songID + '" key="' + data[index].id + '">' + data[index].nome + '</button><br /><br />');
                            });
                        });
                        $(".addToPlaylist").bind("click", buttonAddToPlaylistClickHandler);
                    }
                });
            }
        });
    }

    //---------------------------------------------------------
    //event handler trInner click
    var trinnerClickHadler = function () {
        var id = $(this).attr("name");
        var token = $(this).attr("token");
        var albumart = $(this).attr("imgbig");
        $('#player').attr("src", 'http://80.211.174.166:61000/stream/' + id + '/' + token);
        if (!albumart) {
            $("#albumArt").attr("src", "http://80.211.174.166:61000/greyImage");
        }
        else {
            $("#albumArt").attr("src", albumart);
        }
        currentPlaying = id;
        currentTr = $(this);
        $(".trInner").bind("mouseenter", backgroundEnter);
        $(".trInner").bind("mouseleave", backgroundLeave);
        $(".trInner").css("background-color", 'transparent');
        $("#playing").html($(this).attr("titolo"));
        $(this).unbind("mouseenter");
        $(this).unbind("mouseleave");
        $(this).css("background-color", 'rgba(0, 68, 225,.4)');
        nextTr = $(this).closest('tr').next('tr');
        nextPlaying = $(this).closest('tr').next('tr').attr("name");
    }
    //---------------------------------------------------------
    //event handler click bottone modifica
    var buttonUpdateClickHandler = function () {
        var id = $(this).attr("name");
        var title = $(this).attr("title");
        var Artist = $(this).attr("artist");
        $("#updateTitle").val(title);
        $("#updateArtist").val(Artist);
        $("#dragUpdate").fadeToggle("fast");
        $("#updateId").attr("value", id);
    }
    //---------------------------------------------------------
    //event handler click bottone elimina
    var buttonEliminaClickHandler = function () {
        var id = $(this).attr("name");
        $("#dragDelete").fadeToggle("fast");
        $("#deleteId").attr("value", id);
    }
    //---------------------------------------------------------
    //event handler click bottone download
    var buttonDownloadClickHandler = function () {
        var id = $(this).attr("name");
        var token = $(this).attr("token");
        window.open('http://80.211.174.166:61000/download/' + id + '/' + token, '_blank');
    }
    //---------------------------------------------------------
    //event handler bottone openContext
    var buttonOpenContextClickHandler = function () {
        $(this).next().next().slideToggle();
        $("#player").stop();
    }
    //---------------------------------------------------------
    //event handler bottone aggiungi a playlist
    var buttonAddToPlaylistClickHandler = function () {
        var playId = $(this).attr("key");
        var songId = $(this).attr("song");
        var data = {
            "songId": songId, "playlistId": playId
        };
        $.post("songs/song2playlist", data).success(function (data) {
            alert(data);
        }
        ).fail(function () {
            alert("Error");
        });

    }
    //---------------------------------------------------------
    var audio;
    //---------------------------------------------------------

    //aggiunta degli eventi per l'hover delle righe
    $(".trInner").bind("mouseenter", backgroundEnter);
    $(".trInner").bind("mouseleave", backgroundLeave);
    //---------------------------------------------------------
    //chiamata ajax per aggiunta playlist
    $(".addToPlaylist").click(function () {
        var playId = $(this).attr("key");
        var songId = $(this).attr("song");
        var data = {
            "songId": songId, "playlistId": playId
        };
        $.post("songs/song2playlist", data).success(function (data) {
            alert(data);
        }
        ).fail(function () {
            alert("Error");
        });

    });
    //---------------------------------------------------------
    //vecchie funzioni per play() musica
    $(".button").click(function () {
        var vid = document.getElementById("player");
        var id = $(this).attr("name");
        $('#player').attr("src", 'http://80.211.174.166:8000/Songs/streaming/' + id);
    });
    $(".secondo").click(function () {
        var id = $(this).attr("name");
        $('#player').attr("src", 'http://80.211.174.166:8000/Songs/streaming/' + id);

    });
    //----------------------------------------------------------
    //funzione creazione lista----------------------------------
   

    //---------------------------------------------------------

    //mostra upload di nuovi files
    $("#circular").click(function () {
        $("#draggable").fadeToggle("fast");

    });
    //---------------------------------------------------------
    //chiude pannello draggable
    $(".closeButton").click(function () {
        $(this).parent().slideUp();
    });
    //---------------------------------------------------------
    //pulsante canzone precedente
    $(".prevButton").click(function () {
        var prev = $(currentTr).closest(".trInner").prev();
        $(currentTr).css("background-color", "transparent");
        $(currentTr).bind("mouseenter", backgroundEnter);
        $(currentTr).bind("mouseleave", backgroundLeave);
        nextPlaying = currentPlaying;
        currentPlaying = prev.attr("name");
        nextTr = currentTr;
        currentTr = prev;
        $(currentTr).css("background-color", 'rgba(0, 68, 225,.4)');
        $(currentTr).unbind("mouseenter");
        $(currentTr).unbind("mouseleave");
        $("#albumArt").attr("src", "http://80.211.174.166:61000/greyImage");
        var albumart = $(currentTr).attr("imgbig");
        if (albumart) {
            $("#albumArt").attr("src", albumart);
        }
        $("#playing").html($(currentTr).attr("titolo"));
        var token = $(currentTr).attr("token");
        $('#player').attr("src", 'http://80.211.174.166:61000/stream/' + currentPlaying + '/' + token);
    });
    //---------------------------------------------------------
    //pulsante canzone successiva
    $(".nextButton").click(function () {
        $(currentTr).css("background-color", "transparent");
        $(currentTr).bind("mouseenter", backgroundEnter);
        $(currentTr).bind("mouseleave", backgroundLeave);
        currentPlaying = nextPlaying;
        currentTr = nextTr;
        nextTr = $(currentTr).closest('tr').next('tr');
        nextPlaying = $(nextTr).attr("name");
        $(currentTr).css("background-color", 'rgba(0, 68, 225,.4)');
        $(currentTr).unbind("mouseenter");
        $(currentTr).unbind("mouseleave");
        $("#albumArt").attr("src", "http://80.211.174.166:61000/greyImage");
        var albumart = $(currentTr).attr("imgbig");
        if (albumart) {
            $("#albumArt").attr("src", albumart);
        }
        $("#playing").html($(currentTr).attr("titolo"));
        var token = $(currentTr).attr("token");
        $('#player').attr("src", 'http://80.211.174.166:61000/stream/' + currentPlaying + '/' + token);
    });
    //---------------------------------------------------------
    //chiamata ajax creazione di nuova playlist
    $("#creaPlaylist").click(function () {
        var name = $("#playlistName").val();
        var playlist = { Nome: name };
        $.ajax({
            url: 'http://80.211.174.166:8000/Songs/createPlaylist',
            type: 'POST',
            data: playlist,
            success: function (result) {
                location.reload();
            }
        });

    });
    //---------------------------------------------------------
});