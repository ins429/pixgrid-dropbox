var ACS = require('acs').ACS,
    logger = require('acs').logger,
    express = require('express'),
    partials = require('express-partials');

// initialize app (setup ACS library and logger)
function start(app) {
  ACS.init('OAUTH KEY', 'OAUTH SECRET'); // FILL ME HERE!
  logger.setLevel('DEBUG');
  
  //use connect.session
  app.use(express.cookieParser());
  app.use(express.session({ key: 'node.acs', secret: "my secret" }));
  
  //set favicon
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

  //set to use express-partial for view
  app.use(partials());

  //Request body parsing middleware supporting JSON, urlencoded, and multipart
  app.use(express.bodyParser());
}

// release resources
function stop() {
  
}
