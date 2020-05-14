const chai = require('chai');
const chaiHttp = require('chai-http');
const fetchMock = require('fetch-mock');

const app = require('../app');

chai.use(chaiHttp);
chai.should();

let forwardUrl = "https://example.com/messages";

before(async () => {
  fetchMock.get(forwardUrl, ["1","2","3"]);

  await app.boot({
    path: "/",
    forward_url: forwardUrl,
    refresh_frequency: 60000,
  });
})

beforeEach(() => fetchMock.post(forwardUrl, 201));

afterEach(() => fetchMock.reset());

function newMessageForUserId(id) {
  return `{"message":"{\\"timeRangeStart\\":1571245940546,\\"timeRangeEnd\\":1571246360547,\\"userId\\":\\"${id}\\",\\"appId\\":\\"com.nike.ntc.brand.ios\\",\\"sources\\":[\\"nike.ntc.ios\\"],\\"metricTypes\\":[\\"rpe\\",\\"calories\\",\\"nikefuel\\"],\\"activityId\\":\\"8ed06ba3-d12c-4dc1-a773-cba81a0f0c5c\\",\\"receivedTime\\":1571246402784,\\"changeToken\\":\\"5819147260e25392eecbb1ab10480a1ed3bc600c8a379a88a035fa163d505e44:1571246402784\\",\\"changeType\\":\\"update\\",\\"payloadType\\":\\"activity\\",\\"session\\":false,\\"activityType\\":\\"training\\"}","trace":{"parentId":"-2721724131837535344","spanId":"-8694889937887914020","spanName":"persistAndEnqueueSync","userId":"0353d6f5-f7e9-4830-a803-a1fc370bfa04","traceId":"0c967b6959f4284c","sampleable":false,"traceStartTimeNanos":1017120644185959}}`;
}

describe("app", () => {
  describe("POST /", () => {
    describe("when SNS message is for a userId in the list", () => {
      let newRequest = () => {
        return chai.request(app.express)
          .post('/')
          .set("Content-Type", "text/plain")
          .send(newMessageForUserId("1"));
      };

      it("returns 201", (done) => {
        newRequest().end((err, res) => {
          res.should.have.status(201);
          done();
        });
      });

      it("forwards SNS message to the app", (done) => {
        newRequest().end((err, res) => {
          fetchMock.called(forwardUrl, {
             method: 'POST',
             body: JSON.parse(newMessageForUserId("1")),
             headers: { 'Content-Type': 'application/json' },
          }).should.be.true;
          done();
        });
      });
    });

    describe("when SNS message is NOT for a userId in the list", () => {
      it("returns 204")
      it("does NOT forward SNS message to the app")
    });
  });
});
