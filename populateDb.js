var fs = require('fs');
var models = require('./models');
const bcrypt = require('bcrypt');

models.sequelize.sync({force: true}).then(function() {
    fs.readFile('./songs.json', function(err, data) {
        var music_data = JSON.parse(data);
        var songs = music_data['songs'];

        songs.forEach(function(song) {
            //console.log(song);
            models.Song.create({
                title: song.title,
                album: song.album,
                artist: song.artist,
                duration: song.duration,
            });
        });
    });

    fs.readFile('./playlists.json', function(err, data) {
        var music_data = JSON.parse(data);
        var playlists = music_data['playlists'];

        playlists.forEach(function(playlist) {
            //console.log(playlist);
            models.Playlist.create({
                name: playlist.name
            }).then(function(playlistSongs) {
                playlist.songs.forEach(function(songId) {
                    var actualSongId = songId + 1;
                    //console.log(actualSongId);
                    models.Song.findOne({
                        where: {
                            id: actualSongId
                        }
                    }).then(function(song) {
                        playlistSongs.addSong(song);
                    })
                });
            });
        });
    });

    fs.readFile('./users.json', function(err, data) {
        var music_data = JSON.parse(data);
        var users = music_data['users'];

        users.forEach(function(user) {
            bcrypt.hash(user.password, 10, function(err, hash) {
                models.User.create({
                    name: user.username,
                    password: hash
                }).then(function(userPlaylists) {
                    user.playlists.forEach(function(playlistId) {
                        var actualPlaylistId = playlistId + 1;
                        models.Playlist.findOne({
                            where: {
                                id: actualPlaylistId
                            }
                        }).then(function(playlist) {
                            userPlaylists.addPlaylist(playlist);
                        });
                    });
                });
            });
        });
    });
});
