var ACS = require('acs').ACS,
    logger = require('acs').logger,
    fs = require('fs');

function _list(req, res) {
  if (req.session.access_token) {
    var client = dboxapp.client(req.session.access_token);
    client.readdir('/', function(status, entries) {
      if (status !== 200) {
        return console.log(status);  // Something went wrong.
      }
      res.render('list', {
        layout: 'layout',
        req: req,
        list: entries
      });
    });
  }else {
    dboxapp.accesstoken(req.session.request_token, function(status, access_token) {
      req.session.access_token = access_token;
      res.redirect('/list');
    });
  }
}


function _acs(req, res) {
  req.session.controller = 'acs';
  if (!req.session.user) {
    res.render('login', {
      layout: 'application',
      req: req
    });
  }else {
    var data = {
      per_page: 1000,
      order: '-updated_at',
      where: '{\"user_id\":\"'+ req.session.user.id + '\"}'
    };
    ACS.Photos.query(data, function(e) {
      if (e.success && e.success === true) {
        res.render('index', {
          layout: 'application',
          obj: e,
          req: req
        });
      }else {
        req.session.flash = {msg: e.message, r: 0};
        res.redirect('/');
        logger.debug('Error: ' + JSON.stringify(e));
      }
    }, req, res);
  }
}

function select(req, res) {
  req.session.controller = 'select';
  if (!req.session.user) {
    res.redirect('/login');
  }else {
    res.render('select', {
      layout: 'application',
      req: req
    });
  }
}

function login(req, res) {
  req.session.controller = 'login';
  if (!req.session.user) {
    res.render('login', {
      layout: 'application',
      req: req
    });
  }else {
    res.redirect('/');
  }
}

function signup(req, res) {
  req.session.controller = 'signup';
  if (!req.session.user) {
    res.render('login', {
      layout: 'application',
      req: req
    });
  }else {
    res.redirect('/');
  }
}

function page_not_found(req, res) {
  res.send('page not found.');
}
