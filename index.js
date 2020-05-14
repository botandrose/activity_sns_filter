const app = require('./app');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
const HTTP_PATH = process.env.HTTP_PATH || '/';
const HTTP_USERNAME = process.env.HTTP_USERNAME;
const HTTP_PASSWORD = process.env.HTTP_PASSWORD;

const authHeaders = (HTTP_USERNAME && HTTP_PASSWORD) ? { 'Authorization': 'Basic ' + new Buffer(HTTP_USERNAME + ':' + HTTP_PASSWORD).toString('base64') } : {}

let userIds = new Set();
function refreshUserIds() {
  fetch("https://heroes.nike.com/api/users", { headers: authHeaders })
    .then(res => res.json())
    .then(data => {
      console.log(`Fetched ${data.length} user ids`);
      userIds = new Set(data);
    });
}
refreshUserIds();
setInterval(refreshUserIds, 60000); // refresh user ids every minute

app.configure({
  path: HTTP_PATH,
  // basicAuth: { [HTTP_USERNAME]: HTTP_PASSWORD },

  filter: function(body) {
    const message = body["message"];
    const userId = JSON.parse(message)["userId"];
    const found = userIds.has(userId);
    if(found) {
      console.log(`Enqueuing sync for: ${userId}`);
      fetch(`https://heroes.nike.com/api/users?user_id=${userId}`, {
        method: 'POST',
        headers: authHeaders,
      });
    }
    return found;
  }
});

app.listen(PORT);
