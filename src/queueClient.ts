import * as AWS from 'aws-sdk';

export class QueueClient {

    private sqs: AWS.SQS;
    private readonly queueName: string;
    private queueUrl: string;

    constructor(queueName: string) {
        this.queueName = queueName;
        this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    }

    public async insertMessage(message: ResizeRequest): Promise<boolean> {
        try {
            const params = {
                MessageBody: JSON.stringify(message),
                QueueUrl: await this.getQueueUrl()
            };

            await this.sqs.sendMessage(params).promise();
            return true;
        } catch (e) {
            console.error(`Error while trying to insert message to SQS. Message: ${JSON.stringify(message)} QueueUrl: ${this.queueUrl}`, e);
            return false;
        }
    }

    private async getQueueUrl(): Promise<string> {
        if(this.queueUrl) {
            return this.queueUrl
        } else {
            const params = { QueueName: this.queueName };
            const data = await this.sqs.getQueueUrl(params).promise();
            this.queueUrl = data.QueueUrl;
            return data.QueueUrl;
        }
    }

}

export interface ResizeRequest {
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