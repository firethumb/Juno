'use strict';
module.exports = function(server) {
  var started = Date.now();
  var router = server.loopback.Router();
  router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send("{ started: started, uptime: "+(Date.now() - started) / 1000 +"s, }");
  });
  server.use(router);
};
