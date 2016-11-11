/**
 * Created by hanzki on 10/11/16.
 */
"use strict";

const assert = require('assert');
const sinon = require('sinon');

const TelegramBot = require('node-telegram-bot-api');

const handler = require('./../src/tgRequestHandler').handler;

describe('TgRequestHandler', function() {

    describe('#handler', function () {

        it('Lambda error on events without body', function() {
            const event = {
            };

            handler(event, null, (error, result) => {
                    assert(error);
                }
            )
        });

        it('Bad request on non telegram message', function() {
            const event = {
                body: '{}'
            };

            handler(event, null, (error, result) => {
                assert.ifError(error);
                assert(result.statusCode == 400);
            });
        });

        it('Ok on telegram update ', function() {
            const event = {
                body: JSON.stringify(
                    {
                        update_id: 123,
                        message: {
                            message_id: 123,
                            chat: {
                                id: 123456,
                                type: 'private'
                            },
                            date: 1476949729,
                            text: 'This is test'
                        }
                    }
                )
            };

            handler(event, undefined, (error, result) => {
                assert.ifError(error);
                assert(result.statusCode == 200);
            });
        });

        it('Call processPhoto on message with photos ', function() {
            const event = {
                body: JSON.stringify(
                    {
                        update_id: 123,
                        message: {
                            message_id: 123,
                            chat: {
                                id: 123456,
                                type: 'private'
                            },
                            date: 1476949729,
                            photo: [
                                {
                                    "file_id": "AgADBAADjqkxG6i1MgMOIOYI_WesFtV3ZxkABDzcPYhrjyvypKACAAEC",
                                    "file_size": 1100,
                                    "width": 90,
                                    "height": 67
                                }
                            ]
                        }
                    }
                )
            };

            sinon.stub(TelegramBot.prototype, 'sendPhoto');

            handler(event, undefined, (error, result) => {
                sinon.assert.calledOnce(TelegramBot.prototype.sendPhoto);
                assert.ifError(error);
                assert(result.statusCode == 200);
            });
        });

    });
});
