// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
var crypto = require('crypto');
module.exports = function(User) {
  //advance admin routes
  User.chrole = function(req,cb){
    (new Promise(function(vres){
				var tmp = {
          userid:req.body.userid,
          to:req.body.to,
          token:req.body.ftoken,
          headersUserAgent:req.headers['user-agent'],
          host:req.headers.host,
          app:User.app
        }
        vres(tmp);
	  })).then(fn_isvalid2).then(fn_chrole).then(function(val){
      if(val.error){
        cb(null,{ok:false,error:val.error});
      }else{
        cb(null,val);
      }
    });
  }
  User.remoteMethod('chrole', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {arg: 'response', type: 'any'},
    http: {path:'/chrole', verb: 'post'}
  });
  User.adv = function(ftoken,req,cb) {
//    console.log("ctx: ",ctx);
    (new Promise(function(vres){
        var emailtmp = req.body.email;
				var tmp = {
          username:req.body.username,
          password:req.body.pwd,
          token:req.body.ftoken,
          headersUserAgent:req.headers['user-agent'],
          host:req.headers.host,
          app:User.app
        }
        if (emailtmp){
          tmp.email = emailtmp;
        }
        vres(tmp);
	  })).then(fn_isvalid).then(fn_createUser).then(function(val){
      if(val.error){
        cb(null,{ok:false,error:val.error});
      }else{
        cb(null,val);
      }
    });
  };
  User.remoteMethod('adv', {
    accepts: [
      {arg: 'ftoken', type: 'string'},
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {arg: 'response', type: 'any'},
    http: {path:'/adv', verb: 'post'}
  });
  function fn_isvalid2(optval){
    var md5sum = crypto.createHash('md5');
    return new Promise(function(vres){
      const saltstr = '$:salt123';
      //var strusernreq = saltstr +' '+ optval.username +' '+ optval.password+ ' ' +optval.host;
      var strusernreq = saltstr +' '+ optval.userid + ' ' + optval.to + ' ' +optval.host;
      console.log("data ",strusernreq+"@"+optval.headersUserAgent);
      if(optval.headersUserAgent=='PostmanRuntime/7.11.0'){
        md5sum.update(strusernreq);
        var md5val = md5sum.digest('hex');
        console.log(md5val + ' ::%%%: ' + strusernreq);
        console.log('token : ',optval.token);
        if (md5val == optval.token){
          vres(optval);
        }else {
          vres(false);
        }
      }else {
          vres(false);
      }
    });
  }
function fn_chrole(objvar){
  //change role function
  const {ObjectId} = require('mongodb');
  return new Promise(function(vres){
    if (objvar==false){
      vres({error:'Request Not Authorized'});
    }
    var app = objvar.app;
    var User = app.models.user;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    var Team = app.models.Team;
    User.findOne({where: {id: objvar.userid}}, function(err, userobj) {
      if (err) {
        vres({error:err});
      }else{
        if(userobj){
          RoleMapping.findOne({where: {principalId:objvar.userid}},function(err,rolemapobj){
            if (err) {
              vres({error:err});
            }else if(objvar.to) {
              Role.findOne({where: {name: objvar.to}}, function(err1, adminRole) {
                if (err1) {
                  vres({error:err1});
                }
                console.log("adminRole : ",adminRole);
                if(adminRole){
                  if(rolemapobj){
                    //update roleId of RoleMapping object
                    rolemapobj.updateAttributes({roleId: ObjectId(adminRole.id)},function(err,instobj){
                      vres(instobj);
                    });
                  }else {
                    //create when none existing
                    adminRole.principals.create({
                      principalType: RoleMapping.USER,
                      principalId: objvar.userid
                    }, function(err2, principal) {
                      if (err2) {
                        vres({error:err2});
                      }else{
                        vres({ok:true,principal:principal});
                      }
                    });
                  }
                }
              });
            }else{
              var tmp1 = rolemapobj
              rolemapobj.delete();
              console.log("Role Removed!",tmp1);
              vres({message:"Role Removed!",object:tmp1});
            }
          });
        }else{
          vres(false);
        }
      }
    });
  });
}
function fn_isvalid(optval){
  var md5sum = crypto.createHash('md5');
  return new Promise(function(vres){
    const saltstr = '$:salt123';
    //var strusernreq = saltstr +' '+ optval.username +' '+ optval.password+ ' ' +optval.host;
    var strusernreq = saltstr +' '+ optval.username +' '+ optval.password+ ' ' +optval.host;
    console.log("data ",strusernreq+"@"+optval.headersUserAgent);
    if(optval.headersUserAgent=='PostmanRuntime/7.13.0'){
      md5sum.update(strusernreq);
      var md5val = md5sum.digest('hex');
      console.log(md5val + ' ::%%%: ' + strusernreq);
      console.log('token : ',optval.token);
      if (md5val == optval.token){
        vres(optval);
      }else {
        vres(false);
      }
    }else {
        vres(false);
    }
  });
}
function fn_createUser(objvar){
    return new Promise(function(vres){
      if (objvar==false){
        vres({error:'Request Not Authorized'});
      }
      var app = objvar.app;
      var User = app.models.user;
      var Role = app.models.Role;
      var RoleMapping = app.models.RoleMapping;
      var Team = app.models.Team;
      var varuser = {username: objvar.username, password: objvar.password};
      if (objvar.email){
        varuser.email = objvar.email;
      }else{
        varuser.email = objvar.username+'@firethumb.com';
      }
      User.create([varuser], function(err, users) {
        if (err) {
          vres({error:err});
        }else{
          Role.findOne({where: {name: 'admin'}}, function(err1, adminRole) {
            if (err1) {
              vres({error:err1});
            }
            adminRole.principals.create({
              principalType: RoleMapping.USER,
              principalId: users[0].id
            }, function(err2, principal) {
              if (err2) {
                vres({error:err2});
              }else{
                vres({ok:true,id:users[0].id,email:users[0].email});
              }
            });
          });
        }
      });
    });
  }
};
