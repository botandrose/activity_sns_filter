const express = require('express');
const expressBasicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');

let app = {
  express: express().use(bodyParser.text()),

  set basicAuth(users) {
    if(users && !Object.values(users).includes(undefined)) {
      this.express.use(expressBasicAuth({
        users: users,
      }));
    };
  },

  configure: function({ path, basicAuth, filter }) {
    this.basicAuth = basicAuth;
    this.filter = filter

    this.express.post(path, (req, res) => {
      const body = JSON.parse(req.body);
      if(this.filter(body)) {
        res.status(201).end();
      } else {
        res.status(204).end();
      }
    });
  },

  listen: function(port) {
    this.express.listen(port);
  },
};

module.exports = app;
