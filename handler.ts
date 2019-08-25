import {APIGatewayProxyHandler, SQSHandler} from 'aws-lambda';
import 'source-map-support/register';
import {ReceptionistBot} from "./src/receptionistBot";
import {Update} from "node-telegram-bot-api";
import {ResizeBot} from "./src/resizeBot";
import * as path from "path";
import { Logger } from './src/logger';
import { withTimeout, TimeoutError } from './src/utils';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RESIZE_REQUEST_QUEUE_NAME = process.env.RESIZE_REQUEST_QUEUE_NAME;

const RECEIVE_TELEGRAM_TIMEOUT_MS = 5000;
const RESIZE_IMAGE_TIMEOUT_MS = 30000;

export const receiveTelegram: APIGatewayProxyHandler = async (event) => {
  const receptionistBot = new ReceptionistBot(TELEGRAM_BOT_TOKEN, RESIZE_REQUEST_QUEUE_NAME);

  let update: Update;
  try {
    update = JSON.parse(event.body);
    validateUpdate(update);
  } catch (e) {
    Logger.error("Couldn't parse request. Non-existent or malformed body", e);
    return { statusCode: 400, body: "BAD REQUEST"}
  }

  try {
    const success = await withTimeout(
      RECEIVE_TELEGRAM_TIMEOUT_MS,
      receptionistBot.receiveUpdate(update)
    );

    if (success) {
        return { statusCode: 200, body: "OK" };
    } else {
        Logger.error(`ReceptionistBot was unable to process update #${update.update_id}`);
        return { statusCode: 200, body:  unableToProcessUpdateResponse(update)}
    }
  } catch (e) {
    Logger.error("Unexpected error while processing update", e);
    return { statusCode: 200, body: unableToProcessUpdateResponse(update) }
  }
};

function validateUpdate(update: Update) {
  if(!update || !update.update_id) {
      throw new Error("Update missing 'update_id'");
  }
}

function unableToProcessUpdateResponse(update: Update): string {
  const chatId = update.message && update.message.chat && update.message.chat.id
  if(chatId) {
    return JSON.stringify({
      method: "sendMessage",
      chat_id: chatId,
      text: "Sorry. I'm unable to process your request at this time. Please try again later."
    })
  } else {
    return "";
  }
}

export const processResizeRequest: SQSHandler = async (event) => {

  const records = event.Records || [];

  await Promise.all(records.map(async record => {
    try {
      const resizeBot = new ResizeBot(TELEGRAM_BOT_TOKEN, path.join("/", "tmp", record.messageId));

      Logger.info(`Received a SQS message #${record.messageId}`, record);
      await withTimeout(RESIZE_IMAGE_TIMEOUT_MS, resizeBot.processResizeRequest(JSON.parse(record.body)));
    } catch (e) {
        Logger.error(`Error while processing the SQS message #${record.messageId}`, e)
    }
  }));
};
