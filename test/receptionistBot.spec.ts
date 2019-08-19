import * as chai from 'chai';
import {ImportMock, MockManager} from "ts-mock-imports";
import {ReceptionistBot} from "../src/receptionistBot";
import * as QueueClientModule from "../src/queueClient";
import * as TelegramClientModule from "../src/telegramClient";
import * as ImageDownloaderModule from "../src/imageDownloader";

const expect = chai.expect;

describe("receptionistBot", () => {
    describe("receiveUpdate", () => {
        let telegramClientMock: MockManager<TelegramClientModule.TelegramClient>;
        let queueClientMock: MockManager<QueueClientModule.QueueClient>;
        let imageDownloaderMock: MockManager<ImageDownloaderModule.ImageDownloader>;
        let receptionistBot: ReceptionistBot;

        beforeEach('mock out dependencies', function () {
            telegramClientMock = ImportMock.mockClass(TelegramClientModule, 'TelegramClient');
            queueClientMock = ImportMock.mockClass(QueueClientModule, 'QueueClient');
            imageDownloaderMock = ImportMock.mockClass(ImageDownloaderModule, 'ImageDownloader');

            receptionistBot = new ReceptionistBot("TEST", "TEST_QUEUE");
        });

        afterEach('restore dependencies', function () {
            imageDownloaderMock.restore();
            queueClientMock.restore();
            telegramClientMock.restore();
        });

        it("should add message to queue if the update contains image URL", async () => {
            const update: any = {
                update_id: 123,
                message: {
                    chat: {
                        id: 12345
                    },
                    from: {
                        username: "test",
                        first_name: "John",
                        last_name: "Doe"
                    },
                    text: "http://www.example.com/iamge.jpg",
                    entities: [
                        {
                            offset: 0,
                            length: 32,
                            type: "url"
                        }
                    ]
                }
            };

            const sendMessageStub = telegramClientMock.mock("sendMessage", Promise.resolve(true));
            const insertMessageStub = queueClientMock.mock("insertMessage", Promise.resolve(true));
            const getUrlContentTypeStub = imageDownloaderMock.mock("getUrlContentType", Promise.resolve("image/jpeg"));

            const result = await receptionistBot.receiveUpdate(update);

            expect(sendMessageStub.called).to.be.true;
            expect(insertMessageStub.called).to.be.true;
            expect(result).to.be.true;
        });

        it("should add message to queue if the update contains photo", async () => {
            const testFileId = "test_file_id";
            const update: any = {
                update_id: 123,
                message: {
                    chat: {
                        id: 12345
                    },
                    from: {
                        username: "test",
                        first_name: "John",
                        last_name: "Doe"
                    },
                    photo: [
                        {
                            file_id: testFileId,
                            width: 640,
                            height: 800
                        }
                    ]
                }
            };

            const sendMessageStub = telegramClientMock.mock("sendMessage", Promise.resolve(true));
            const insertMessageStub = queueClientMock.mock("insertMessage", Promise.resolve(true));

            const result = await receptionistBot.receiveUpdate(update);

            expect(sendMessageStub.called).to.be.true;
            expect(insertMessageStub.called).to.be.true;
            expect(result).to.be.true;
        });

        it("should add message to queue if the update contains document", async () => {
            const testFileId = "test_file_id";
            const update: any = {
                update_id: 123,
                message: {
                    chat: {
                        id: 12345
                    },
                    from: {
                        username: "test",
                        first_name: "John",
                        last_name: "Doe"
                    },
                    document: {
                        file_name: "image.jpg",
                        file_id: testFileId,
                        mime_type: "image/jpeg"
                    }
                }
            };

            const sendMessageStub = telegramClientMock.mock("sendMessage", Promise.resolve(true));
            const insertMessageStub = queueClientMock.mock("insertMessage", Promise.resolve(true));

            const result = await receptionistBot.receiveUpdate(update);

            expect(sendMessageStub.called).to.be.true;
            expect(insertMessageStub.called).to.be.true;
            expect(result).to.be.true;
        });
    });
});