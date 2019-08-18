import {QueueClient, ResizeRequest} from "./queueClient";
import {Message, Update} from "node-telegram-bot-api";
import {TelegramClient} from "./telegramClient";
import {ImageDownloader} from "./imageDownloader";

export class ReceptionistBot {
    private queueClient;
    private telegramClient;
    private imageDownloader;

    constructor(telegramBotToken: string, queueName: string) {
        this.telegramClient = new TelegramClient(telegramBotToken);
        this.queueClient = new QueueClient(queueName);
        this.imageDownloader = new ImageDownloader(telegramBotToken);
    }

    readonly SUPPORTED_FILE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/bmp",
        "image/gif",
        "image/tiff"
    ];

    public async receiveUpdate(update: Update): Promise<boolean> {
        try {
            if (update.message) {
                const chatId = update.message.chat.id;

                // TODO: Remove this debug message
                await this.telegramClient.sendMessage(chatId, JSON.stringify(update.message, null, 2));

                const imageUrl = this.extractImageUrl(update.message);
                const imageFileId = this.extractImageFileId(update.message);

                const validUrl = imageUrl && await this.validateUrl(imageUrl);

                if (validUrl || imageFileId) {
                    const imageFile = imageFileId ? { fileId: imageFileId } : null;
                    const queueMsg: ResizeRequest = {
                        chatId: chatId,
                        sender: this.extractSender(update.message),
                        imageUrl: imageUrl,
                        imageFile: imageFile
                    };

                    await this.queueClient.insertMessage(queueMsg);
                    await this.telegramClient.sendMessage(chatId, "Thank you. I'll resize your image in a jiffy!");
                } else {
                    await this.telegramClient.sendMessage(chatId, "Please send me an image or a link to an image");
                }
            } else {
                console.warn(`Ignoring update #${update.update_id} because it doesn't have a message`);
            }

            return true;
        } catch (e) {
            console.error(`Error while processing update '${update.update_id}'"`, e);
            return false;
        }
    }

    extractImageUrl(message: Message): null | string {
        const urlEntity = message.entities && message.entities.find(e => e.type === "url");
        if (urlEntity) {
            return message.text.substring(urlEntity.offset, urlEntity.offset + urlEntity.length);
        } else {
            return null;
        }
    }

    async validateUrl(url: string): Promise<boolean> {
        const contentType = await this.imageDownloader.getUrlContentType(url);

        if(this.SUPPORTED_FILE_TYPES.includes(contentType)) {
            return true;
        } else {
            console.log(`Unsupported file type: ${contentType}`);
            return false;
        }
    }

    extractImageFileId(message: Message): null | string {
        if (message.photo && message.photo.length) {
            const byPhotoSize = (p1, p2) => p2.width * p2.height - p1.width * p1.height;
            const largestPhoto = message.photo.sort(byPhotoSize)[0];
            return largestPhoto.file_id
        } else if (message.document) {
            if(this.SUPPORTED_FILE_TYPES.includes(message.document.mime_type)) {
                return message.document.file_id
            } else {
                console.log(console.log(`Unsupported file type: ${message.document.mime_type}`));
                return null;
            }
        } else {
            return null
        }
    }

    extractSender(message: Message) {
        const username = message.from && message.from.username;
        const firstName = message.from && message.from.first_name || "";
        const lastName = message.from && message.from.last_name || "";
        const name = `${firstName} ${lastName}`.trim() || null;

        return { username: username, name: name }
    }
}