/**
 * Created by hanzki on 11/11/16.
 */
"use strict";

const assert = require('assert');
const sinon = require('sinon');

const tgRequestHandler = require('./../src/tgRequestHandler');
const TgBot = require('./../src/tgBot');

describe('TgRequestHandler', function() {

    describe('#processUpdate', function () {
        const bot = new TgBot("test-token");

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
});
