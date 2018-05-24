'use strict';
const chalk = require('chalk');

module.exports.log = (text, status = 'info') => {
    let data = '';
    switch (status) {
        case 'good':
            data = chalk.green(`[*] ${text}`);
            break;
        case 'warning':
            data = chalk.yellow(`[^] ${text}`);
            break;
        case 'danger':
            data = chalk.red(`[!] ${text}`);
            break;
        case 'error':
            data = chalk.bgRed(`[!!] ${text}`);
            break;
        case 'info':
        default:
            data = chalk.blue(`[#] ${text}`);
            break;
    }
    console.log(data);
}

