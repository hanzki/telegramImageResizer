/**
 * Created by hanzki on 10/11/16.
 */

'use strict';

require('dotenv').config();
var TelegramBot = require('node-telegram-bot-api');

var token = process.env.TELEGRAM_BOT_TOKEN;

var bot = new TelegramBot(token, {polling: false, webHook: false});

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

    if(update) {
        bot.processUpdate(update);
    }

    console.log("received update: ", update);

    callback(null, update.update_id && update.message ? telegramResponse(update.message.chat.id, "Hello!") : badResponse);
};

function determineUpdateType(update) {

}

function telegramResponse(chatId, message) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            method: "sendMessage",
            chat_id: chatId,
            text: message,
        }),
    };
}
