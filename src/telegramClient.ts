// Fixing issue with node-telegram-bot-api. See: https://github.com/yagop/node-telegram-bot-api/issues/319
process.env.NTBA_FIX_319 = '1';

import * as TelegramBot from "node-telegram-bot-api";
import { Logger } from "./logger";

export class TelegramClient {

    private bot: TelegramBot;

    constructor(telegramBotToken: string) {
        this.bot = new TelegramBot(telegramBotToken);
    }

    public async sendMessage(chatId: number, message: string): Promise<boolean> {
        try {
            await this.bot.sendMessage(chatId, message);
            return true;
        } catch (e) {
            Logger.error(`Couldn't send a telegram message to chat #${chatId}. Error code: ${e.code || e}`);
            return false;
        }
    }

    public async downloadFile(fileId: string, directory: string): Promise<null | string> {
        try {
            return await this.bot.downloadFile(fileId, directory)
        } catch (e) {
            Logger.error(`Couldn't download telegram file #${fileId}. Error code: ${e.code || e}`);
            return null;
        }
    }

    public async sendFile(chatId: number, file: string): Promise<boolean> {
        try {
            await this.bot.sendDocument(chatId, file);
            return true;
        } catch (e) {
            Logger.error(`Couldn't upload a file to chat #${chatId}. Error code: ${e.code || e}`);
            return false;
        }
    }

}