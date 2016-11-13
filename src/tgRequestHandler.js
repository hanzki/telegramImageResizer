/**
 * Created by hanzki on 10/11/16.
 */

'use strict';

require('dotenv').config();
const TgBot = require('./tgBot');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TgBot(token);


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

    var updateProcess = update && update.update_id ? bot.processUpdate(update) : Promise.reject();

    updateProcess.then(function () {
        callback(null, okResponse);
    }).catch(function (err) {
        callback(null, badResponse);
    });
};
