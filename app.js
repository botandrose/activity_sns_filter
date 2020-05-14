const express = require('express');
const expressBasicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

let app = {
  express: express().use(bodyParser.text()),

  userIds: new Set(),

  boot: function({ username, password, path, port, forward_url, refresh_frequency }) {
    this.username = username;
    this.password = password;
    this.forward_url = forward_url;
    this.basicAuth = basicAuth;

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

    setInterval(this.refreshUserIds, refresh_frequency);
    this.refreshUserIds().then(() => this.express.listen(port));
  },

  refreshUserIds: function() {
    fetch(this.forward_url, { headers: this.authHeaders() })
      .then(res => res.json())
      .then(data => {
        console.log(`Fetched ${data.length} user ids`);
        userIds = new Set(data);
      });
  },

  filter: function(body) {
    const message = body["message"];
    const userId = JSON.parse(message)["userId"];
    const found = userIds.has(userId);
    if(found) {
      console.log(`Forwarding message for: ${userId}`);
      fetch(this.forward_url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          this.authHeaders()
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
