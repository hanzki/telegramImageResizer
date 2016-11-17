/**
 * Created by hanzki on 10/11/16.
 */

'use strict';

require('dotenv').config();
const fs = require('fs-extra')
const TgBot = require('./tgBot');

const token = process.env.TELEGRAM_BOT_TOKEN;


module.exports.handler = (event, context, callback) => {
    const badResponse = {
        statusCode: 400,
        body: JSON.stringify({
            message: "Expected a telegram update",
        }),
    };

    const okResponse = {
        statusCode: 200,
        body: JSON.stringify({
            message: "Got a telegram message",
        }),
    };

    if( ! ( event && event.body ) ) {
        callback("expected HTTP POST", null);
        return;
    }

    var update = event.body ? JSON.parse(event.body) : undefined;
    console.log("received update: ", update);

    //remove old directories
    //fs.remove('/tmp/images');
    //fs.remove('/tmp/output');

    const dir = '/tmp/' + (update && update.update_id ? update.update_id + "/" : "none/");
    fs.emptydirSync(dir);

    const bot = new TgBot(token, dir);

    var updateProcess = update && update.update_id ? bot.processUpdate(update) : Promise.reject();

    updateProcess.then(function () {
        console.log("Everything went fine");
        fs.removeSync(dir);
        callback(null, okResponse);
    }).catch(function (err) {
        console.error("oops an error", err);
        fs.removeSync(dir);
        callback(null, badResponse);
    });
};
