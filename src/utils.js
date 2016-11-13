/**
 * Created by hanzki on 13/11/16.
 */
'use strict';

const https = require('https');
const fs = require('fs');

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
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
    });
}

module.exports.downloadFile = downloadFile;
