import { GitHubIssue } from '../types/github';

export interface BacklogMetrics {
  ageDistribution: AgeDistribution;
  priorityBalance: PriorityBalance;
  velocity: VelocityMetrics;
  healthScore: HealthScore;
  problems: Problem[];
  totalIssues: number;
}

export interface AgeDistribution {
  fresh: number;    // 0-7 days
  recent: number;   // 1-4 weeks
  aging: number;    // 1-3 months
  stale: number;    // 3-6 months
  ancient: number;  // 6+ months
}

export interface PriorityBalance {
  high: number;
  medium: number;
  low: number;
  ungroomed: number;
}

export interface VelocityMetrics {
  issuesCreatedLast30Days: number;
  issuesClosedLast30Days: number;
  issuesGroomedLast30Days: number;
  netGrowthRate: number;
  averageAgeToGroom: number; // days
}

export interface HealthScore {
  overall: 'healthy' | 'needs-attention' | 'critical';
  score: number; // 0-100
  factors: {
    ageHealth: number;
    priorityHealth: number;
    velocityHealth: number;
  };
}

export interface Problem {
  type: 'ancient-issues' | 'priority-skew' | 'grooming-backlog' | 'creation-rate';
  severity: 'warning' | 'critical';
  message: string;
  count?: number;
}

export class BacklogAnalyzer {
  
  analyzeBacklog(issues: GitHubIssue[]): BacklogMetrics {
    const ageDistribution = this.analyzeAgeDistribution(issues);
    const priorityBalance = this.analyzePriorityBalance(issues);
    const velocity = this.analyzeVelocity(issues);
    const healthScore = this.calculateHealthScore(ageDistribution, priorityBalance, velocity);
    const problems = this.detectProblems(ageDistribution, priorityBalance, velocity);

    return {
      ageDistribution,
      priorityBalance,
      velocity,
      healthScore,
      problems,
      totalIssues: issues.length
    };
  }

  private analyzeAgeDistribution(issues: GitHubIssue[]): AgeDistribution {
    const now = new Date();
    const distribution: AgeDistribution = {
      fresh: 0,
      recent: 0,
      aging: 0,
      stale: 0,
      ancient: 0
    };

    issues.forEach(issue => {
      const createdDate = new Date(issue.created_at);
      const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceCreated <= 7) {
        distribution.fresh++;
      } else if (daysSinceCreated <= 28) {
        distribution.recent++;
      } else if (daysSinceCreated <= 90) {
        distribution.aging++;
      } else if (daysSinceCreated <= 180) {
        distribution.stale++;
      } else {
        distribution.ancient++;
      }
    });

    return distribution;
  }

  private analyzePriorityBalance(issues: GitHubIssue[]): PriorityBalance {
    const balance: PriorityBalance = {
      high: 0,
      medium: 0,
      low: 0,
      ungroomed: 0
    };

    issues.forEach(issue => {
      const labels = issue.labels.map(l => l.name);
      
      if (labels.includes('prio-high')) {
        balance.high++;
      } else if (labels.includes('prio-medium')) {
        balance.medium++;
      } else if (labels.includes('prio-low')) {
        balance.low++;
      } else {
        balance.ungroomed++;
      }
    });

    return balance;
  }

  private analyzeVelocity(issues: GitHubIssue[]): VelocityMetrics {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Note: This is simplified - in reality we'd need closed issues data too
    const recentIssues = issues.filter(issue => 
      new Date(issue.created_at) >= thirtyDaysAgo
    );

    const groomedIssues = issues.filter(issue => {
      const labels = issue.labels.map(l => l.name);
      return labels.some(label => ['prio-high', 'prio-medium', 'prio-low'].includes(label));
    });

    // Calculate average time from creation to grooming (approximation)
    const groomedAges = groomedIssues.map(issue => {
      const createdDate = new Date(issue.created_at);
      const updatedDate = new Date(issue.updated_at);
      return Math.floor((updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    });

    const averageAgeToGroom = groomedAges.length > 0 
      ? groomedAges.reduce((sum, age) => sum + age, 0) / groomedAges.length
      : 0;

    return {
      issuesCreatedLast30Days: recentIssues.length,
      issuesClosedLast30Days: 0, // Would need closed issues data
      issuesGroomedLast30Days: groomedIssues.filter(issue => 
        new Date(issue.updated_at) >= thirtyDaysAgo
      ).length,
      netGrowthRate: recentIssues.length, // Simplified without closure data
      averageAgeToGroom
    };
  }

  private calculateHealthScore(
    age: AgeDistribution, 
    priority: PriorityBalance, 
    velocity: VelocityMetrics
  ): HealthScore {
    const total = age.fresh + age.recent + age.aging + age.stale + age.ancient;
    
    // Age health (0-100): penalize ancient and stale issues
    const ageHealth = total > 0 
      ? Math.max(0, 100 - ((age.ancient * 40 + age.stale * 20) / total * 100))
      : 100;

    // Priority health (0-100): healthy pyramid distribution
    const totalPrioritized = priority.high + priority.medium + priority.low;
    const priorityHealth = totalPrioritized > 0
      ? Math.max(0, 100 - (priority.high > (priority.medium + priority.low) ? 30 : 0) - (priority.ungroomed > 50 ? 20 : 0))
      : Math.max(0, 100 - (priority.ungroomed > 50 ? 50 : priority.ungroomed));

    // Velocity health (0-100): based on grooming rate
    const velocityHealth = velocity.averageAgeToGroom > 0
      ? Math.max(0, 100 - (velocity.averageAgeToGroom > 30 ? 30 : velocity.averageAgeToGroom))
      : 80;

    // Overall score (weighted average)
    const score = Math.round((ageHealth * 0.4) + (priorityHealth * 0.4) + (velocityHealth * 0.2));
    
    const overall: HealthScore['overall'] = score >= 80 ? 'healthy' : score >= 60 ? 'needs-attention' : 'critical';

    return {
      overall,
      score,
      factors: {
        ageHealth: Math.round(ageHealth),
        priorityHealth: Math.round(priorityHealth),
        velocityHealth: Math.round(velocityHealth)
      }
    };
  }

  private detectProblems(
    age: AgeDistribution,
    priority: PriorityBalance,
    velocity: VelocityMetrics
  ): Problem[] {
    const problems: Problem[] = [];
    const total = age.fresh + age.recent + age.aging + age.stale + age.ancient;

    // Too many ancient issues
    if (total > 0 && (age.ancient / total) > 0.3) {
      problems.push({
        type: 'ancient-issues',
        severity: 'critical',
        message: `${age.ancient} issues are over 6 months old (${Math.round((age.ancient / total) * 100)}% of backlog)`,
        count: age.ancient
      });
    }

    // Priority skew - too many high priority
    const totalPrioritized = priority.high + priority.medium + priority.low;
    if (totalPrioritized > 0 && priority.high > (priority.medium + priority.low)) {
      problems.push({
        type: 'priority-skew',
        severity: 'warning',
        message: `Too many high priority issues (${priority.high}) compared to medium + low (${priority.medium + priority.low})`,
        count: priority.high
      });
    }

    // Large grooming backlog
    if (priority.ungroomed > 50) {
      problems.push({
        type: 'grooming-backlog',
        severity: priority.ungroomed > 100 ? 'critical' : 'warning',
        message: `${priority.ungroomed} issues need grooming`,
        count: priority.ungroomed
      });
    }

    // High creation rate
    if (velocity.issuesCreatedLast30Days > 30) {
      problems.push({
        type: 'creation-rate',
        severity: 'warning',
        message: `High issue creation rate: ${velocity.issuesCreatedLast30Days} issues in last 30 days`,
        count: velocity.issuesCreatedLast30Days
      });
    }

    return problems;
  }
} 