import * as path from "path";
import * as gm from 'gm';
import { Logger } from "./logger";

export class ImageResizer {

    public resizeImageToStickerSpec(imageFile: string, destination: string): Promise<string> {
        const width = 512;
        const height = 512;
        const outputType = ImageFormat.PNG;
        const maxBytes = 512 * 1024;
        return this.resizeImage(imageFile, destination, width, height, outputType, maxBytes);
    }

    public async resizeImage(
        imageFile: string,
        destination: string,
        width: number,
        height: number,
        outputType: ImageFormat,
        maxBytes?: number
    ): Promise<string> {
        try {
            const outputFile = path.basename(imageFile, path.extname(imageFile)) + '.' + outputType;
            const outputFilePath = path.join(destination, outputFile);

            const resizePromise = new Promise<string>((resolve, reject) => {
                try {
                    gm(imageFile)
                        .resize(width, height)
                        .write(outputFilePath, err => {
                            if(err) {
                                reject(err);
                            } else {
                                resolve(outputFilePath);
                            }
                        });
                } catch (e) {
                    reject(e);
                }
            });

            return await resizePromise;
        } catch (e) {
            Logger.error("Image resize failed with error:", e);
            throw e;
        }
    }
}

export enum ImageFormat {
    JPEG = 'jpeg',
    PNG = 'png'
}