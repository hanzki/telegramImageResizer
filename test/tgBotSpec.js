/**
 * Created by hanzki on 11/11/16.
 */
"use strict";

const assert = require('assert');
const sinon = require('sinon');
const nock = require('nock');
const multiparty = require('multiparty');
const formidable = require('formidable');

const TgBot = require('./../src/tgBot');
const utils = require('./../src/utils');

describe('TgBot', function() {

    const token = 'TEST_TOKEN';
    const bot = new TgBot(token);

    describe('#processUpdate', function () {

        it('calls processMessage', sinon.test(function() {
            const update = {
                update_id: 123,
                message: {}
            };

            var processMesssageStub = this.stub(TgBot.prototype, 'processMessage', () => Promise.resolve());

            return bot.processUpdate(update).then(() => {
                sinon.assert.calledOnce(processMesssageStub);
            });
        }));

    });

    describe('#sendMessage', function () {

        it('should call telegram api', function() {

            const chatId = 12345;
            const message = 'Hello World!';

            const tgSendMessage = nock('https://api.telegram.org')
                .post('/bot' + token + '/sendMessage', {
                    chat_id: chatId,
                    text: message
                })
                .reply(200);

            return bot.sendMessage(chatId, message).then(_ => {
                tgSendMessage.done();
            });;

        });

        it('should fail if message wasn\'t sent', function() {

            const chatId = 12345;
            const message = 'Hello World!';

            const tgSendMessage = nock('https://api.telegram.org')
                .post('/bot' + token + '/sendMessage', {
                    chat_id: chatId,
                    text: message
                })
                .reply(500);

            return bot.sendMessage(chatId, message)
                .then(_ => Promise.reject('expected error'), _ => Promise.resolve())
                .then(_ => {
                    tgSendMessage.done();
                });

        });

    });

    describe('#getFile', function () {

        it('should call telegram api', sinon.test(function () {

            const fileId = 12345;

            const tgGetFile = nock('https://api.telegram.org')
                .get('/bot' + token + '/getFile')
                .query({
                    file_id: fileId
                })
                .reply(200, {
                    "ok": true,
                    "result": {
                        "file_id": "AgADBAADjakxG6i1MgPkgITWdqJU0TJGaRkABOOF7AzcZsoJRIwBAAEC",
                        "file_size": 79201,
                        "file_path": "photo/file_6.jpg"
                    }
                });

            var downloadFileStub = this.stub(utils, 'downloadFile', () => Promise.resolve());

            return bot.getFile(fileId).then(() => {
                sinon.assert.calledOnce(downloadFileStub);
            }).then(_ => {
                tgGetFile.done();
            });

        }));

    });

    describe('#sendFile', function () {

        it('should call telegram api', function() {

            const chatId = 12345;
            const file = __dirname + '/resource/test.txt';

            const tgSendDocument = nock('https://api.telegram.org')
                .post('/bot' + token + '/sendDocument', _ => true)
                .reply(200);

            return bot.sendFile(chatId, file, 'text/plain').then(_ => {
                tgSendDocument.done();
            });

        });

    });

    describe('#processLink', function () {

        it('should test if link is image', sinon.test(function () {

            const chatId = 12345;
            const link = 'https://example.com/image.png';

            const headImage = nock('https://example.com')
                .head('/image.png')
                .reply(200,
                '',
                {'Content-Type': 'image/png'});

            var sendMessageStub = this.stub(TgBot.prototype, 'sendMessage', () => Promise.resolve());
            var sendFileStub = this.stub(TgBot.prototype, 'sendFile', () => Promise.resolve());
            var downloadFileStub = this.stub(utils, 'downloadFile', () => Promise.resolve());
            var resizeImageStub = this.stub(utils, 'resizeImage', () => Promise.resolve());


            return bot.processLink(chatId, link).then(_ => {
                headImage.done()
            });

        }));

    });
});
