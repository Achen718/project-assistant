/**
 * Technology stack entry with name and confidence level
 */
export interface Technology {
  name: string;
  version?: string;
  type: 'language' | 'framework' | 'library' | 'tool' | 'database' | 'other';
  confidence?: number;
}

/**
 * Code pattern identified in the project
 */
export interface CodePattern {
  name: string;
  description: string;
  examples?: string[];
  locations?: string[];
}

/**
 * Architectural pattern identified in the project
 */
export interface ArchitecturalPattern {
  name: string;
  description: string;
  components?: string[];
  locations?: string[];
}

/**
 * Coding convention identified in the project
 */
export interface CodingConvention {
  name: string;
  description?: string;
  prevalence?: 'high' | 'medium' | 'low' | 'mixed';
  examples?: string[];
}

/**
 * User preference value
 */
export interface UserPreferenceValue {
  value: string | number | boolean;
  source?: 'explicit' | 'inferred';
}

/**
 * User preferences
 */
export interface UserPreferences {
  [preferenceKey: string]: UserPreferenceValue;
}

/**
 * Structure representing analyzed project context information (Stored Version)
 */
export interface ProjectContext {
  projectId: string;
  projectName?: string;

  technologies?: Technology[];
  frameworks?: Technology[];

  architecturalPatterns?: ArchitecturalPattern[];
  codePatterns?: CodePattern[];
  codingConventions?: CodingConvention[];

  fileStructureSummary?: {
    mainEntryPoints?: string[];
    commonDirectories?: string[];
    recognizedConfigFiles?: string[];
  };

  bestPracticesObserved?: string[];

  userPreferences?: UserPreferences;

  lastAnalyzed: string;
}

/**
 * Result of a project analysis operation, as returned by an API endpoint
 * (This links the stored ProjectContext to an ID and timestamp)
 */
export interface StoredAnalysisResult {
  projectId: string;
  context: ProjectContext;
  analysisTimestamp: number;
  storageTimestamp?: number;
}
