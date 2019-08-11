import * as chai from 'chai';
import {ImportMock, MockManager} from "ts-mock-imports";
import {ReceptionistBot} from "../src/receptionistBot";
import * as QueueClientModule from "../src/queueClient";
import * as TelegramClientModule from "../src/telegramClient";

const expect = chai.expect;

describe("receptionistBot", () => {
    describe("receiveUpdate", () => {
        let telegramClientMock: MockManager<TelegramClientModule.TelegramClient>;
        let queueClientMock: MockManager<QueueClientModule.QueueClient>;
        let receptionistBot: ReceptionistBot;

        beforeEach('mock out dependencies', function () {
            telegramClientMock = ImportMock.mockClass(TelegramClientModule, 'TelegramClient');
            queueClientMock = ImportMock.mockClass(QueueClientModule, 'QueueClient');

            receptionistBot = new ReceptionistBot("TEST");
        });

        afterEach('restore dependencies', function () {
            telegramClientMock.restore();
            queueClientMock.restore();
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
                        file_id: testFileId
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