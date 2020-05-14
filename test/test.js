const chai = require('chai');
const chaiHttp = require('chai-http');
const fetchMock = require('fetch-mock');

const app = require('../app');

chai.use(chaiHttp);
chai.should();

before(async () => {
  let forwardUrl = "https://example.com/messages";
  fetchMock.get(forwardUrl, ["1","2","3"]);
  fetchMock.post(forwardUrl, 201);

  await app.boot({
    path: "/",
    forward_url: forwardUrl,
    refresh_frequency: 60000,
  });
})

describe("app", () => {
  describe("POST /", () => {
    describe("when SNS message is for a userId in the list", () => {
      it("returns 201", (done) => {
        chai.request(app.express)
          .post('/')
          .set("Content-Type", "text/plain")
          .send('{"message":"{\\"timeRangeStart\\":1571245940546,\\"timeRangeEnd\\":1571246360547,\\"userId\\":\\"1\\",\\"appId\\":\\"com.nike.ntc.brand.ios\\",\\"sources\\":[\\"nike.ntc.ios\\"],\\"metricTypes\\":[\\"rpe\\",\\"calories\\",\\"nikefuel\\"],\\"activityId\\":\\"8ed06ba3-d12c-4dc1-a773-cba81a0f0c5c\\",\\"receivedTime\\":1571246402784,\\"changeToken\\":\\"5819147260e25392eecbb1ab10480a1ed3bc600c8a379a88a035fa163d505e44:1571246402784\\",\\"changeType\\":\\"update\\",\\"payloadType\\":\\"activity\\",\\"session\\":false,\\"activityType\\":\\"training\\"}","trace":{"parentId":"-2721724131837535344","spanId":"-8694889937887914020","spanName":"persistAndEnqueueSync","userId":"0353d6f5-f7e9-4830-a803-a1fc370bfa04","traceId":"0c967b6959f4284c","sampleable":false,"traceStartTimeNanos":1017120644185959}}')
          .end((err, res) => {
            res.should.have.status(201);
            done();
          });
      });
      it("forwards SNS message to the app")
    });
    describe("when SNS message is NOT for a userId in the list", () => {
      it("returns 204")
      it("does NOT forward SNS message to the app")
    });
  });
});
