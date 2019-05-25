// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// License text available at https://opensource.org/licenses/Artistic-2.0
//Custom edited by louie.laquio@gmail.com

module.exports = function(app) {
  var Role = app.models.Role;
  Role.registerResolver('teamMember', function(role, context, cb) {
    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }
    console.log("$$$$$$$$$$$$$$$$$4 context.modelName",context.modelName);
    // if the target model is not project
    if (context.modelName !== 'project') {
      return reject();
    }
    // do not allow anonymous users
    var userId = context.accessToken.userId;
    if (!userId) {
      return reject();
    }
    context.model.findById(context.modelId, function(err, project) {
      if (err || !project)
        return reject();
      var Team = app.models.Team;
      var uid = JSON.stringify(userId).replace(/"/g, '');
      Team.count({
        id: project.teamownerId,
        teammemberId: {in:[uid]}
      }, function(err, count) {
        if (err) {
          console.log(err);
          return cb(null, false);
        }
        cb(null, count > 0); // true = is a team member
      });
    });
  });
};
