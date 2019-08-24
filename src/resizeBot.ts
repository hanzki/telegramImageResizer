import {ResizeRequest} from "./queueClient";
import {TelegramClient} from "./telegramClient";
import * as fs from "fs";
import * as path from "path";
import {ImageDownloader} from "./imageDownloader";
import {ImageResizer} from "./imageResizer";
import { Logger } from "./logger";

export class ResizeBot {
    private telegramClient;
    private imageDownloader;
    private imageResizer;

    private inputDir;
    private outputDir;

    constructor(telegramBotToken: string, directory: string) {
        Logger.info("Starting ResizeBot v1");
        this.telegramClient = new TelegramClient(telegramBotToken);
        this.imageDownloader = new ImageDownloader(telegramBotToken);
        this.imageResizer = new ImageResizer();

        this.inputDir = path.join(directory, 'input');
        this.outputDir = path.join(directory, 'output');

        if (!fs.existsSync(this.inputDir)){
            fs.mkdirSync(this.inputDir, {recursive: true});
        }

        if (!fs.existsSync(this.outputDir)){
            fs.mkdirSync(this.outputDir, {recursive: true});
        }
    }

    public async processResizeRequest(request: ResizeRequest) {
        try {
            let imageFile;
            if(request.imageFile) {
                imageFile = await this.imageDownloader.downloadTelegramImage(request.imageFile.fileId, this.inputDir);
            } else if(request.imageUrl) {
                imageFile = await this.imageDownloader.downloadInternetImage(request.imageUrl, this.inputDir);
            } else {
                throw new Error("The resize request is missing both image file and image URL");
            }

            const resizedImage = await this.imageResizer.resizeImageToStickerSpec(imageFile, this.outputDir);

            await this.telegramClient.sendFile(request.chatId, resizedImage);
            await this.telegramClient.sendMessage(request.chatId, "Here's your image ready to be made into a sticker!");
        } catch (e) {
            Logger.error(`Couldn't process resize request: ${JSON.stringify(request)}`, e);
            try {
                await this.telegramClient.sendMessage(request.chatId, "Sorry I'm unable to process your image at this time.");
            } catch (e) {
                Logger.error(`Couldn't send an error message following failed resize attempt.`);
            }
        }
    }
}