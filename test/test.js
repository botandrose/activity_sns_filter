import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';

chai.use(chaiHttp);
chai.should();

describe("app", () => {
  describe("GET /", () => {
    describe("when SNS message is for a userId in the list", () => {
      it("returns 201")
      it("sends an http request to the app")
    });
    describe("when SNS message is NOT for a userId in the list", () => {
      it("returns 204")
      it("does not send an http request to the app")
    });
  });
});
