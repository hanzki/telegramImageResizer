import {QueueClient} from "./queueClient";
import {Update} from "node-telegram-bot-api";
import * as TelegramBot from "node-telegram-bot-api";

export class ReceptionistBot {
    private queueClient;
    private telegramClient;

    constructor(telegramBotToken: string) {
        this.telegramClient = new TelegramBot(telegramBotToken);
        this.queueClient = new QueueClient();
    }

    public async receiveUpdate(update: Update): Promise<boolean> {
        try {
            await this.telegramClient.sendMessage(update.message.chat.id, JSON.stringify(update.message, null, 2));
            return true;
        } catch (e) {
            console.error(`Error while processing update '${update.update_id}'"`, e);
            return false;
        }
    }
}