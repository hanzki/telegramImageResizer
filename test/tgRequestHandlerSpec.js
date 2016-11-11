/**
 * Created by hanzki on 10/11/16.
 */
"use strict";

const assert = require('assert');
const sinon = require('sinon');

const tgRequestHandler = require('./../src/tgRequestHandler');
const TgBot = require('./../src/tgBot');

describe('TgRequestHandler', function() {

    describe('#handler', function () {

        const handler = (event, context) => {
            return new Promise((resolve, reject) => tgRequestHandler.handler(event, context, (error, result) => {
                if(error)
                    reject(error);
                else
                    resolve(result);
            }));
        };

        it('Lambda error on events without body', function() {
            const event = {
            };

            return handler(event, null).then((result) => {
                assert(false, "expected an error");
            }, (error) => {
                assert(error);
            });
        });

        it('Bad request on non telegram message', function() {
            const event = {
                body: '{}'
            };

            return handler(event, null).then((result) => {
                assert.equal(result.statusCode, 400);
            });
        });

        it('Ok on telegram update ', sinon.test(function() {
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

            var processUpdateStub = this.stub(TgBot.prototype, 'processUpdate', () => Promise.resolve());

            return handler(event, undefined).then((result) => {
                sinon.assert.calledOnce(processUpdateStub);
                assert.equal(result.statusCode, 200);
            });

        }));

        it('Call processPhoto on message with photos ', sinon.test(function() {
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

            var processUpdateStub = this.stub(TgBot.prototype, 'processUpdate', () => Promise.resolve());

            return handler(event, undefined).then((result) => {
                sinon.assert.calledOnce(processUpdateStub);
                assert(result.statusCode == 200);
            });
        }));

    });
});
