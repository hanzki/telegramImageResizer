import * as chai from 'chai';
import {APIGatewayProxyResult} from 'aws-lambda';
import * as handler from '../handler';
import {ImportMock, MockManager} from "ts-mock-imports";
import * as ReceptionistBotModule from "../src/receptionistBot";

const expect = chai.expect;

describe("handler", () => {
    describe("receiveTelegram", () => {
        let receptionistBotMock: MockManager<ReceptionistBotModule.ReceptionistBot>;

        beforeEach('mock out dependencies', function () {
            receptionistBotMock = ImportMock.mockClass(ReceptionistBotModule, 'ReceptionistBot');
        });

        afterEach('restore dependencies', function () {
            receptionistBotMock.restore();
        });

        it("should respond with bad request to non-telegram updates", async () => {
            const event: any = {};

            const result = (await handler.receiveTelegram(event, null, null)) as APIGatewayProxyResult;

            expect(result.statusCode).to.equal(200);
            expect(result.body).to.equal('BAD REQUEST');
        });

        it("should respond with ok result when update processing succeeds", async () => {
            const update = {
                update_id: 123
            };
            const event: any = {
                body: JSON.stringify(update)
            };

            const receiveUpdateStub = receptionistBotMock.mock('receiveUpdate', Promise.resolve(true));

            const result = (await handler.receiveTelegram(event, null, null)) as APIGatewayProxyResult;

            expect(receiveUpdateStub.called).to.be.true;
            expect(result.statusCode).to.equal(200);
            expect(result.body).to.equal('OK');
        });
    });
});