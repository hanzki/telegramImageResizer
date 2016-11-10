/**
 * Created by hanzki on 10/11/16.
 */

'use strict';

require('dotenv').config();

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

    callback(null, update.update_id ? okResponse : badResponse);
};
