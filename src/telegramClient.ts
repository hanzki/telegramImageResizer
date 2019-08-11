// Fixing issue with node-telegram-bot-api. See: https://github.com/yagop/node-telegram-bot-api/issues/319
process.env.NTBA_FIX_319 = '1';

import * as TelegramBot from "node-telegram-bot-api";

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
            console.error(`Couldn't send a telegram message to chat #${chatId}`, e);
            return false;
        }
    }

}