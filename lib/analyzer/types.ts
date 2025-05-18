export interface Technology {
  name: string;
  version?: string;
  type: 'language' | 'framework' | 'library' | 'tool' | 'database' | 'other';
  usage?: 'core' | 'development' | 'optional';
}

export interface CodePattern {
  name: string;
  description: string;
  examples: string[];
  locations: string[];
}

export interface ArchitecturalPattern {
  name: string;
  description: string;
  components: string[];
  locations: string[];
}

export interface ProjectContext {
  name: string;
  technologies: Technology[];
  patterns: {
    code: CodePattern[];
    architectural: ArchitecturalPattern[];
  };
  fileStructure: {
    directories: string[];
    entryPoints: string[];
    configFiles: string[];
  };
  metadata: {
    analyzedAt: Date;
    confidence: number;
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
  context: ProjectContext;
  raw: {
    packageJson?: PackageJson;
    tsConfig?: TSConfig;
    nextConfig?: NextConfig;
    otherConfigs: Record<string, unknown>;
  };
}
