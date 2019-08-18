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

            const req = request(url)
                .on('response', response => {
                    const contentType = response.headers['content-type'];
                    const destinationFile = path.join(destination, "image." + mime.extension(contentType));
                    const file = fs.createWriteStream(destinationFile);

                    req.pipe(file).on('finish', () => {
                        console.log(`downloaded ${destinationFile}`);
                        resolve(destinationFile);
                    })
                })
                .on('error', (err) => {
                    reject(err);
                });

        });
    }

    public getUrlContentType(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const options = {uri: url, method: "HEAD"};
            request(options)
                .on('response', response => {
                    const contentType = response.headers['content-type'];
                    if (contentType) {
                        resolve(contentType)
                    } else {
                        reject(new Error("Couldn't receive content-type"));
                    }
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    }
}