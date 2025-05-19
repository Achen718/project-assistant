export interface Technology {
  name: string;
  version?: string;
  type: 'language' | 'framework' | 'library' | 'tool' | 'database' | 'other';
  usage?: 'core' | 'development' | 'optional';
  confidence?: number;
}

export interface CodePattern {
  name: string;
  description: string;
  examples?: string[];
  locations?: string[];
}

export interface ArchitecturalPattern {
  name: string;
  description: string;
  components?: string[];
  locations?: string[];
}

export interface CodingConvention {
  name: string;
  description?: string;
  prevalence?: 'high' | 'medium' | 'low' | 'mixed';
  examples?: string[];
}

export interface AnalyzerProjectContext {
  projectName?: string;
  technologies?: Technology[];
  architecturalPatterns?: ArchitecturalPattern[];
  codePatterns?: CodePattern[];
  codingConventions?: CodingConvention[];
  bestPracticesObserved?: string[];
  fileStructure?: {
    directories?: string[];
    entryPoints?: string[];
    configFiles?: string[];
  };
  analysisMetadata: {
    analyzedAt: Date;
    overallConfidence?: number;
    analyzerVersion?: string;
  };
}

export interface FileContent {
  path: string;
  content: string;
}

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export interface TSConfig {
  compilerOptions?: {
    target?: string;
    module?: string;
    lib?: string[];
    jsx?: string;
    [key: string]: unknown;
  };
  include?: string[];
  exclude?: string[];
  [key: string]: unknown;
}

export interface NextConfig {
  path: string;
  [key: string]: unknown;
}

export interface AnalyzerResult {
  context: AnalyzerProjectContext;
  rawFileContents?: {
    packageJson?: PackageJson;
    tsConfig?: TSConfig;
    nextConfig?: NextConfig;
    otherRelevantConfigs?: Record<string, string>;
  };
  errors?: Array<{ message: string; sourceAnalyzer?: string }>;
}
