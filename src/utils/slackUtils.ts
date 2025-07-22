/**
 * Converts a Slack web URL to a desktop app URL
 * @param webUrl - The Slack web URL (e.g., https://app.slack.com/client/T1234567890/C1234567890)
 * @returns The desktop app URL (e.g., slack://app/T1234567890/C1234567890)
 */
export function convertSlackWebUrlToDesktop(webUrl: string): string {
  try {
    const url = new URL(webUrl);
    
    // Handle different Slack URL formats
    if (url.hostname === 'app.slack.com' && url.pathname.startsWith('/client/')) {
      // Format: https://app.slack.com/client/T1234567890/C1234567890
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 3) {
        const teamId = pathParts[1];
        const channelId = pathParts[2];
        return `slack://app/${teamId}/${channelId}`;
      }
    } else if (url.hostname === 'slack.com' && url.pathname.startsWith('/app/')) {
      // Format: https://slack.com/app/T1234567890/C1234567890
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 3) {
        const teamId = pathParts[1];
        const channelId = pathParts[2];
        return `slack://app/${teamId}/${channelId}`;
      }
    } else if (url.hostname.includes('slack.com') && url.searchParams.has('team')) {
      // Format: https://app.slack.com/team/T1234567890/channel/C1234567890
      const teamId = url.searchParams.get('team');
      const channelId = url.searchParams.get('channel') || url.searchParams.get('id');
      if (teamId && channelId) {
        return `slack://app/${teamId}/${channelId}`;
      }
    }
    
    // If we can't parse it, return the original URL
    return webUrl;
  } catch (error) {
    console.warn('Failed to convert Slack URL:', webUrl, error);
    return webUrl;
  }
}

/**
 * Checks if a URL is a Slack web URL
 * @param url - The URL to check
 * @returns True if it's a Slack web URL
 */
export function isSlackWebUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes('slack.com') || parsedUrl.hostname.includes('app.slack.com');
  } catch {
    return false;
  }
}

/**
 * Opens a Slack URL in the desktop app if possible, falls back to browser
 * @param url - The Slack URL to open
 */
export function openSlackUrl(url: string): void {
  const desktopUrl = convertSlackWebUrlToDesktop(url);
  
  if (desktopUrl.startsWith('slack://')) {
    // Try to open in desktop app first
    window.location.href = desktopUrl;
    
    // Fallback to browser after a short delay if desktop app doesn't open
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 1000);
  } else {
    // If it's not a convertible URL, open in browser
    window.open(url, '_blank', 'noopener,noreferrer');
  }
} 