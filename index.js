/*
 * Primary file for the API
 */
const config = require('./config.js');
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


strip_slashes = function(path)
{
    return path.replace(/^\/+|\/+$/g, '');
};

const server = http.createServer(function(req, res)
{
    const parsedUrl = url.parse(req.url, true);
    const path = '/' + strip_slashes(parsedUrl.pathname);

    // obtaining the payload
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    requestEndCallback = function(){
        buffer += decoder.end();

        const data = {
            'path' : path,
            'method' : req.method,
            'headers' : req.headers,
            'query' : req.query,
            'payload': JSON.parse(buffer)
        };

        requestHandler = (path in router) ? router[path] : handlers.notFound;

        handlerEndCallback = function(statusCode, payload)
        {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(JSON.stringify( payload));
        };
        requestHandler(data, handlerEndCallback);
    };
    req.on('end', requestEndCallback);
});

server.listen(config.httpPort,function(){
    console.log("the server is listening on port", config.httpPort, "in config", config.envName, ":", );
});

var handlers = {};

handlers.root = function(data, callback)
{
    console.log('handler for path \'\' called with data:', data);
    callback(200, {'name' : 'root handler'});
};

handlers.notFound = function(data, endCallback)
{
    endCallback(404, {'path': data.path });
};

const router = {
    '/': handlers.root
};

