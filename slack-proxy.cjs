const express = require('express');
const cors = require('cors');
const { WebClient } = require('@slack/web-api');

const app = express();
const port = 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Slack API proxy endpoint
app.post('/api/slack-proxy', async (req, res) => {
  try {
    const { token, method, params } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Slack token is required' });
    }

    const slack = new WebClient(token);
    
    let result;
    switch (method) {
      case 'conversations.replies':
        result = await slack.conversations.replies(params);
        break;
      case 'conversations.info':
        result = await slack.conversations.info(params);
        break;
      case 'users.info':
        result = await slack.users.info(params);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported method' });
    }

    res.json(result);
  } catch (error) {
    console.error('Slack API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to call Slack API',
      details: error.data || null
    });
  }
});

app.listen(port, () => {
  console.log(`Slack proxy server running on http://localhost:${port}`);
  console.log('This proxy enables CORS for Slack API calls from your frontend');
});