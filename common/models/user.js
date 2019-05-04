// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = function(User) {
  //advance admin routes
  User.adv = function(ftoken,req,cb) {
//    console.log("ctx: ",ctx);
    (new Promise(function(vres){
				var tmp = {
          username:req.body.username,
          password:req.body.pwd,
          token:req.body.ftoken,
          headersUserAgent:req.headers['user-agent'],
          host:req.headers.host,
          app:User.app
        }
        vres(tmp);
	  })).then(fn_isvalid).then(fn_createUser).then(function(val){
      if(val.error){
        console.log('Loading Error: ',val.error);
        cb(null,false);
      }else{
        cb(null,true);
      }
    });
  };
  User.remoteMethod('adv', {
    accepts: [
      {arg: 'ftoken', type: 'string'},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {arg: 'success', type: 'any'},
    http: {path:'/adv', verb: 'post'}
  });

function fn_isvalid(optval){
  return new Promise(function(vres){
    vres(optval);
  });
}
function fn_createUser(objvar){
    var app = objvar.app;
    var User = app.models.user;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    var Team = app.models.Team;
    console.log("usn : ", objvar.username);
    console.log("pwd : ", objvar.password);

    return new Promise(function(vres){
      User.create([{username: objvar.username, email: objvar.username+'@firethumb.com', password: objvar.password}], function(err, users) {
        if (err) {
          vres({error:err});
        }else{

          console.log('debug ~~~~~~~~~~~~~~~ Created users:', users);

          Role.findOne({where: {name: 'admin'}}, function(err, adminRole) {
            console.log('debug ******************** Created users:', users[0].id);
            adminRole.principals.create({
              principalType: RoleMapping.USER,
              principalId: users[0].id
            }, function(err, principal) {
              if (err) throw err;
              console.log('Created principal:', principal);
            });
            adminRole.users(function(err, adminusers) {
              console.log("!!!!!!!!!!!!!!! adminusers ",adminusers);
              vres(true);
            });
          });
          vres(true);
        }
      });
    });
  }
};
