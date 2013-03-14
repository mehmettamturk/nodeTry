var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/chat', routes.chatPage);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/* SOCKET I O I O I O I O */
var io = require('socket.io').listen(server);
var kullanicilar = {};

io.sockets.on('connection', function(socket){
    socket.on("kullaniciEkle", function(kullaniciadi){
        socket.kullaniciAdi = kullaniciadi;
        socket.userId = kullanicilar.length;

        kullanicilar[kullaniciadi] = {
            userName : kullaniciadi,
            userId : kullanicilar.length
        };

        socket.emit("mesajGonder", "Sistem", "Hoşgeldiniz.");
        socket.broadcast.emit("mesajGonder", "Sistem", kullaniciadi + " muhabbete bağlandı.");
        io.sockets.emit("kullanicilariYenile", kullanicilar);
    });

    socket.on("disconnect", function(){
        delete kullanicilar[socket.kullaniciAdi];
        io.sockets.emit("kullanicilariYenile", kullanicilar);
        socket.broadcast.emit("mesajGonder", "Sistem", socket.kullaniciAdi + " muhabbetten ayrıldı :(");
    });

    socket.on("mesajYolla", function(data){
        io.sockets.emit("mesajGonder", socket.kullaniciAdi, data);
    });

    socket.on('connect_failed', function(e){
        alert('Connection Failed', e);
    });
});

