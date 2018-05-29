const connection = new(require('nosqlite').Connection)();
const path = require('path');
const Tail = require('tail-forever');
const log = require('./consoleLog').log;
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;
const index = require('./routes/index');
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

// -----

const tailTarget = __dirname+'/../sample-files/sample.log1';

const clients = [];

function exitApp() {
    log(`Exiting...`, 'danger');
    process.exit();
}

const db = connection.database('logs');

db.exists((exists) => {
    if (exists) {
        log(`Database found. Connecting...`, 'good');
        appLoop();
    } else {
        log(`Database not found. Creating...`, 'good');
        db.createSync((err) => {
            if (err) {
                log(`Error: ${err}`, 'error');
                exitApp();
            }
        });
        log(`Database created. Connecting...`, 'good');
    }
});

io.on('connection', (socket) => {
    rememberSocket(socket);
    const data = db.allSync();
    console.log(data);
    io.emit('allData', data)
});

function rememberSocket(socket) {
    // Add the new connection to the list of clients
    clients.push(socket);
    log('New client connected', 'good');
    io.on('disconnect', () => {
        clients.splice(clients.indexOf(socket), 1);
        log('Client disconnected', 'warning');
    });
}

function appLoop() {
    tail = new Tail(tailTarget);
    tail.on("line", function(line) {
      const logLine  = {data: line};
      db.post(logLine, (err, id) => {
        if (err) throw err;
        log(`Record ${id} inserted`);
        const record = db.findSync({ id });
        console.log(record);
        io.emit('newLine', record);
      });
    });
    tail.on("error", function(error) {
      log(error, 'error');
    });
}

server.listen(port, () => console.log(`Listening on port ${port}`));

