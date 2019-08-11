export class QueueClient {

    public insertMessage(message: QueueMessage): Promise<boolean> {
        return Promise.resolve(true)
    }

}

export interface QueueMessage {
    chatId: number,
    sender: null | {
        username: null | string,
        name: null | string
    },
    imageUrl: null | string,
    imageFile: null | {
        fileId: string,
        mimeType?: null | string
    }
}