/*
 * Primary file for the API
 */
const config = require('./config.js');
const data = require('./lib/data.js');
const handlers = require('./lib/handlers.js');

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;


strip_slashes = function(path)
{
    return path.replace(/^\/+|\/+$/g, '');
};


/**
 * This is the basic handler for a request.  Set the request on('data', ...) and
 * on('end)' callbacks and exit.
 * The on('end') callback has the data of the request in its closure so it can access
 * it when the request is done.
 * @param req : the request object
 * @param res : the response object
 */
var handleRequest = function(req, res)
{
    const parsedUrl = url.parse(req.url, true);
    const path = '/' + strip_slashes(parsedUrl.pathname);

    // obtaining the payload
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    /**
     * Once the request has finished being received, assemble its data and pass
     * it to the appropriate handler and return the response.
     * The data is from the closure of the callback.
     */
    req.on('end', function(){
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
    });
};

/**
 * Start an http server and an https server with the same handle request callback
 */
var startServers = function()
{
    console.log('config', config);
    const httpServer = http.createServer(handleRequest);
    httpServer.listen(config.environment.httpPort,function(){
        console.log("the http server is listening on port", config.environment.httpPort, "in config", config.envName,);
    });

    const httpsServerOptions = {
        'key': fs.readFileSync(config.https.keyFile),
        'cert': fs.readFileSync(config.https.certFile),

    };
    const httpsServer = https.createServer(httpsServerOptions, handleRequest);
    httpsServer.listen(config.environment.httpsPort, function(){
        console.log(
            "the https server is listening on port", config.environment.httpsPort,
            "in config", config.envName
        );
    });
};

const router = {
    '/': handlers.root,
    '/ping': handlers.ping
};

startServers();
