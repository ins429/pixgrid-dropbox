var fs = require('fs'),
    client,
    dbox = require('dbox'),
    dboxapp = dbox.app({ 'app_key': 'APP KEY', 'app_secret': 'APP SECRET' }); // FILL ME HERE!

function _index(req, res) {
  req.session.controller = 'dropbox';
  console.log(req.session.user);
  if (req.session.request_token) {
    if (req.session.access_token) {
      var client = dboxapp.client(req.session.access_token);
      client.readdir('/' + req.session.user.email, function(status, entries) {
        if (status !== 200) {
          return console.log(status);  // Something went wrong.
        }
        res.render('dropbox', {
          layout: 'application',
          req: req,
          list: entries
        });
      });
    }else {
      dboxapp.accesstoken(req.session.request_token, function(status, access_token) {
        req.session.access_token = access_token;
        res.redirect('/dropbox');
      });
    }
  }else {
    dboxapp.requesttoken(function(status, request_token) {
      req.session.request_token = request_token;
      res.redirect(request_token.authorize_url + '&oauth_callback=http://localhost:8080/dropbox');
    });
  }
}

function _read(req, res) {
  var client = dboxapp.client(req.session.access_token);
  client.get(req.session.user.email + '/' + req.params.filename, function(status, reply, metadata) {
    if (status !== 200) {
      return console.log(status);  // Something went wrong.
    }
    var base64Image = new Buffer(reply).toString('base64');
    res.send(base64Image);
    // res.send('<img alt="" src="data:image/png;base64,' + base64Image + '" />');
  });
}

function _create(req, res) {
  console.log(req.body);
  client = dboxapp.client(req.session.access_token);
  var data = {};
  fs.readFile(req.files.photo.path, 'utf8', function (err, data) {
    var base64Data = data.replace(/^data:image\/png;base64,/,"").replace(/^data:image\/jpeg;base64,/,"").replace(/^data:image\/jpg;base64,/,"").replace(/^data:image\/gif;base64,/,"");
    var dataBuffer = new Buffer(base64Data, 'base64');
    require("fs").writeFile(req.files.photo.path, dataBuffer, function(err) {

      fs.readFile(req.files.photo.path, function(err, data) {
        client.put(req.session.user.email + '/' + req.body.filename, data, function(status, reply) {
          console.log(reply);
          if (status === 200) {
            res.send({meta: {code: 200}, msg: 'File saved!'});
          }else {
            res.send({meta: {code: 400}, msg: 'Error!'});
          }
        });
      });

    });
  });
}
