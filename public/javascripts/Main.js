var socket;

function SocketTarafi(kulIsmi){
    var socket = io.connect(window.location.hostname + ":3000");
    socket.on("connect", function(){
        socket.emit("kullaniciEkle", kulIsmi);
        $('#isimGirisEkrani').fadeOut("slow", function(){
            $('#chatBolumu').fadeIn("slow");
        });
    });

    socket.on("mesajGonder", function(kullaniciadi, data){
        $('#konusmaPenceresi').append("<b style='color:gray;text-decoration: italic;'>" + kullaniciadi + ":</b> " + data + "<br/>");
    });

    socket.on("kullanicilariYenile", function(data){
        $('#kullanicilar').empty();
        $.each(data, function(key, value){
            $('#kullanicilar').append("<div>" + key + "</div>");
        });
    });

    $('#mesajiYolla').click(function() {
        var message = $('#mesaj').val();
        $('#mesaj').val('');
        socket.emit('mesajYolla', message);
    });
}

$(function(){
    $('#btnBaglan').click(function(){
        var kulIsmi = $('#txtIsim').val();
        if(kulIsmi === ""){
            alert('Lütfen isminizi girin');
        } else {
            SocketTarafi(kulIsmi);
        }
    });

    $('#mesaj').keypress(function(e) {
        if(e.which == 13) {
            $('#mesajiYolla').click();
        }
    });
});