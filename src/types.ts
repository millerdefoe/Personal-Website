export type Project = {
  id: string;
  title: string;
  summary: string;
  stacks: string[];
  description: string;
  githubUrl: string;
  liveUrl?: string;
  banner: string;
  hours: number;
  lastUpdated: string;
  progressDone: number;
  progressTotal: number;
  badges: string[];
  extraCount: number;
  plannedFeatures: string[];
};
