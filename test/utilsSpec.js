/**
 * Created by hanzki on 13/11/16.
 */
"use strict";

const assert = require('assert');
const sinon = require('sinon');
const md5File = require('md5-file/promise');
const fs = require('fs');
const nock = require('nock');

const utils = require('./../src/utils');

describe('downloadFile', function () {

    it('should download file completely', function() {

        var testImage = nock('https://example.com')
            .get('/testImage.jpg')
            .replyWithFile(200, __dirname + '/resource/testImage.jpg');

        var url = 'https://example.com/testImage.jpg';
        var dest = '/tmp/test1.jpg';

        const expectedHash = '30f6a3d07c8866bf0e11c248fc602c27';

        return utils.downloadFile(url, dest)
            .then(file => md5File(file))
            .then(hash => assert.equal(hash, expectedHash));
    });

    after(function(done) {
        fs.unlink('/tmp/test1.jpg', done);
    });

});

describe('resizeImage', function () {

    it('should resize input image', function() {

        var dest = '/tmp';
        var original = __dirname + '/resource/testImage.jpg';

        if (fs.existsSync(dest + '/testImage.png')){
            fs.unlinkSync(dest + '/testImage.png');
        }

        return utils.resizeImage(original, dest);
    });

    after(function(done) {
        fs.unlink('/tmp/testImage.png', done);
    });

});
