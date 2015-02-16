#!/usr/bin/nodejs

var ps = require('ps-node');

ps.lookup({ command:'nginx', psargs:'-ef' }, function(err, resultList ) {
    if (err) { throw new Error( err ); }
    
    if (resultList.lenght == 0) {
        console.log("Failed to find process Nginx");
    } else {
        console.log("Nginx is running");
    } 
});

ps.lookup({ command:'java', psargs:'-ef' }, function(err, resultList ) {
    if (err) { throw new Error( err ); }
    
    if (resultList.lenght == 0) {
        console.log("Failed to find process Tomcat");
    } else {
        console.log("Tomcat is running");
    } 
});
