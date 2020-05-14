import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';

chai.use(chaiHttp);
chai.should();

describe("app", () => {
  describe("GET /", () => {
    describe("when SNS message is for a userId in the list", () => {
      it("returns 201")
      it("forwards SNS message to the app")
    });
    describe("when SNS message is NOT for a userId in the list", () => {
      it("returns 204")
      it("does NOT forward SNS message to the app")
    });
  });
});
