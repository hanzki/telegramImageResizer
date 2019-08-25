import { withTimeout, TimeoutError } from '../src/utils';
import * as chai from "chai";

const expect = chai.expect;

describe("utils", () => {
    describe("withTimeout", () => {

        const FAILURE_ERROR = new Error("TEST_ERROR");
        const SUCCESS_VALUE = "TEST_DONE"

        function successAfter(ms: number): Promise<string> {
            return new Promise((resolve, reject) => {
                let wait = setTimeout(() => {
                    clearTimeout(wait);
                    resolve(SUCCESS_VALUE);
                }, ms);
            });
        }

        function failAfter(ms: number): Promise<string> {
            return new Promise((resolve, reject) => {
                let wait = setTimeout(() => {
                    clearTimeout(wait);
                    reject(FAILURE_ERROR);
                }, ms);
            });
        }

        it("should give result of the promise normally if the promise finishes before timeout", async () => {
            const promise = successAfter(500);
            const timeout = 2000;

            const result = await withTimeout(timeout, promise);

            expect(result).to.equal(SUCCESS_VALUE);
        })

        it("should give error from the promise if the error is thrown before timeout", async () => {
            const promise = failAfter(500);
            const timeout = 2000;

            try {
                await withTimeout(timeout, promise)
                expect.fail();
            } catch (e) {
                expect(e).to.equal(FAILURE_ERROR);
            }
        })

        it("should give timeout error if promise doesn't finish before timeout", async () => {
            const promise = successAfter(2000);
            const timeout = 500;

            try {
                await withTimeout(timeout, promise)
                expect.fail();
            } catch (e) {
                expect(e.name).to.equal("TimeoutError");
            }
        })

        it("should give timeout error if promise doesn't finish before timeout even if it eventually throws an error", async () => {
            const promise = failAfter(2000);
            const timeout = 500;

            try {
                await withTimeout(timeout, promise)
                expect.fail();
            } catch (e) {
                expect(e).to.not.equal(FAILURE_ERROR);
                expect(e.name).to.equal("TimeoutError");
            }
        })
    })
}) 