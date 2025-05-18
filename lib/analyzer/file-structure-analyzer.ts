import { ArchitecturalPattern, CodePattern } from './types';
import fs from 'fs';
import path from 'path';

interface FileStructureResult {
  directories: string[];
  entryPoints: string[];
  configFiles: string[];
  patterns: {
    architectural: ArchitecturalPattern[];
    code: CodePattern[];
  };
}

/**
 * Analyzes the project file structure to determine architecture and patterns
 */
export async function analyzeFileStructure(
  rootDir: string
): Promise<FileStructureResult> {
  const result: FileStructureResult = {
    directories: [],
    entryPoints: [],
    configFiles: [],
    patterns: {
      architectural: [],
      code: [],
    },
  };

  // Collect top-level directories
  const topLevelEntries = await fs.promises.readdir(rootDir, {
    withFileTypes: true,
  });

  for (const entry of topLevelEntries) {
    // Skip node_modules and hidden directories
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      result.directories.push(entry.name);
    } else if (entry.isFile()) {
      // Collect config files
      if (isConfigFile(entry.name)) {
        result.configFiles.push(entry.name);
      }

      // Collect entry points
      if (isEntryPoint(entry.name)) {
        result.entryPoints.push(entry.name);
      }
    }
  }

  // Detect architectural patterns
  result.patterns.architectural = detectArchitecturalPatterns(
    result.directories,
    rootDir
  );

  // Detect code patterns
  result.patterns.code = await detectCodePatterns(rootDir, result.directories);

  return result;
}

/**
 * Detects architectural patterns from the directory structure
 */
function detectArchitecturalPatterns(
  directories: string[],
  rootDir: string
): ArchitecturalPattern[] {
  const patterns: ArchitecturalPattern[] = [];

  // Check for Next.js App Router
  if (directories.includes('app')) {
    try {
      if (
        fs.existsSync(path.join(rootDir, 'app/layout.tsx')) ||
        fs.existsSync(path.join(rootDir, 'app/layout.jsx'))
      ) {
        patterns.push({
          name: 'Next.js App Router',
          description:
            'Modern Next.js routing system using app directory with nested layouts and server components',
          components: ['app/layout.tsx', 'app/page.tsx'],
          locations: ['app/'],
        });
      }
    } catch {
      // Ignore file system errors
    }
  }

  // Check for Next.js Pages Router
  if (directories.includes('pages')) {
    patterns.push({
      name: 'Next.js Pages Router',
      description: 'Traditional Next.js routing system using pages directory',
      components: ['pages/_app.tsx', 'pages/index.tsx'],
      locations: ['pages/'],
    });
  }

  // Check for React Component Library
  if (directories.includes('components')) {
    patterns.push({
      name: 'Component Library',
      description: 'Organized collection of reusable UI components',
      components: ['components/*'],
      locations: ['components/'],
    });
  }

  // Check for Monorepo structure
  if (
    fs.existsSync(path.join(rootDir, 'package', 'index.ts')) ||
    directories.includes('packages')
  ) {
    patterns.push({
      name: 'Monorepo / Package Library',
      description: 'Multi-package repository with shared code',
      components: ['package/index.ts'],
      locations: ['package/'],
    });
  }

  // Check for API Routes
  if (
    directories.includes('api') ||
    fs.existsSync(path.join(rootDir, 'app/api'))
  ) {
    patterns.push({
      name: 'API Routes',
      description:
        'Backend API endpoints using Next.js API routes or standalone API',
      components: ['app/api/*/route.ts', 'pages/api/*'],
      locations: ['app/api/', 'pages/api/'],
    });
  }

  return patterns;
}

/**
 * Detects common code patterns from files
 */
async function detectCodePatterns(
  rootDir: string,
  directories: string[]
): Promise<CodePattern[]> {
  const patterns: CodePattern[] = [];

  // Check for custom hooks pattern
  if (directories.includes('hooks')) {
    patterns.push({
      name: 'Custom Hooks',
      description: 'React custom hooks for reusable stateful logic',
      examples: ['useAuth', 'useForm', 'useLocalStorage'],
      locations: ['hooks/'],
    });
  }

  // Check for specific UI component patterns
  try {
    const componentsDir = path.join(rootDir, 'components');
    if (fs.existsSync(componentsDir)) {
      const componentEntries = await fs.promises.readdir(componentsDir, {
        withFileTypes: true,
      });

      // Check for shadcn/ui pattern
      const hasUiDir = componentEntries.some(
        (entry) => entry.isDirectory() && entry.name === 'ui'
      );

      if (hasUiDir) {
        patterns.push({
          name: 'shadcn/ui Components',
          description:
            'Reusable UI components following shadcn/ui patterns with Radix UI and Tailwind',
          examples: ['Button', 'Card', 'Dialog'],
          locations: ['components/ui/'],
        });
      }
    }
  } catch {
    // Ignore file system errors
  }

  // Check for context API pattern
  if (
    (await fileExists(path.join(rootDir, 'context'))) ||
    (await globMatch(rootDir, '**/context/**/*.tsx'))
  ) {
    patterns.push({
      name: 'React Context API',
      description: 'State management using React Context API',
      examples: ['ThemeContext', 'AuthContext'],
      locations: ['context/', 'lib/context/', 'components/context/'],
    });
  }

  // Check for server actions
  if (
    (await globMatch(rootDir, '**/actions.ts')) ||
    (await globMatch(rootDir, '**/actions/**/*.ts'))
  ) {
    patterns.push({
      name: 'Next.js Server Actions',
      description: 'Server-side mutations using Next.js Server Actions',
      examples: ['form actions', 'data mutations'],
      locations: ['app/**/actions.ts', 'actions/'],
    });
  }

  return patterns;
}

/**
 * Checks if a filename is a common configuration file
 */
function isConfigFile(filename: string): boolean {
  const configFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'next.config.ts',
    'tailwind.config.js',
    'tailwind.config.ts',
    '.eslintrc.js',
    '.prettierrc',
    'jest.config.js',
    'jest.config.ts',
    'postcss.config.js',
    'components.json',
  ];

  return configFiles.includes(filename);
}

/**
 * Checks if a file is a main entry point
 */
function isEntryPoint(filename: string): boolean {
  const entryPoints = [
    'index.ts',
    'index.tsx',
    'index.js',
    'server.ts',
    'server.js',
    'app.ts',
    'app.js',
    'main.ts',
    'main.js',
  ];

  return entryPoints.includes(filename);
}

/**
 * Check if a file or directory exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Simple glob matching (limited functionality)
 */
async function globMatch(rootDir: string, pattern: string): Promise<boolean> {
  // This is a simplified glob implementation
  // For a real implementation, use a proper glob library
  const parts = pattern.split('**/');
  const searchDir = parts[0] || rootDir;
  const searchPattern = parts[1];

  try {
    const files = await walkDir(path.join(rootDir, searchDir));
    return files.some((file) => file.includes(searchPattern));
  } catch {
    return false;
  }
}

/**
 * Walk directory recursively to find all files
 */
async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walkDir(fullPath) : [fullPath];
    })
  );

  return files.flat();
}
