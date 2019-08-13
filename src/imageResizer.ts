import * as im from 'imagemagick';
import * as path from "path";
import * as util from 'util';

const convert = util.promisify(im.convert);

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
        const outputFile = path.basename(imageFile, path.extname(imageFile)) + '.' + outputType;
        const outputFilePath = path.join(destination, outputFile);
        const geometry = Math.floor(width) + 'x' + Math.floor(height);

        await convert([imageFile, '-resize', geometry, outputFilePath]);
        return outputFilePath;
    }
}

export enum ImageFormat {
    JPEG = 'jpeg',
    PNG = 'png'
}