"use strict";

var Hapi = require('hapi'),
    FS = require('fs'),
    Path = require('path');

var schema = require('../../shared/input-validation'),
    utils = require('../../shared/utils'),
    setupDB = require('../../scripts/setupDB'),
    SocketHandlers = require('./socket-handlers'),
    Credentials = require('./models/credentials'),
    Urls = require('../../shared/urls');

var Waypoint = require('./gitignore.xbl/waypoint');

var staticPath = Path.join(__dirname, '..', '..',
                           'frontend', 'public');

// Service Record
var xbl = {
  waypoint: new Waypoint()
};

xbl.waypoint.start();



var handlers = {
  http: require('./routes/http-handlers')(xbl),
  https: require('./routes/https-handlers')
};



var server = new Hapi.Server();

server.connection({
  port: Urls.http.port,
  labels: ['http']
});

var http = server.select('http');


var ssl = {};
if (Urls.localhost) {
  ssl.key = 'localhost-ssl-key.pem';
  ssl.cert = 'localhost-ssl-cert.pem';
}
else {
  ssl.key = 'thehalodojo-private-decrypted.pem';
  ssl.cert = 'unified.pem';
}


var tlsConfig = {
  key: FS.readFileSync(Path.join(
    __dirname, 'gitignore.ssl', ssl.key)),
  cert: FS.readFileSync(Path.join(
    __dirname, 'gitignore.ssl', ssl.cert))
};

var allowedOrigin = 'http://' + Urls.http.hostname;
if (Urls.http.port != 80) {
  allowedOrigin += (':' + Urls.http.port);
}

server.connection({
  port: Urls.https.port,
  tls: tlsConfig,
  labels: ['https'],
  routes: {
    cors: {
      origin: [allowedOrigin]
    }
  }
});


var https = server.select('https');

server.path(staticPath);

var engine = require('hapi-react')();
server.views({
  defaultExtension: 'jsx',
  engines: {
    jsx: engine
  },
  path: __dirname + '/templates'
});


// make sure DB has been initialized
setupDB.initialize();


// HTTPS ROUTES

https.route({
  method: ['POST', 'OPTIONS'],
  path: '/register',
  config: {
    validate: {
      payload: {
        email: schema.email,
        password: schema.password
      }
    }
  },
  handler: handlers.https.register
});

https.route({
  method: ['POST', 'OPTIONS'],
  path: '/login',
  config: {
    validate: {
      payload: {
        email: schema.email,
        password: schema.password
      }
    }
  },
  handler: handlers.https.login
});

https.route({
  method: 'GET',
  path: '/activate/{code}',
  config: {
    validate: {
      params: {
        code: schema.guid
      }
    }
  },
  handler: function(request, reply) {
    return reply.file(Path.join(staticPath, 'index.html'));
  }
//  handler: handlers.https.activate
});

https.route({
  method: ['POST', 'OPTIONS'],
  path: '/activate/{code}',
  config: {
    validate: {
      params: {
        code: schema.guid
      },
      payload: {
        email: schema.email,
        password: schema.password
      }
    }
  },
  handler: handlers.https.activate
});





// PUBLIC ROUTES

//server.route({
//  method: 'GET',
//  path: '/testpath',
//  handler: function(request, reply) {
//    return reply.file(Path.join(staticPath, 'index.html'));
//  }
//});

// test
//server.route({
//  method: 'GET',
//  path: '/servicerecord/{gamertag}',
//  config: config,
//  handler: handlers.http.getServiceRecord
//});


// AUTHENTICATED ROUTES

http.register(require('hapi-auth-hawk'),
                function(err) {
  if (err) {
    return console.error(err);
  }
  var config = {
    'auth': 'hawk'
  };

  http.auth.strategy('hawk', 'hawk', {
    getCredentialsFunc: Credentials.get
  });


  http.route({
    method: 'POST',
    path: '/addgt',
    config: utils.update(config, {
      validate: {
        payload: {
          gamertag: schema.gamertag
        }
      }
    }),
    handler: handlers.http.addGamertag
  });

  http.route({
    method: 'GET',
    path: '/profile',
    config: config,
    handler: handlers.http.profile
  });

  http.route({
    method: 'PUT',
    path: '/profile',
    config: utils.update(config, {
      validate: {
        payload: schema.profile
      }
    }),
    handler: handlers.http.profile
  });

  http.route({
    method: 'GET',
    path: '/userdata',
    config: config,
    handler: handlers.http.getUserData
  });

  http.route({
    method: 'GET',
    path: '/suggest',
    config: config,
    handler: handlers.http.suggest
  });

  // Connect WebSockets
  SocketHandlers.attach(server);

  module.exports = server;

});
