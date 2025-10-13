const express = require("express");
const session = require("express-session");
const { Issuer } = require("openid-client");

const app = express();
const PORT = 3000;

const AUTHORITY = "https://auth.contractsmarts.ai";
const CLIENT_ID = process.env.ZITADEL_CLIENT_ID;
const CLIENT_SECRET = process.env.ZITADEL_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";

// enable simple in-memory sessions
app.use(session({
  secret: "zitadel-test-secret",
  resave: false,
  saveUninitialized: true,
}));

let client;

// discover and prepare the ZITADEL OIDC client
(async () => {
  const issuer = await Issuer.discover(`${AUTHORITY}/.well-known/openid-configuration`);
  client = new issuer.Client({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uris: [REDIRECT_URI],
    response_types: ["code"],
  });
  console.log("OIDC client ready");
})();

// login route
app.get("/login", (req, res) => {
  const state = Math.random().toString(36).substring(2);
  req.session.state = state;
  const url = client.authorizationUrl({
    scope: "openid profile email",
    state,
  });
  res.redirect(url);
});

// callback route
app.get("/callback", async (req, res, next) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(REDIRECT_URI, params, { state: req.session.state });
    res.send(`<pre>✅ Login successful!\n\n${JSON.stringify(tokenSet.claims(), null, 2)}</pre>`);
  } catch (err) {
    console.error("❌ Callback error:", err);
    res.status(500).send(`<pre>${err.stack}</pre>`);
  }
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}/login`));
