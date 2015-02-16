#!/usr/bin/nodejs

var http = require('http');
var AWS = require('aws-sdk');
var diskspace = require('ps-node');

var options = {
  host: '169.254.169.254',
  path: '/latest/meta-data/instance-id'
};

awsFail = function(instanceId) {
  var params = {
    MetricData: [ 
      {
        MetricName: 'StatusCheckFailed', /* required */
        Dimensions: [
            { Name: 'InstanceId',  Value: instanceId }
        ],
        Timestamp: new Date(),
        Unit: 'Count',
        Value: 1
      }
    ],
    Namespace: 'AWS/EC2' /* required */
  };
  var cloudwatch = new AWS.CloudWatch({region:'us-east-1'});
  cloudwatch.putMetricData(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
};

httpCallback = function(response) {
  var instanceId = '';
  response.on('data', function(chunk) {
    instanceId += chunk;
  });
  response.on('end', function() {

  var ps = require('ps-node');

  ps.lookup({ command:'nginx', psargs:'-ef' }, function(err, resultList ) {
    if (err) { throw new Error( err ); }
    if (resultList.lenght == 0) {
      console.log("Failed to find process Nginx");
      awsFail(instanceId);
    } else {
      console.log("Nginx is running");
    }
  });

  ps.lookup({ command:'java', psargs:'-ef' }, function(err, resultList ) {
    if (err) { throw new Error( err ); }

    if (resultList.lenght == 0) {
      console.log("Failed to find process Tomcat");
      awsFail(instanceId);
    } else {
      console.log("Tomcat is running");
    }
  });
};

http.request(options, httpCallback).end();


