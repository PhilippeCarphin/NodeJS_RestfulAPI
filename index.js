/*
 * Primary file for the API
 */

const http = require('http');

const url = require('url');

strip_slashes = function(path){
    return path.replace(/^\/+|\/+$/g, '');
};
requestCallback = function(req, res){

    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);


    // Get the path
    var trimmedPath = strip_slashes(parsedUrl.pathname);


    // Send the response
    res.end('Hello World\n');


    // Logging the request path
    console.log('got request on port 3000 for ' + trimmedPath);

};
var server = http.createServer(requestCallback);

serverUpCallback = function(){
    console.log("the server is listening on port 3000");
};
server.listen(3000,serverUpCallback);

