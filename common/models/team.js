// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
var crypto = require('crypto');
module.exports = function(Team) {
  Team.addmember = function(req,cb) {
//    console.log("ctx: ",ctx);
    (new Promise(function(vres){
        var dettmp = req.body.detials;
				var tmp = {
          ownerid:req.body.ownerid,
          teamobjId:req.body.teamobjId,
          members:req.body.members,
//          token:req.body.ftoken,
//          headersUserAgent:req.headers['user-agent'],
//          host:req.headers.host,
//          name:req.body.name,
          app:Team.app
        }
        vres(tmp);
	  })).then(fn_addmember).then(function(val){
      if(val.error){
        cb(null,{ok:false,error:val.error});
      }else{
        cb(null,val);
      }
    });
  };
  Team.remoteMethod('addmember', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {arg: 'response', type: 'any'},
    http: {path:'/addmember', verb: 'post'}
  });
  Team.fncreate = function(req,cb) {
//    console.log("ctx: ",ctx);
    (new Promise(function(vres){
        var dettmp = req.body.detials;
				var tmp = {
          ownerId:req.body.ownerid,
          teammemberId:req.body.teammemberId,
          token:req.body.ftoken,
          headersUserAgent:req.headers['user-agent'],
          host:req.headers.host,
          name:req.body.name,
          app:Team.app
        }
        if(dettmp){
          tmp.detials = dettmp;
        }
        vres(tmp);
	  })).then(fn_isvalid).then(fn_createTeam).then(function(val){
      if(val.error){
        cb(null,{ok:false,error:val.error});
      }else{
        cb(null,val);
      }
    });
  };
  Team.remoteMethod('fncreate', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}}
    ],
    returns: {arg: 'response', type: 'any'},
    http: {path:'/fncreate', verb: 'post'}
  });

  function fn_addmember(optvar){
    return new Promise(function(vres){
      console.log("test!!@# members : ",optvar.members);
      console.log("test!!@# ownerid : ",optvar.ownerid);
      if (optvar==false){
        vres({error:'Request Not Authorized'});
      }else{
        var appTeamobj = optvar.app.models.Team;

        appTeamobj.findOne({where: {id: optvar.teamobjId}}, function(err1, teamobj) {
          if (err1) {
            vres({error:err1});
          }else if(teamobj){
            vres(teamobj);
          }else {
            vres("The teamobjId: " +optvar.ownerid + " was not found!");
          }
        });
      }
    });
  }
  function fn_createTeam(objvar){
      return new Promise(function(vres){
        if (objvar==false){
          vres({error:'Request Not Authorized!'});
        }else{
//          var app = objvar.app;
          var appTeamobj = objvar.app.models.Team;
          var varteam = {name: objvar.name,  ownerId: objvar.ownerId ,teammemberId: objvar.teammemberId,details:objvar.detials};
          console.log("debug : ",varteam);
          appTeamobj.create([varteam], function(err, teamobj) {
            if (err) {
              vres({error:err});
            }else{
              vres(teamobj);
            }
          });
        }
      });
    }
  function fn_isvalid(optval){
    var md5sum = crypto.createHash('md5');
    return new Promise(function(vres){
      const saltstr = '$:salt123';
      //var strusernreq = saltstr +' '+ optval.username +' '+ optval.password+ ' ' +optval.host;
      var strusernreq = saltstr +' '+ optval.name +' '+ optval.teammemberId+ ' ' +optval.host;
      console.log("data ",strusernreq+"  @ "+optval.headersUserAgent);
      if(optval.headersUserAgent=='PostmanRuntime/7.13.0'){
        md5sum.update(strusernreq);
        var md5val = md5sum.digest('hex');
        console.log(strusernreq + '  ::%%%:  ' + md5val);
        console.log('token :  ',optval.token);
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

};
