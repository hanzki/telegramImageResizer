/**
 * Created by hanzki on 11/11/16.
 */

'use strict';

const https = require('https');
const fs = require('fs');
const Client = require('node-rest-client').Client;

const client = new Client();

class TgBot {

    constructor(token) {
        this.token = token;
    }

    processUpdate(update) {
        var result = Promise.resolve();

        if(update.message) {
            result = this.processMessage(update.message);
        }

        return result;
    }

    processMessage(msg) {

        var result;

        if(msg.photo) {
            result = this.processPhoto(msg.photo[0].file_id);
        } else if (msg.document) {
            result = this.processPhoto(msg.document.file_id);
        } else {
            result = this.sendMessage(msg.chat.id, "Send me an image");
        }

        return result;
    }

    processPhoto(fileId) {
        return this.downloadFile(fileId);
    }

    downloadFile(fileId) {

        return Promise.resolve();

        /*
        var args = {
            parameters: { file_id: fileId }
        };

        var p = new Promise( (resolve, reject) => {
            client.get('https://api.telegram.org/bot' + this.token + '/sendMessage', args, (data, response) => {

                var dest = "image.png";
                var url = 'https://api.telegram.org/file/bot' + this.token + '/' + data.file_path;
                var file = fs.createWriteStream(dest);

                https.get(url, (response) => {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close(resolve(dest));  // close() is async, call cb after close completes.
                    });
                }).on('error', (err) => { // Handle errors
                    fs.unlink(dest); // Delete the file async. (But we don't check the result)
                    reject(err);
                });

            }).on('error', (err) => {
                reject(err);
            });
        });

        return p;
        */

    }

    sendMessage(chatId, message) {

        var args = {
            data: {
                chat_id: chatId,
                text: message
            },
            headers: { 'Content-Type': 'application/json' }
        };

        var p = new Promise( (resolve, reject) => {
            client.post('https://api.telegram.org/bot' + this.token + '/sendMessage', args, (data, response) => {
                resolve(data);
            }).on('error', (err) => {
                reject(err);
            });
        });

        return p;
    }

    sendFile(chatId, file) {

    }

}

module.exports = TgBot;
