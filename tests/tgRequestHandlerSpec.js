/**
 * Created by hanzki on 10/11/16.
 */
"use strict";

const assert = require('assert');

const handler = require('./../src/tgRequestHandler').handler;

describe('TgRequestHandler', function() {

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
            body: "{}"
        };

        handler(event, null, (error, result) => {
                assert(result.statusCode == 400);
            }
        )
    });

    it('Ok on telegram update ', function() {
        const event = {
            body: JSON.stringify(
                    {
                        update_id: 123
                    }
                )
        };

        handler(event, undefined, (error, result) => {
                assert(result.statusCode == 200);
            }
        )
    });
});
