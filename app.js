// Import the http library
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mu = require('mu2');
var models = require('./models');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
var EventEmitter = require('events').EventEmitter;

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());
app.use(function(request, response, next) {
  console.log(request.url)
    if (request.url === '/style.css' || request.url === '/login') {
        next();
        return;
    }
    var sessionToken = request.cookies.sessionToken;
    console.log(sessionToken);
    models.Session.findOne(
      {
        where: {
          sessionKey: sessionToken
        }
      }).then(function (session) {
        if(session) {
          request.id = session.sessionKey;
          next();
        } else {
          response.redirect('/login');
        }
      });
});
var server = require('http').Server(app);
var io = require('socket.io')(server);
mu.root = __dirname;


app.get('/style.css', function(request, response) {
  response.setHeader('Content-Type', 'text/css');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/style.css');
});

app.get('/login', function(request, response) {
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/login.html');
});

app.get('/playlists', function(request, response) {
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/playlist.html');
});

app.get('/library', function(request, response) {
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/playlist.html');
});

app.get('/search', function(request, response) {
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/playlist.html');
});

app.get('/music-app.js', function(request, response) {
  response.setHeader('Content-Type', 'text/javascript');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/music-app.js');
});

app.get('/grey_box.jpg', function(request, response) {
  response.setHeader('Content-Type', 'image/jpeg');
  response.setHeader('Cache-Control', 'public, max-age=1800000');
  response.sendFile(__dirname + '/grey_box.jpg');
});

// Demo for redirect
app.get('/', function(request, response) {
  response.status(302);
  response.setHeader('Location', 'http://localhost:3000/login');
  response.send('redirecting to playlists\n\n');
});

//api
app.get('/api/songs', function(request, response) {
  models.Song.findAll()
    .then(function(songs) {
      var res =songs.map(function(song){
        return {
          id: song.dataValues.id - 1,
          album: song.dataValues.album,
          title: song.dataValues.title,
          artist: song.dataValues.artist,
          duration: song.dataValues.duration  
        }
      });
      response.setHeader('Content-Type', 'application/json');
      response.setHeader('Cache-Control', 'public, max-age=1800000');
      response.end(JSON.stringify({songs: res}, null, 2));
    })
});

app.get('/api/playlists', function(request, response) {
  var currentSession = request.cookies.sessionToken;
  models.Session.findOne({
    where: {
      sessionKey: currentSession
    }
  }).then(function(session) {
    if(session === null) {
      response.status(403).end("No Permission");
    } else {
      var uId = session.sessionUser;
      models.User.findOne({
        where: {
          id: uId
        }
      }).then(function(user) {
        var userPlaylists = user.getPlaylists().then(function(playlists) {
          var responseObject  = [];
          playlists.map(function(playlist){
            playlist.getSongs().then(function(songs) {
              var songIds = songs.map(function(song) {
                return song.id - 1;
              });

              var playlistInfo = playlist.get({plain: true});
              return {
                id: playlistInfo.id,
                name: playlistInfo.name,
                songs: songIds
              };
            }).then(function (playlistObject){
              responseObject.push(playlistObject);
              if(responseObject.length === playlists.length) {
                response.setHeader('Content-Type', 'application/json');
                response.setHeader('Cache-Control', 'public, max-age=1800000');
                response.end(JSON.stringify({playlists: responseObject}, null, 2));
              }
            });
          });
        });
      });
    }  
  });
});

app.get('/api/users', function(request, response) {
  models.User.findAll().then(function(users) {
    var res = users.map(function(user) {
      return {
        id: user.id,
        name: user.name
      }
    });
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Cache-Control', 'public, max-age=1800000');
    response.end(JSON.stringify({users: res}, null, 2));
  })
});

function isIncluded(list, object) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === object) {
      return true;
    }
  }
  return false;
}

app.post('/api/playlists/:playlistId/users', function(request, response) {
  var playlistId = parseInt(request.params.playlistId);
  var userId = parseInt(request.body.user);
  models.User.findOne(
    {
      where: {
        id: userId
      }
    }).then(function(user) {
      user.addPlaylist(playlistId);
      response.end("Playlist added to user");
    });
});

// POST APIs: add a new playlist 
app.post('/api/playlists', function(request, response) {
  var playlistName = request.body.name;
  models.Playlist.create({
    name: playlistName
  }).then(function(playlist) {
      var res = {
        id: playlist.id,
        name: playlist.name
      }
      response.end(JSON.stringify(res));
    })
});

// POST session
app.post('/login', function(request, response) {
  var usernameValue = request.body['name'];
  var passwordValue = request.body['password'];
  models.User.findOne({
      where: {
        username: usernameValue
      }
    }).then(function(user) {
      if(user) {
        // user exists
        bcrypt.compare(passwordValue, user.password, function(err, res) {
          if(res) {
            // password match
            models.Session.create({
              sessionKey: generateKey(),
              sessionUser: user.id
            }).then(function(session) {
              response.setHeader('Set-Cookie', 'sessionToken=' + session.sessionKey);
              response.setHeader('Location', 'http://localhost:3000/playlists')
              response.status(301);
              response.send("Session cookie is set");
            });
          } else {
            // password not match
            response.status(401).send("Password not match");
          }
        });
      } else {
        //User doesnt exist
        response.status(401).send("User is not found");
      }
    });   
});

var generateKey = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

io.on('connection', function(socket){
  // POST APIs: Add a new song to a playlist
  console.log('connection...');
  app.post('/api/playlists/:playlistId', function(request, response){
    var currentSession = request.cookies.sessionToken;
    var playlistId = parseInt(request.params.playlistId);
    var songId = parseInt(request.body.song);

    models.Session.findOne({
      where: {
        sessionKey: currentSession
      }
    }).then(function(session) {
      if(session === null) {
        response.status(403).end("No Permission");
      } else {
        var uId = session.sessionUser;
        models.User.findOne({
          where: {
            id: uId
          }
        }).then(function(user) {
          user.getPlaylists().then(function(playlists) {
            if (isIncluded(playlists, playlistId)) {
              models.Playlist.findOne(
                {
                  where: {
                    id: playlistId
                  }
                }).then(function(playlist) {
                  playlist.addSong(songId + 1);
                  var emitMsg = { 
                    playlist: playlist.id, 
                    song: songId
                  }
                  console.log(emitMsg);
                  socket.broadcast.emit('addSongToPlaylist', JSON.stringify(emitMsg));
                  response.end("Song added to playlist");
                });
            } else {
              response.status(403).end("No Permission");
            }
          });
        });
      }
    });
  });

  app.delete('/api/playlists/:id', function(request, response){
    var currentSession = request.cookies.sessionToken;
    var playlistId = parseInt(request.params.id);
    var songId = parseInt(request.body.song);

    models.Session.findOne({
      where: {
        sessionKey: currentSession
      }
    }).then(function(session) {
      if(session === null) {
        response.status(403).end("No Permission");
      } else {
        var uId = session.sessionUser;
        models.User.findOne({
          where: {
            id: uId
          }
        }).then(function(user) {
          user.getPlaylists().then(function (playlists) {
            if (isIncluded(playlists, playlistId)) {
              models.Playlist.findOne(
                {
                  where: {
                    id: playlistId
                  }
                }).then(function(playlist) {
                  playlist.removeSong(songId + 1);
                  var emitMsg = {
                    playlist: playlist.id,
                    song: songId + 1
                  }
                  socket.broadcast.emit('deleteSongFromPlaylist', JSON.stringify(emitMsg));
                  response.end("Song deleted from playlist");
                });
            } else {
              console.log('not included');
            }
          });
        });
      }
    });
  });
});

models.sequelize.sync().then(function() {
    server.listen(3000, function () {
      console.log('Server is running');
    });
});
