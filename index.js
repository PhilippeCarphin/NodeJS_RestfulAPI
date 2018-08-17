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

    const path = strip_slashes(parsedUrl.pathname);

    // obtaining the payload
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();
        console.log('Request path: ' + path);
        console.log('and with these query string parameters: ', parsedUrl.query);
        console.log('with method ' + req.method);
        console.log('with headers: ', req.headers);
        console.log('PAYLOAD BUFFER' + buffer);
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

