/**
 * Created by hanzki on 13/11/16.
 */
"use strict";

const assert = require('assert');
const sinon = require('sinon');
const md5File = require('md5-file/promise');

const utils = require('./../src/utils');

describe('downloadFile', function () {

    it('should download file completely', function() {
        this.timeout(5000); //Set timeout to 5 seconds

        var url = 'https://upload.wikimedia.org/wikipedia/commons/9/95/Translohr_STE4_-_143.jpg';
        var dest = '/tmp/test1.jpg';

        const expectedHash = '30f6a3d07c8866bf0e11c248fc602c27';

        return utils.downloadFile(url, dest)
            .then(file => md5File(file))
            .then(hash => assert.equal(hash, expectedHash));
    });

});
