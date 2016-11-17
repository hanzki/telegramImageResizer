/**
 * Created by hanzki on 11/11/16.
 */

'use strict';

const https = require('https');
const fs = require('fs');
const restler = require('restler');
const path = require('path');
const Client = require('node-rest-client').Client;
const mime = require('mime-types')

const utils = require('./utils');

const client = new Client();

class TgBot {

    constructor(token, dir) {
        this.token = token;
        this.imageDir = dir + 'images/';
        this.outputDir = dir + 'output/';

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
        } else if (msg.text && msg.entities.find(_ => _.type === "url")) {
            var entity = msg.entities.find(_ => _.type === "url");
            result = this.processLink(msg.chat.id, msg.text.substr(entity.offset, entity.length));
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

    processLink(chatId, link) {
        return new Promise( (resolve, reject) => {
            //For some reason sinon mock doesn't work for utils inside callback
            var _downloadFile = utils.downloadFile;
            var _resizeImage = utils.resizeImage;
            var _sendFile = this.sendFile.bind(this);

            restler.head(link)
                .on("complete", (result, response) => {
                    if(result instanceof Error) {
                        reject(result);
                    } else if( ! response.statusCode.toString().startsWith("2")) {
                        resolve(this.sendMessage(chatId, "I don't seem to be able to connect that url."));
                    } else if( ! (response.headers['content-type'] && response.headers['content-type'].startsWith("image/"))) {
                        resolve(this.sendMessage(chatId, "This doesn't look like an url of an image."));
                    } else {
                        var contentType = response.headers['content-type'];
                        var dest = this.imageDir + 'image.' + mime.extension(contentType);

                        var p = _downloadFile(link, dest)
                            .then(image => _resizeImage(image, this.outputDir))
                            .then(image => _sendFile(chatId, image, 'image/png'));

                        resolve(p);
                    }
                });
        });

        //return this.sendMessage(chatId, "Sorry I can't process links yet");
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

                resolve(mockableDownloadFile(url, dest));

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

        console.log("this is me", this);

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
