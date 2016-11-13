/**
 * Created by hanzki on 11/11/16.
 */

'use strict';

const https = require('https');
const fs = require('fs');
const restler = require('restler');
const path = require('path');
const Client = require('node-rest-client').Client;

const utils = require('./utils');

const client = new Client();

class TgBot {

    constructor(token) {
        this.token = token;
        this.imageDir = '/tmp/images/';
        this.outputDir = '/tmp/output/';

        if (!fs.existsSync(this.imageDir)){
            fs.mkdirSync(this.imageDir);
        }

        if (!fs.existsSync(this.outputDir)){
            fs.mkdirSync(this.outputDir);
        }
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
            var largestPhoto = msg.photo.sort((p1, p2) => p2.width * p2.height - p1.width * p1.height)[0];
            result = this.processPhoto(msg.chat.id, largestPhoto.file_id, 'image/jpeg');
        } else if (msg.document && msg.document.mime_type.startsWith('image/')) {
            result = this.processPhoto(msg.chat.id, msg.document.file_id, msg.document.mime_type);
        } else {
            result = this.sendMessage(msg.chat.id, "Send me an image");
        }

        return result;
    }

    processPhoto(chatId, fileId, mimeType) {
        var p = this.getFile(fileId)
            .then((image) => utils.resizeImage(image, this.outputDir))
            .then((image) => {
                return this.sendFile(chatId, image, 'image/png');
            });

        return p;
    }

    getFile(fileId) {

        var args = {
            parameters: { file_id: fileId }
        };

        var p = new Promise( (resolve, reject) => {
            //For some reason sinon mock doesn't work for utils.downloadFile inside client.get callback
            var mockableDownloadFile = utils.downloadFile;

            client.get('https://api.telegram.org/bot' + this.token + '/getFile', args, (data, response) => {
                if( ! response.statusCode.toString().startsWith("2")) return reject('got ' + response.statusCode + ' response');

                var dest = this.imageDir + path.basename(data.result.file_path);
                var url = 'https://api.telegram.org/file/bot' + this.token + '/' + data.result.file_path;

                mockableDownloadFile(url, dest).then(resolve, reject);

            }).on('error', (err) => {
                reject(err);
            });
        });

        return p;

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
                if( ! response.statusCode.toString().startsWith("2")) return reject('got ' + response.statusCode + ' response');
                else resolve(data);
            }).on('error', (err) => {
                reject(err);
            });
        });

        return p;
    }

    sendFile(chatId, file, mimeType) {

        var url = 'https://api.telegram.org/bot' + this.token + '/sendDocument';

        var p = new Promise((resolve, reject) => {
            fs.stat(file, (err, stats) => {
                restler.post(url, {
                    multipart: true,
                    data: {
                        chat_id: chatId,
                        document: restler.file(file, null, stats.size, null, mimeType)
                    }
                }).on("complete", function (result) {
                    if(result instanceof Error) {
                        reject(result);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        return p;
    }

}

module.exports = TgBot;
