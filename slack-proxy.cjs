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
  const { endpoint, body, token } = req.body;
  console.log('Proxy forwarding to Slack endpoint:', endpoint);
  
  // Accept token from request or fall back to environment variable
  const slackToken = token || process.env.VITE_SLACK_BOT_TOKEN;
  
  if (!slackToken) {
    return res.status(400).json({ 
      ok: false, 
      error: 'No Slack token provided. Pass token in request body or set VITE_SLACK_BOT_TOKEN environment variable.' 
    });
  }
  
  try {
    const slackRes = await fetch(`https://slack.com/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${slackToken}`,
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
app.post('/api/slack-proxy/image', async (req, res) => {
  const { url: fileUrl, token } = req.body;
  
  if (!fileUrl || typeof fileUrl !== 'string') {
    return res.status(400).send('Missing url parameter');
  }
  
  // Accept token from request body or fall back to environment variable
  const slackToken = token || process.env.VITE_SLACK_BOT_TOKEN;
  
  if (!slackToken) {
    return res.status(400).send('No Slack token provided. Pass token as query parameter or set VITE_SLACK_BOT_TOKEN environment variable.');
  }
  
  // Only allow Slack file URLs for security
  if (!fileUrl.startsWith('https://files.slack.com/')) {
    return res.status(403).send('Forbidden');
  }
  try {
    const slackRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${slackToken}`
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