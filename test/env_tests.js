import 'dotenv/config'
import { assert } from "chai";
import { envDependentVariables } from "../socketio_util.js";

describe("Environment variables tests", function () {
	let test;
	beforeEach(() => {
		test = process.env.TEST;
	});
	afterEach(() => {
		process.env["TEST"] = "true";
	});
	it("If TEST is true", (done) => {
		assert.equal(test, "true");
		const [choiceTime, turnTime, ROUND] = envDependentVariables(process);
		assert.equal(choiceTime, 1000);
		assert.equal(turnTime, 2000);
		assert.equal(ROUND, 1);
		done();
	});

	it("If TEST is false", (done) => {
		process.env["TEST"] = "false";
		test = process.env.TEST;
		const [choiceTime, turnTime, ROUND] = envDependentVariables(process);
		assert.equal(choiceTime, 5000);
		assert.equal(turnTime, 36000);
		assert.equal(ROUND, 5);
		assert.equal(test, "false");
		process.env["TEST"] = "true";
		done();
	});
});
