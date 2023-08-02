import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from "../index.js";

chai.use(chaiHttp);
const assert = chai.assert;
const request = chai.request;

describe("Router Integration tests", function () {
	it("GET / => Server up and running", function (done) {
		request(server)
			.get("/")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.text, "Server is up and running");
				assert.equal(res.header["content-length"], "24");
				assert.equal(res.header["x-powered-by"], "Express");
				assert.equal(res.header["content-type"], "text/html; charset=utf-8");
				done();
			});
	});

	it("GET /room => JSON{room: room_name}", function (done) {
		request(server)
			.get("/room")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.type, "application/json");
				assert.equal(res.header["x-powered-by"], "Express");
				assert.hasAllDeepKeys(res.body, ["room"]);
				assert.isString(res.body["room"]);
				assert.equal(res.body["room"].split("-").length, 3);
				done();
			});
	});

	it("Block GET /room when origin not allowed by CORS", function (done) {
		request(server)
			.get("/room")
			.set("Origin", "http://test.com")
			.end((err, res) => {
				assert.equal(res.status, 500);
				assert.isTrue(res.text.includes("Not allowed by CORS"));
				done();
			});
	});
});
