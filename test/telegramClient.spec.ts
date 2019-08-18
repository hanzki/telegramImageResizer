import {TelegramClient} from "../src/telegramClient";
import * as chai from "chai";

const expect = chai.expect;

describe("telgramClient", () => {
    describe("downloadFile", () => {
        it("should return Promise.resolve(null) in case download fails", async () => {
            const telegramClient = new TelegramClient("NOT_REAL_BOT_TOKEN");

            const result = await telegramClient.downloadFile("FILE_ID", "/tmp/");
            expect(result).to.be.null
        })
    })
})