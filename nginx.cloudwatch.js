#!/usr/bin/nodejs

var http = require('http');
var AWS = require('aws-sdk');
var NginxParser = require('nginxparser');

var parser = new NginxParser('$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"');

var options = {
  host: '169.254.169.254',
  path: '/latest/meta-data/instance-id'
};

var request2xx = 0, request3xx = 0, request4xx = 0, request5xx = 0;
parserCallback = function(row) {
  var statusCode = parseInt(row.status); 
  if ( statusCode >= 200 && statusCode < 300) {
    request2xx++;
  } else if ( statusCode >= 300 && statusCode < 400) {
    request2xx++;
  } else if ( statusCode >= 400 && statusCode < 500) {
    request4xx++;
  } else if ( statusCode >= 500 ) {
    request5xx++;
  }
};

awsfx = function(instanceId) {
  var params = {
    MetricData: [ 
      {
        MetricName: 'Http2xx', /* required */
        Dimensions: [
            { Name: 'InstanceId',  Value: instanceId },
        ],
        Timestamp: new Date(),
        Unit: 'Count',
        Value: request2xx
      },
      {
        MetricName: 'Http3xx', /* required */
        Dimensions: [
            { Name: 'InstanceId',  Value: instanceId },
        ],
        Timestamp: new Date(),
        Unit: 'Count',
        Value: request3xx
      },
      {
        MetricName: 'Http4xx', /* required */
        Dimensions: [
            { Name: 'InstanceId',  Value: instanceId },
        ],
        Timestamp: new Date(),
        Unit: 'Count',
        Value: request4xx
      },
      {
        MetricName: 'Http5xx', /* required */
        Dimensions: [
            { Name: 'InstanceId',  Value: instanceId },
        ],
        Timestamp: new Date(),
        Unit: 'Count',
        Value: request5xx
      }
    ],
    Namespace: 'Nginx' /* required */
  };
  var cloudwatch = new AWS.CloudWatch({region:'us-east-1'});
  cloudwatch.putMetricData(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

  //
  if (request5xx > 0) {
    var params = {
      MetricData: [
        {
          MetricName: 'StatusCheckFailed', /* required */
          Dimensions: [
              { Name: 'InstanceId',  Value: instanceId },
          ],
          Timestamp: new Date(),
          Unit: 'Count',
          Value: 1
        },
        Namespace: 'EC2' /* required */
      ]
    };
    cloudwatch.putMetricData(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  }
};

httpCallback = function(response) {
  var instanceId = '';
  response.on('data', function(chunk) {
    instanceId += chunk;
  });
  response.on('end', function() {
    // read the access log file...
    parser.read('/var/log/nginx/access.log', parserCallback, function (err) {
      if (err) {
        throw err;
      }
      awsfx(instanceId);
    });

  });
};

http.request(options, httpCallback).end();

