// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = function(Project) {
  // listProjects
  Project.listProjects = function(cb) {
    Project.find({
      fields: {
        balance: false
      }
    }, cb);
  };
  Project.remoteMethod('listProjects', {
    returns: {arg: 'projects', type: 'array'},
    http: {path:'/list-projects', verb: 'get'}
  });
};
