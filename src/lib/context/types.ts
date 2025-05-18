/**
 * Technology stack entry with name and confidence level
 */
export interface Technology {
  name: string;
  confidence: number;
}

/**
 * Code pattern identified in the project
 */
export interface CodePattern {
  name: string;
  description: string;
  examples?: string[];
}

/**
 * Architectural pattern identified in the project
 */
export interface ArchitecturalPattern {
  name: string;
  description: string;
}

/**
 * Structure representing analyzed project context information
 */
export interface ProjectContext {
  projectId: string;
  technologies?: string[];
  frameworks?: string[];
  architecture?: string[];
  codePatterns?: CodePattern[];
  bestPractices?: string[];
  lastUpdated?: number;
}

/**
 * Result of a project analysis operation
 */
export interface AnalysisResult {
  projectId: string;
  context: ProjectContext;
  timestamp: number;
}
