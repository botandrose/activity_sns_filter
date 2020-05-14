const express = require('express');
const expressBasicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
require('node-fetch'); // must be global otherwise won't be caught by fetch-mock in test

let app = {
  express: express().use(bodyParser.text()),

  userIds: new Set(),

  boot: function({ username, password, path, port, forward_url, refresh_frequency }) {
    this.username = username;
    this.password = password;
    this.forward_url = forward_url;

    if(this.username && this.password) {
      this.express.use(expressBasicAuth({
        users: { [this.username]: this.password },
      }));
    }

    this.express.post(path, (req, res) => {
      const body = JSON.parse(req.body);
      if(this.filter(body)) {
        res.status(201).end();
      } else {
        res.status(204).end();
      }
    });

    setInterval(() => this.refreshUserIds(), refresh_frequency);
    return this.refreshUserIds().then(() => this.express.listen(port));
  },

  refreshUserIds: function() {
    return fetch(this.forward_url, { headers: this.authHeaders() })
      .then(res => res.json())
      .then(data => {
        console.log(`Fetched ${data.length} user ids`);
        this.userIds = new Set(data);
      });
  },

  filter: function(body) {
    const message = body["message"];
    const userId = JSON.parse(message)["userId"];
    const found = this.userIds.has(userId);
    if(found) {
      console.log(`Forwarding message for: ${userId}`);
      fetch(this.forward_url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          this.authHeaders(),
        ),
      });
    }
    return found;
  },

  authHeaders: function() {
    if(this.username && this.password) {
      return { 'Authorization': 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64') };
    } else {
      return {};
    }
  },
};

module.exports = app;
