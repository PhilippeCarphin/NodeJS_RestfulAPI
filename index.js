/*
 * Primary file for the API
 */

const http = require('http');

const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

strip_slashes = function(path){
    return path.replace(/^\/+|\/+$/g, '');
};
requestCallback = function(req, res){

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);


    // Get the path
    const trimmedPath = strip_slashes(parsedUrl.pathname);


    // Send the response
    res.end('Hello World\n');


    // obtaining the method
    const method = req.method.toLowerCase();


    // obtaining the payload
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    // get the query string as an object
    const queryStringObject = parsedUrl.query;



    req.on('end', function(){
        console.log('Request : req.on(end)');
    });

    // Logging the request path
    console.log('got request on port 3000 for ' + trimmedPath);
    console.log('with method ' + method);
    console.log('and with these query string parameters: ', queryStringObject);

};
const server = http.createServer(requestCallback);

serverUpCallback = function(){
    console.log("the server is listening on port 3000");
};
server.listen(3000,serverUpCallback);

