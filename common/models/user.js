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
          host:req.headers.host
        }
        vres(tmp);
	  })).then(fn_isvalid).then(function(val){
			console.log('Loading Successful: ',val);
      cb(null,true);
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
};
