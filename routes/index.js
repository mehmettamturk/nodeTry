exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.chatPage = function(req, res){
    res.render("chat", { layout: false });
};