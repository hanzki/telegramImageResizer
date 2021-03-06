import * as chai from 'chai';
import {ImportMock, MockManager} from "ts-mock-imports";
import * as TelegramClientModule from "../src/telegramClient";
import {ImageDownloader} from "../src/imageDownloader";
import * as fs from "fs";
import {promisify} from 'util'
import * as path from "path";
import * as gm from "gm";
import {ImageInfo} from "gm";

const expect = chai.expect;

const mkdtemp = promisify(fs.mkdtemp);
const rmdir = promisify(fs.rmdir);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

const identify: (string) => Promise<ImageInfo> = (filePath) => new Promise((resolve, reject) => {
    try {
        gm(filePath).identify((err, value) => err ? reject(err) : resolve(value));
    } catch (e) {
        reject(e);
    }
});

describe("imageDownloader", () => {
    describe("downloadTelegramImage", () => {
        let telegramClientMock: MockManager<TelegramClientModule.TelegramClient>;
        let imageDownloader: ImageDownloader;
        let testDir;

        beforeEach('mock out dependencies and create test dir', async () => {
            telegramClientMock = ImportMock.mockClass(TelegramClientModule, 'TelegramClient');

            imageDownloader = new ImageDownloader("TEST");

            testDir = await mkdtemp('test-dir');
        });

        afterEach('restore dependencies and remove test dir', async () => {
            telegramClientMock.restore();

            let entries = await readdir(testDir, { withFileTypes: true });
            await Promise.all(entries.map(entry => {
                let fullPath = path.join(testDir, entry.name);
                return unlink(fullPath);
            }));
            await rmdir(testDir);
        });

        it("should download image from Telegram and save it to given destination", async () => {
            const telegramFileId = "12345";

            const downloadFileStub = telegramClientMock.mock('downloadFile', Promise.resolve("image.jpg"));

            await imageDownloader.downloadTelegramImage(telegramFileId, testDir);

            expect(downloadFileStub.calledOnceWith(telegramFileId, testDir)).to.be.true;
        });
    });

    describe("downloadInternetImage", () => {
        let telegramClientMock: MockManager<TelegramClientModule.TelegramClient>;
        let imageDownloader: ImageDownloader;
        let testDir;

        beforeEach('mock out dependencies and create test dir', async () => {
            telegramClientMock = ImportMock.mockClass(TelegramClientModule, 'TelegramClient');

            imageDownloader = new ImageDownloader("TEST");

            testDir = await mkdtemp('test-dir');
        });

        afterEach('restore dependencies and remove test dir', async () => {
            telegramClientMock.restore();

            let entries = await readdir(testDir, { withFileTypes: true });
            await Promise.all(entries.map(entry => {
                let fullPath = path.join(testDir, entry.name);
                return unlink(fullPath);
            }));
            await rmdir(testDir);
        });

        it("should download image from Telegram and save it to given destination", async () => {

            const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f4/Honeycrisp.jpg";

            const result = await imageDownloader.downloadInternetImage(imageUrl, testDir);

            const imageStats = await stat(result);

            expect(imageStats && imageStats.isFile() && imageStats.size > 0).to.be.true;
        });

        it("should give the filename appropriate file type suffix", async () => {

            const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/4e/Single_apple.png";

            const result = await imageDownloader.downloadInternetImage(imageUrl, testDir);

            expect(result.endsWith(".png")).to.be.true;
        });

        it("should download an image uncorrupted", async () => {

            const imageUrl = "https://images-na.ssl-images-amazon.com/images/I/81xQBb5jRzL._SY355_.jpg";

            const result = await imageDownloader.downloadInternetImage(imageUrl, testDir);

            const imageInfo = await identify(result);

            expect(imageInfo.format).to.equal('JPEG');
        });

    });
});