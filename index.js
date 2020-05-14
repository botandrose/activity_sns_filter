const app = require('./app');

const PORT = process.env.PORT || 3000;
const PATH = process.env.PATH || '/';
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const FORWARD_URL = process.env.FORWARD_URL;

app.boot({
  username: USERNAME,
  password: PASSWORD,
  path: PATH,
  port: PORT,
  forwardUrl: FORWARD_URL,
  refreshFrequency: 60000,
});

