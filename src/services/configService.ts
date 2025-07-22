import { UserConfig, DEFAULT_CONFIG } from '../config/userConfig';

/**
 * Service for managing user configuration in localStorage
 * Provides save, load, reset, and validation functionality
 */
export class ConfigService {
  private static readonly CONFIG_KEY = 'git-issue-flow-config';
  private static readonly CONFIG_VERSION = '1.0';
  
  /**
   * Save configuration to localStorage
   */
  static save(config: UserConfig): void {
    try {
      const configWithVersion = {
        version: this.CONFIG_VERSION,
        data: config,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(configWithVersion));
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw new Error('Unable to save configuration. Please check your browser storage settings.');
    }
  }
  
  /**
   * Load configuration from localStorage with fallback to defaults
   */
  static load(): UserConfig {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (!stored) {
        return { ...DEFAULT_CONFIG };
      }
      
      const parsed = JSON.parse(stored);
      
      // Handle legacy configs (without version)
      if (!parsed.version) {
        console.log('Migrating legacy configuration');
        const migrated = this.migrateConfig({ ...DEFAULT_CONFIG, ...parsed });
        return migrated;
      }
      
      // Merge with defaults to ensure all properties exist
      const merged = { ...DEFAULT_CONFIG, ...parsed.data };
      return this.migrateConfig(merged);
    } catch (error) {
      console.error('Failed to load configuration, using defaults:', error);
      return { ...DEFAULT_CONFIG };
    }
  }
  
  /**
   * Reset configuration to defaults
   */
  static reset(): void {
    try {
      localStorage.removeItem(this.CONFIG_KEY);
      console.log('Configuration reset to defaults');
    } catch (error) {
      console.error('Failed to reset configuration:', error);
    }
  }
  
  /**
   * Validate configuration object
   */
  static validate(config: Partial<UserConfig>, requireLabels: boolean = true): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // GitHub validation
    if (!config.github?.owner?.trim()) {
      errors.push('GitHub repository owner is required');
    }
    
    if (!config.github?.repo?.trim()) {
      errors.push('GitHub repository name is required');
    }
    
    if (!config.github?.token?.trim()) {
      errors.push('GitHub Personal Access Token is required');
    } else if (!config.github.token.startsWith('ghp_') && !config.github.token.startsWith('github_pat_')) {
      errors.push('GitHub token appears to be invalid format');
    }
    
    // Label validation (optional)
    if (requireLabels) {
      if (!config.labels?.priority?.high?.trim()) {
        errors.push('High priority label is required');
      }
      
      if (!config.labels?.priority?.medium?.trim()) {
        errors.push('Medium priority label is required');
      }
      
      if (!config.labels?.priority?.low?.trim()) {
        errors.push('Low priority label is required');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Migrate configuration from older formats
   */
  private static migrateConfig(config: UserConfig): UserConfig {
    // Migrate single groomed label to array format
    if (config.labels?.groomed && typeof config.labels.groomed === 'string') {
      console.log('Migrating groomed label from string to array format');
      config.labels.groomed = [config.labels.groomed as string] as string[];
    }
    
    // Ensure groomed is always an array
    if (!Array.isArray(config.labels?.groomed)) {
      config.labels = {
        ...config.labels,
        groomed: DEFAULT_CONFIG.labels.groomed
      };
    }
    
    // Ensure new workflow properties exist
    if (config.workflow && typeof config.workflow.excludeGroomed === 'undefined') {
      console.log('Adding missing workflow.excludeGroomed property');
      config.workflow.excludeGroomed = DEFAULT_CONFIG.workflow.excludeGroomed;
    }
    
    return config;
  }

  /**
   * Check if configuration is set up (has minimum required fields)
   */
  static isConfigured(): boolean {
    const config = this.load();
    return !!(config.github.owner && config.github.repo && config.github.token);
  }
  
  /**
   * Export configuration for backup/sharing
   */
  static export(): string {
    const config = this.load();
    // Remove sensitive data for export
    const exportConfig = {
      ...config,
      github: {
        ...config.github,
        token: '[REDACTED]'
      },
      slack: config.slack ? {
        ...config.slack,
        botToken: config.slack.botToken ? '[REDACTED]' : undefined
      } : undefined,
      openai: config.openai ? {
        ...config.openai,
        apiKey: config.openai.apiKey ? '[REDACTED]' : undefined
      } : undefined
    };
    
    return JSON.stringify(exportConfig, null, 2);
  }
  
  /**
   * Import configuration from JSON string
   */
  static import(jsonString: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(jsonString);
      const merged = { ...DEFAULT_CONFIG, ...imported };
      
      // Don't import sensitive fields that were redacted
      const current = this.load();
      if (imported.github?.token === '[REDACTED]') {
        merged.github.token = current.github.token;
      }
      if (imported.slack?.botToken === '[REDACTED]') {
        merged.slack = { ...merged.slack, botToken: current.slack?.botToken };
      }
      if (imported.openai?.apiKey === '[REDACTED]') {
        merged.openai = { ...merged.openai, apiKey: current.openai?.apiKey };
      }
      
      this.save(merged);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format' 
      };
    }
  }
}