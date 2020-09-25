const { APP, VNC } = require('./app.config');
const { Server } = require('ws');
const http = require('http');
const express = require('express');
const net = require('net');

function getLogger(clientAddr) {
    return (msg) => {
        console.log(' ' + clientAddr + ': ' + msg);
    }
}

const onConnection = (ws) => {
    const clientAddr = ws._socket.remoteAddress;
    const log = getLogger(clientAddr);
    log('WebSocket connection');
    log('Version ' + ws.protocolVersion + ', subprotocol: ' + ws.protocol);

    const target = net.createConnection(VNC.PORT, VNC.HOST, () => {
        log('connected to target');
    });
    target.on('data', function (data) {
        //log("sending message: " + data);
        try {
            if (ws.protocol === 'base64') {
                ws.send(new Buffer(data).toString('base64'));
            } else {
                ws.send(data, {binary: true});
            }
        } catch (e) {
            log("Client closed, cleaning up target");
            target.end();
        }
    });
    target.on('end', function () {
        log('target disconnected');
        ws.close();
    });
    target.on('error', function () {
        log('target connection error');
        target.end();
        ws.close();
    });

    ws.on('message', function (msg) {
        //log('got message: ' + msg);
        if (ws.protocol === 'base64') {
            target.write(new Buffer(msg, 'base64'));
        } else {
            target.write(msg, 'binary');
        }
    });
    ws.on('close', function (code, reason) {
        log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
        target.end();
    });
    ws.on('error', function (a) {
        log('WebSocket client error: ' + a);
        target.end();
    });
};

async function bootstrap() {
    const app = express();
    app.use(express.static(APP.NOVNC_PATH));
    const server = http.createServer(app);
    const wss = new Server({ server });

    wss.on('connection', (ws, req) => {
        console.log(`[WEBSOCKET] connection(): ${req.url}`);
        onConnection(ws);
    });
    wss.on('error', error => {
        console.error(error);
    });

    server.listen(APP.PORT, () => {
        console.log(`server started at ${JSON.stringify(server.address())}`);
    });
}

bootstrap();

