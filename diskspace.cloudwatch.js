#!/usr/bin/nodejs

var http = require('http');
var AWS = require('aws-sdk');
var diskspace = require('diskspace');

var options = {
  host: '169.254.169.254',
  path: '/latest/meta-data/instance-id'
};

awsfx = function(instanceId, value) {
  var params = {
    MetricData: [ 
      {
        MetricName: 'DiskFreePercentage', /* required */
        Dimensions: [
            { Name: 'InstanceId',  Value: instanceId },
        ],
        Timestamp: new Date(),
        Unit: 'Percent',
        Value: value
      }
    ],
    Namespace: 'Diskspace' /* required */
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

      // determine the percentage free
      diskspace.check('/', function (err, total, free, status) {
        var percentageFree = (100 * free / total);
        console.log("Free:  " + percentageFree);
        awsfx(instanceId, percentageFree);
      });
  });
};

http.request(options, httpCallback).end();


