import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import {ReceptionistBot} from "./src/receptionistBot";
import {Update} from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const receiveTelegram: APIGatewayProxyHandler = async (event) => {
  const receptionistBot = new ReceptionistBot(TELEGRAM_BOT_TOKEN);

  let update: Update;
  try {
    update = JSON.parse(event.body);
  } catch (e) {
    console.warn("Ignoring request with non-existent or malformed body");
  }

  if(update && update.update_id) {
    try {
      const success = await receptionistBot.receiveUpdate(update);
      if (success) {
          return { statusCode: 200, body: "OK" };
      } else {
          return { statusCode: 400, body: "BAD REQUEST" }
      }
    } catch (e) {
        console.error("Unexpected error while processing update", e);
        return { statusCode: 500, body: "ERROR" }
    }
  } else {
    return { statusCode: 400, body: "BAD REQUEST" }
  }
};
