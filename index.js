const chalk = require('chalk');
const connection = new(require('nosqlite').Connection)();
const path = require('path');
const Tail = require('tail-forever');

// -----

function exitApp() {
    console.log(chalk.red(`[*] Exiting...`));
    process.exit();
}

const db = connection.database('logs');

db.exists((exists) => {
    if (exists) {
        console.log(chalk.green(`[*] Database found. Connecting...`));
        appLoop();
    } else {
        console.log(chalk.yellow(`[^] Database not found. Creating...`));
        db.createSync((err) => {
            if (err) {
                console.log(chalk.bgRed(`[!] Error: ${err}`));
                exitApp();
            }
        });
        console.log(chalk.green(`[*] Database created. Connecting...`));
    }
});

function appLoop() {
    tail = new Tail("./sample.log1");
    tail.on("line", function(line) {
      const logLine  = {data: line};
      db.post(logLine, (err, id) => {
        if (err) throw err;
        console.log(chalk.blue(`[#] Record ${id} inserted`));
      });
    });
    tail.on("error", function(error) {
      console.log(chalk.red(error));
    });
}



