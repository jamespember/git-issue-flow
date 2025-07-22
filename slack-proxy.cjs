// slack-proxy.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'OPTIONS'],
}));

app.use(express.json());

app.post('/api/slack-proxy', async (req, res) => {
  const { endpoint, body } = req.body;
  console.log('Proxy forwarding to Slack:', endpoint, body);
  try {
    const slackRes = await fetch(`https://slack.com/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.VITE_SLACK_BOT_TOKEN}`,
      },
      body: new URLSearchParams(body).toString(),
    });
    const data = await slackRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Image proxy endpoint for Slack files
app.get('/api/slack-proxy/image', async (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl || typeof fileUrl !== 'string') {
    return res.status(400).send('Missing url parameter');
  }
  // Only allow Slack file URLs for security
  if (!fileUrl.startsWith('https://files.slack.com/')) {
    return res.status(403).send('Forbidden');
  }
  try {
    const slackRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SLACK_BOT_TOKEN}`
      }
    });
    if (!slackRes.ok) {
      return res.status(slackRes.status).send('Failed to fetch image from Slack');
    }
    // Set content type
    res.set('Content-Type', slackRes.headers.get('content-type') || 'application/octet-stream');
    // Stream the image
    slackRes.body.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Slack proxy server running on http://localhost:${PORT}`);
});