/**
 * AI Service for formatting GitHub issues using OpenAI
 */

export interface FormatIssueOptions {
  preserveSlackContext?: boolean;
  template?: 'standard' | 'custom';
}

import { ConfigService } from './configService';

export class AIService {
  private endpoint = 'https://api.openai.com/v1/chat/completions';

  private get apiKey(): string {
    const config = ConfigService.load();
    return config.openai?.apiKey || '';
  }

  /**
   * Rewrites a GitHub issue description based on a custom prompt
   * Preserves Slack URLs and context sections while applying the rewrite instructions
   */
  async rewriteIssueWithAI(issueText: string, rewritePrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extract all Slack URLs from the original text
    const slackUrlRegex = /https?:\/\/[^.\s]*\.?slack\.com\/[^\s)]+/gi;
    const slackUrls = issueText.match(slackUrlRegex) || [];
    
    // Check if there's existing Slack context to preserve
    const hasSlackContext = issueText.includes('## Context from Slack thread');
    
    let systemPrompt = `You are an assistant that rewrites GitHub issue descriptions based on user instructions. Follow the user's rewrite instructions while maintaining the same structured format with these sections: Background, Reproduce Steps / Desired Behaviour, and Links.

CRITICAL REQUIREMENTS:
1. If there is a "Context from Slack thread" section in the original text, preserve it EXACTLY in your rewrite
2. ALL Slack URLs must be preserved and included in the output - do not remove or modify any Slack links
3. Apply the user's rewrite instructions while maintaining the structured format
4. Place content in the appropriate sections (Background, Reproduce Steps/Desired Behaviour, Context from Slack thread if present, Links)

Use this structured format:
## Background

## Reproduce Steps / Desired Behaviour

${hasSlackContext ? '## Context from Slack thread\n\n' : ''}## Links`;

    // If there are Slack URLs, add explicit instruction about them
    if (slackUrls.length > 0) {
      systemPrompt += `\n\nIMPORTANT: The original text contains these Slack URLs that MUST be preserved: ${slackUrls.join(', ')}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Original issue description:\n\n${issueText}\n\nRewrite instructions: ${rewritePrompt}` }
    ];

    const response = await this.callOpenAI({
      model: 'gpt-4',
      messages,
      max_tokens: 1024, // More tokens for rewriting
      temperature: 0.3 // Slightly more creative for rewriting
    });

    return response.choices?.[0]?.message?.content?.trim() || '';
  }

  /**
   * Formats a GitHub issue description using OpenAI GPT-4
   * Preserves Slack URLs and context sections
   */
  async formatIssueWithAI(issueText: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if there's existing Slack context to preserve
    const hasSlackContext = issueText.includes('## Context from Slack thread');
    
    // Extract all Slack URLs from the original text
    const slackUrlRegex = /https?:\/\/[^.\s]*\.?slack\.com\/[^\s)]+/gi;
    const slackUrls = issueText.match(slackUrlRegex) || [];
    
    const baseTemplate = `## Background\n\n## Reproduce Steps / Desired Behaviour\n\n## Links`;
    const templateWithSlack = `## Background\n\n## Reproduce Steps / Desired Behaviour\n\n## Context from Slack thread\n\n## Links`;
    
    const template = hasSlackContext ? templateWithSlack : baseTemplate;
    
    let prompt = `You are an assistant that reformats GitHub issue descriptions into a standardized template. Only use information present in the original text. If a section is missing, leave it blank. Do not hallucinate or infer. 

CRITICAL REQUIREMENTS:
1. If there is a "Context from Slack thread" section in the original text, preserve it EXACTLY and place it in the template
2. ALL Slack URLs must be preserved and included in the output - do not remove or modify any Slack links
3. Place Slack URLs in the appropriate sections (Background, Reproduce Steps, or Links section as contextually appropriate)

Use this template:\n\n${template}`;

    // If there are Slack URLs, add explicit instruction about them
    if (slackUrls.length > 0) {
      prompt += `\n\nIMPORTANT: The original text contains these Slack URLs that MUST be preserved: ${slackUrls.join(', ')}`;
    }
    
    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: issueText }
    ];

    const response = await this.callOpenAI({
      model: 'gpt-4',
      messages,
      max_tokens: 512,
      temperature: 0.0
    });

    return response.choices?.[0]?.message?.content?.trim() || '';
  }

  /**
   * Generic OpenAI API call wrapper
   */
  private async callOpenAI(payload: any): Promise<any> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Check if OpenAI API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Test OpenAI API connection and key validity
   */
  async testConnection(apiKey?: string): Promise<{ success: boolean; error?: string; info?: { model: string; usage: string } }> {
    try {
      // Use provided API key or current config key
      const testKey = apiKey || this.apiKey;
      
      if (!testKey) {
        throw new Error('No OpenAI API key provided');
      }

      // Make a minimal API call to test the key
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
          temperature: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        }
        if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        }
        if (response.status === 402) {
          throw new Error('OpenAI API quota exceeded - please check your billing');
        }
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        info: {
          model: data.model || 'gpt-3.5-turbo',
          usage: `${data.usage?.total_tokens || 0} tokens used`
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

// Export singleton instance
export const aiService = new AIService();