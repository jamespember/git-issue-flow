export interface SlackReaction {
  name: string;
  count: number;
  users: string[];
}

export interface SlackMessage {
  text: string;
  user: string;
  ts: string;
  thread_ts?: string;
  username?: string;
  attachments?: Array<{
    text?: string;
    title?: string;
    fallback?: string;
    image_url?: string;
    thumb_url?: string;
  }>;
  files?: Array<{
    mimetype: string;
    url_private: string;
    thumb_360?: string;
    title?: string;
    name?: string;
  }>;
  reactions?: SlackReaction[];
}

export interface SlackThread {
  messages: SlackMessage[];
  channel: string;
  thread_ts: string;
  participant_count: number;
  reply_count: number;
  channel_name?: string;
}

interface SlackUrlInfo {
  team: string;
  channel: string;
  thread_ts?: string;
  message_ts?: string;
}

import { ConfigService } from './configService';

export class SlackApiService {
  /**
   * Extract Slack URL information for archives links
   * Supports: https://choosekomo.slack.com/archives/C01LH95QAKZ/p1740545225289349
   */
  private parseSlackUrl(url: string): SlackUrlInfo | null {
    try {
      const parsedUrl = new URL(url);
      // Handle Slack archives link
      // Format: https://choosekomo.slack.com/archives/C01LH95QAKZ/p1740545225289349
      if (parsedUrl.hostname.includes('slack.com') && parsedUrl.pathname.startsWith('/archives/')) {
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length === 3 && pathParts[0] === 'archives') {
          const channel = pathParts[1];
          // Slack message ts is in the form p1740545225289349, need to convert to 1740545225.289349
          let message_ts = pathParts[2];
          if (message_ts.startsWith('p')) message_ts = message_ts.slice(1);
          // Insert a dot before the last 6 digits
          message_ts = message_ts.slice(0, -6) + '.' + message_ts.slice(-6);
          return {
            team: '', // Not needed for API
            channel,
            message_ts,
            thread_ts: message_ts
          };
        }
      }
      // Fallback to previous logic for app.slack.com links
      if (parsedUrl.hostname.includes('slack.com')) {
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 4 && pathParts[2] === 'thread') {
          return {
            team: pathParts[1],
            channel: pathParts[2],
            thread_ts: pathParts[3],
            message_ts: pathParts[3]
          };
        }
        if (pathParts.length >= 3) {
          return {
            team: pathParts[1],
            channel: pathParts[2],
            message_ts: pathParts[2]
          };
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to parse Slack URL:', url, error);
      return null;
    }
  }

  /**
   * Get thread preview using backend proxy
   * Always fetches the parent message and all replies in the thread
   */
  async getThreadPreview(url: string): Promise<SlackThread | null> {
    const urlInfo = this.parseSlackUrl(url);
    if (!urlInfo) return null;

    try {
      // Get Slack token from user config
      const config = ConfigService.load();
      const slackToken = config.slack?.botToken;
      
      if (!slackToken) {
        throw new Error('Slack bot token not configured. Please add it in Settings > Integrations.');
      }

      // Fetch the parent message and all replies in the thread
      const response = await fetch('http://localhost:3001/api/slack-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'conversations.replies',
          token: slackToken,
          body: {
            channel: urlInfo.channel,
            ts: urlInfo.thread_ts
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Slack proxy error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.ok) {
        console.warn('Slack proxy returned error:', data.error);
        return null;
      }

      // The first message is the parent, the rest are replies
      const threadMessages = data.messages;
      return {
        messages: threadMessages,
        channel: urlInfo.channel,
        thread_ts: urlInfo.thread_ts!,
        participant_count: new Set(threadMessages.map((m: SlackMessage) => m.user)).size,
        reply_count: threadMessages.length - 1,
        channel_name: urlInfo.channel
      };
    } catch (error) {
      console.warn('Failed to fetch Slack thread:', error);
      return null;
    }
  }

  /**
   * Get basic channel info using backend proxy
   */
  async getChannelInfo(channelId: string): Promise<{ name: string; topic?: string } | null> {
    try {
      // Get Slack token from user config
      const config = ConfigService.load();
      const slackToken = config.slack?.botToken;
      
      if (!slackToken) {
        throw new Error('Slack bot token not configured. Please add it in Settings > Integrations.');
      }

      const response = await fetch('http://localhost:3001/api/slack-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'conversations.info',
          token: slackToken,
          body: { channel: channelId }
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!data.ok) return null;
      return {
        name: data.channel.name,
        topic: data.channel.topic?.value
      };
    } catch (error) {
      console.warn('Failed to fetch channel info:', error);
      return null;
    }
  }

  /**
   * Format message text for display
   */
  formatMessageText(text: string): string {
    // Remove Slack formatting and convert to readable text
    return text
      .replace(/<@([A-Z0-9]+)>/g, '@user') // Replace user mentions
      .replace(/<#([A-Z0-9]+)\|([^>]+)>/g, '#$2') // Replace channel mentions
      .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '$2') // Replace links
      .replace(/<(https?:\/\/[^>]+)>/g, '$1') // Replace plain links
      .replace(/\*([^*]+)\*/g, '**$1**') // Convert Slack bold to markdown
      .replace(/_([^_]+)_/g, '*$1*') // Convert Slack italic to markdown
      .replace(/`([^`]+)`/g, '`$1`') // Keep code formatting
      .replace(/```([^`]+)```/g, '```$1```'); // Keep code blocks
  }

  /**
   * Test Slack connection and token validity
   */
  async testConnection(token?: string): Promise<{ success: boolean; error?: string; info?: { teamName: string; botName: string } }> {
    try {
      // Use provided token or current config token
      const config = ConfigService.load();
      const testToken = token || config.slack?.botToken;
      
      if (!testToken) {
        throw new Error('No Slack bot token provided');
      }

      // Check if proxy is running
      const response = await fetch('http://localhost:3001/api/slack-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth.test',
          token: testToken,
          body: {}
        })
      });

      if (!response.ok) {
        if (response.status === 502 || response.status === 503) {
          throw new Error('Slack proxy is not running. Please run: node slack-proxy.cjs');
        }
        throw new Error(`Slack proxy error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
        if (data.error === 'invalid_auth') {
          throw new Error('Invalid Slack bot token');
        }
        throw new Error(`Slack API error: ${data.error || 'Unknown error'}`);
      }

      return {
        success: true,
        info: {
          teamName: data.team,
          botName: data.user
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

export const slackApiService = new SlackApiService(); 