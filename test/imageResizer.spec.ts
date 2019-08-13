import * as chai from 'chai';
import * as fs from "fs";
import * as path from "path";
import {promisify} from 'util'
import {ImageFormat, ImageResizer} from "../src/imageResizer";
import * as crypto from "crypto";
import * as im from 'imagemagick';

const expect = chai.expect;

const mkdtemp = promisify(fs.mkdtemp);
const rmdir = promisify(fs.rmdir);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const identify = promisify(im.identify);

describe("imageResizer", () => {
    describe("resizeImage", () => {
        let imageResizer;
        let testDir;

        beforeEach('create test dir', async () => {
            testDir = await mkdtemp('test-dir');
            imageResizer = new ImageResizer();
        });

        afterEach('remove test dir', async () => {
            let entries = await readdir(testDir, { withFileTypes: true });
            await Promise.all(entries.map(entry => {
                let fullPath = path.join(testDir, entry.name);
                return unlink(fullPath);
            }));
            await rmdir(testDir);
        });

        it("shouldn't change images if they are within given parameters", async () => {
            const inputFile = path.join('test', 'resources', 'kitten.jpg');

            const outputFile = await imageResizer.resizeImage(inputFile, testDir, 800, 800, ImageFormat.JPEG);

            const inputFileHash = await checksumFile('md5', inputFile);
            const outputFileHash = await checksumFile('md5', outputFile);

            expect(inputFileHash === outputFileHash);
        });

        it('should resize the image to fit within given constraints', async () => {
            const inputFile = path.join('test', 'resources', 'cat.jpg');

            const widthConstraint = 800;
            const heightConstraint = 800;

            const outputFile = await imageResizer.resizeImage(inputFile, testDir, widthConstraint, heightConstraint, ImageFormat.JPEG);

            const outputFileInfo = await identify(outputFile);

            expect(outputFileInfo.width <= widthConstraint);
            expect(outputFileInfo.height <= heightConstraint);
        });

        it('should convert the image to specified file type if necessary', async () => {
            const inputFile = path.join('test', 'resources', 'kitten.jpg');

            const desiredImageFormat = ImageFormat.PNG;

            const outputFile = await imageResizer.resizeImage(inputFile, testDir, 800, 800, desiredImageFormat);

            const outputFileInfo = await identify(outputFile);

            expect(outputFileInfo.format.toLowerCase === desiredImageFormat);
        });
    });
});

function checksumFile(hashName, path): Promise<string> {
    return new Promise((resolve, reject) => {
        let hash = crypto.createHash(hashName);
        let stream = fs.createReadStream(path);
        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}