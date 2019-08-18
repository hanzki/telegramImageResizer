import {TelegramClient} from "./telegramClient";
import * as request from "request";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";


export class ImageDownloader {

    private telegramClient: TelegramClient;

    constructor(telegramBotToken: string) {
        this.telegramClient = new TelegramClient(telegramBotToken);
    }

    public downloadTelegramImage(fileId: string, destination: string): Promise<string> {
        return this.telegramClient.downloadFile(fileId, destination);
    }

    public downloadInternetImage(url: string, destination: string): Promise<string> {
        return new Promise((resolve, reject) => {

            request(url, (error, response) => {
                if(error) {
                    console.error(`Error while downloading url "${url}"`, error);
                    reject(error);
                } else {
                    const contentType = response.headers['content-type'];
                    const destinationFile = path.join(destination, "image." + mime.extension(contentType));

                    const writeStream = fs.createWriteStream(destinationFile);
                    writeStream.on('finish', () => {
                        console.log(`downloaded ${destinationFile}`);
                        resolve(destinationFile);
                    });

                    response.pipe(writeStream);
                }
            });

        });
    }
}