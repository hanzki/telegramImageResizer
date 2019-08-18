import {TelegramClient} from "./telegramClient";


export class ImageDownloader {

    private telegramClient: TelegramClient;

    constructor(telegramBotToken: string) {
        this.telegramClient = new TelegramClient(telegramBotToken);
    }

    public downloadTelegramImage(fileId: string, destination: string): Promise<string> {
        return this.telegramClient.downloadFile(fileId, destination);
    }

    public async downloadInternetImage(url: string, destination: string): Promise<string> {
        return Promise.reject("Not Implemented");
    }
}