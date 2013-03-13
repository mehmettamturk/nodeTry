
/**
 * Module dependencies.
 */

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
app.get('/chatPage', routes.chatPage);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/* SOCKET I O I O I O I O */
// Socket bağlantısı kurulur
var io = require('socket.io').listen(server);

// Kullanıcı Listesinin tutulacağı Object
var kullanicilar = {};

// Bağlantı kurulduğunda çalışacak kısım
io.sockets.on('connection', function(socket){
    // Kullanıcı Ekleme Fonksiyonu
    socket.on("kullaniciEkle", function(kullaniciadi){
        // Kullanıcı session'nda bilgileri saklıyoruz
        socket.kullaniciAdi = kullaniciadi;
        socket.userId = kullanicilar.length;

        // Array'e kullanıcı bilgilerini ekliyoruz
        kullanicilar[kullaniciadi] = {
            userName : kullaniciadi,
            userId : kullanicilar.length
        };

        // Bağlanan kullanıcıya hoşgeldin mesajı yolluyoruz
        socket.emit("mesajGonder", "Sistem", "Hoşgeldiniz.");

        // Bütün kullanıcılara yeni kullanıcı bağlandı mesajı yolluyoruz
        socket.broadcast.emit("mesajGonder", "Sistem", kullaniciadi + " muhabbete bağlandı.");

        // Bağlı kullanıcılarda Kullanıcı listesini yeniliyoruz
        io.sockets.emit("kullanicilariYenile", kullanicilar);
    });

    // Bağlantı kesildiği takdirde çalışacak fonksiyon
    socket.on("disconnect", function(){
        // Kullanıcıyı listeden siliyoruz
        delete kullanicilar[socket.kullaniciAdi];

        // Bağlı kullanıcılarda Kullanıcı listesini yeniliyoruz
        io.sockets.emit("kullanicilariYenile", kullanicilar);

        // Bağlı kullanıcılara kullanıcı çıktı mesajı yolluyoruz
        socket.broadcast.emit("mesajGonder", "Sistem", socket.kullaniciAdi + " muhabbetten ayrıldı :(");
    });

    // Client tarafından mesaj yollama fonksiyonu
    socket.on("mesajYolla", function(data){
        // Bağlı kullanıcılara kullanıcıdan gelen mesajı yolluyoruz
        io.sockets.emit("mesajGonder", socket.kullaniciAdi, data);
    });
});