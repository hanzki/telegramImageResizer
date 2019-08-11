import {ResizeRequest} from "./queueClient";
import {TelegramClient} from "./telegramClient";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as request from "request-promise-native";
import * as mime  from "mime-types";

export class ResizeBot {
    private telegramClient;

    private inputDir;
    private outputDir;

    constructor(telegramBotToken: string, directory: string) {
        this.telegramClient = new TelegramClient(telegramBotToken);

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
        const imageName = await this.downloadImage(request);

        await this.resizeImage(imageName, this.outputDir);

        await this.telegramClient.sendMessage(request.chatId, "Sorry I'm unable to send you your image right now.")
    }

    private downloadImage(request: ResizeRequest): Promise<string> {
        if(request.imageFile) {
            return this.downloadImageFromTelegram(request.imageFile.fileId)
        } else if(request.imageUrl) {
            return this.downloadImageFromInternet(request.imageUrl)
        } else {
            return Promise.reject("The resize request is missing both image file and image URL")
        }
    }

    private async downloadImageFromTelegram(fileId: string): Promise<string> {
        const file = await this.telegramClient.downloadFile(fileId, this.inputDir);
        if(file) {
            return file
        } else {
            throw new Error("File download failed");
        }
    }


    private async downloadImageFromInternet(imageUrl: string): Promise<string> {
        /*
        try {
            const headResponse = await request.head({uri: imageUrl});

            if(headResponse.statusCode && headResponse.statusCode.toString().startsWith("2")) {
                const contentType = headResponse.headers['content-type'];
                const dest = path.join(this.inputDir, 'image.' + mime.extension(contentType));

                const file = fs.createWriteStream(dest);
                const response = await request.get({uri: imageUrl});
                response.pipe(file);
            }

        }
        */
        throw new Error("Image URLs not supported")
    }

    private resizeImage(original, outputDir): Promise<void> {
        console.log(`Resizing file ${original} to dir ${outputDir}`);
        return Promise.resolve();
    }
}