const http = require('http');
//const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// const httpsServerOptions = {
//     'key' : fs.readFileSync('./cert/key.pem'),
//     'cert' : fs.readFileSync('./cert/cert.pem')
// };

// const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
//     unifiedServer(req, res);
// });

// httpsServer.listen(config.httpsPort, (err) => {
//     if (err) {
//         return console.error(err);
//     }
//     console.log(`Listineing on port ${config.httpsPort}`);
// });

const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, (err) => {
    if (err) {
        return console.error(err);
    }
    console.log(`Listineing on port ${config.httpPort}`);
});

const unifiedServer = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const query = parsedUrl.query;
    const headers = JSON.stringify(req.headers);
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer +=decoder.end();
        const chosenHandler = typeof router[trimmedPath] !== 'undefined' ?
            router[trimmedPath] : handlers.notFound;
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : query,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };
        chosenHandler(data, (statusCode=200, payload={}) => {
            const payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(statusCode, payloadString);
        });
    });
}

const handlers = {};

handlers.ping = (data, callback) => {
    callback(200);
}

handlers.notFound = (data, callback) => {
    callback(404);
};

const router = {
    'ping' : handlers.ping
};