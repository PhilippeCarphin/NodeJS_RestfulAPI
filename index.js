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

    const parsedUrl = url.parse(req.url, true);

    const trimmedPath = strip_slashes(parsedUrl.pathname);
    console.log('Request path: ' + trimmedPath);

    const queryStringObject = parsedUrl.query;
    console.log('and with these query string parameters: ', queryStringObject);

    const method = req.method.toLowerCase();
    console.log('with method ' + method);


    // obtaining the payload
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });


    req.on('end', function(){
        console.log('Request : req.on(end)');
    });


    // Send the response
    res.end('Hello World\n');
};
const server = http.createServer(requestCallback);

serverUpCallback = function(){
    console.log("the server is listening on port 3000");
};
server.listen(3000,serverUpCallback);

