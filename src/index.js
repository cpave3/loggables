const connection = new(require('nosqlite').Connection)();
const path = require('path');
const Tail = require('tail-forever');
const log = require('./consoleLog').log;

// -----

const tailTarget = __dirname+'/../sample-files/sample.log1';

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

function appLoop() {
    tail = new Tail(tailTarget);
    tail.on("line", function(line) {
      const logLine  = {data: line};
      db.post(logLine, (err, id) => {
        if (err) throw err;
        log(`Record ${id} inserted`);
      });
    });
    tail.on("error", function(error) {
      log(error, 'error');
    });
}



