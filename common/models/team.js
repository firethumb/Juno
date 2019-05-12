// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0
var crypto = require('crypto');
module.exports = function(Team) {

  Team.fncreate = function(req,cb) {
//    console.log("ctx: ",ctx);
    (new Promise(function(vres){
        var dettmp = req.body.detials;
				var tmp = {
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
  function fn_createTeam(objvar){
      return new Promise(function(vres){
        if (objvar==false){
          vres({error:'Request Not Authorized'});
        }
        var app = objvar.app;
        var Role = app.models.Role;
        var RoleMapping = app.models.RoleMapping;
        var Team = app.models.Team;
        var varteam = {name: objvar.name, teammemberId: objvar.teammemberId,details:objvar.detials};
        console.log("debug : ",varteam);
        Team.create([varteam], function(err, teamobj) {
          if (err) {
            vres({error:err});
          }else{
            vres(teamobj);
          }
        });
      });
    }
  function fn_isvalid(optval){
    var md5sum = crypto.createHash('md5');
    return new Promise(function(vres){
      const saltstr = '$:salt123';
      //var strusernreq = saltstr +' '+ optval.username +' '+ optval.password+ ' ' +optval.host;
      var strusernreq = saltstr +' '+ optval.name +' '+ optval.teammemberId+ ' ' +optval.host;
      console.log("data ",strusernreq+"  @ "+optval.headersUserAgent);
      if(optval.headersUserAgent=='PostmanRuntime/7.11.0'){
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
