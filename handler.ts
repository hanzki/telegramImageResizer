import {APIGatewayProxyHandler, SQSHandler} from 'aws-lambda';
import 'source-map-support/register';
import {ReceptionistBot} from "./src/receptionistBot";
import {Update} from "node-telegram-bot-api";
import {ResizeBot} from "./src/resizeBot";
import * as path from "path";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RESIZE_REQUEST_QUEUE_NAME = process.env.RESIZE_REQUEST_QUEUE_NAME;

export const receiveTelegram: APIGatewayProxyHandler = async (event) => {
  const receptionistBot = new ReceptionistBot(TELEGRAM_BOT_TOKEN, RESIZE_REQUEST_QUEUE_NAME);

  let update: Update;
  try {
    update = JSON.parse(event.body);
  } catch (e) {
    console.warn("Ignoring request with non-existent or malformed body");
  }

  if(update && update.update_id) {
    try {
      const timer = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            clearTimeout(wait);
            resolve("TIMEOUT");
        }, 5000);
      });
      const success = await Promise.race([
          receptionistBot.receiveUpdate(update),
          timer
      ]);

      if (success === "TIMEOUT") {
          console.error(`Timeout while processing update #${update.update_id}`);
          return { statusCode: 200, body: "TIMEOUT" }
      }
      if (success) {
          return { statusCode: 200, body: "OK" };
      } else {
          console.error(`ReceptionistBot was unable to process update #${update.update_id}`);
          return { statusCode: 200, body: "BAD REQUEST" }
      }
    } catch (e) {
        console.error("Unexpected error while processing update", e);
        return { statusCode: 200, body: "ERROR" }
    }
  } else {
    return { statusCode: 200, body: "BAD REQUEST" }
  }
};

export const processResizeRequest: SQSHandler = async (event) => {

  const records = event.Records || [];

  await Promise.all(records.map(async record => {
    try {
      const resizeBot = new ResizeBot(TELEGRAM_BOT_TOKEN, path.join("/", "tmp", record.messageId));

      console.info(`Received a SQS record: ${JSON.stringify(record)}`);
      await resizeBot.processResizeRequest(JSON.parse(record.body));
    } catch (e) {
        console.error(`Error while processing the SQS message #${record.messageId}`, e)
    }
  }));
};
