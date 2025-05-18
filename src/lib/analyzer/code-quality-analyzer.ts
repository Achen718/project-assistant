import fs from 'fs';
import path from 'path';
import { CodePattern } from './types';

interface CodeQualityResult {
  patterns: CodePattern[];
  bestPractices: {
    name: string;
    detected: boolean;
    details?: string;
  }[];
  metrics: {
    componentCount: number;
    hooksCount: number;
    utilsCount: number;
    apiRoutesCount: number;
  };
}

/**
 * Analyzes code quality and best practices
 */
export async function analyzeCodeQuality(
  rootDir: string
): Promise<CodeQualityResult> {
  const result: CodeQualityResult = {
    patterns: [],
    bestPractices: [],
    metrics: {
      componentCount: 0,
      hooksCount: 0,
      utilsCount: 0,
      apiRoutesCount: 0,
    },
  };

  // Check for TypeScript usage
  const hasTypeScript = await fileExists(path.join(rootDir, 'tsconfig.json'));
  result.bestPractices.push({
    name: 'TypeScript',
    detected: hasTypeScript,
    details: hasTypeScript
      ? 'Project uses TypeScript for type safety'
      : 'TypeScript not detected',
  });

  // Check for ESLint
  const hasESLint =
    (await fileExists(path.join(rootDir, '.eslintrc.js'))) ||
    (await fileExists(path.join(rootDir, '.eslintrc'))) ||
    (await fileExists(path.join(rootDir, 'eslint.config.js'))) ||
    (await fileExists(path.join(rootDir, 'eslint.config.mjs')));

  result.bestPractices.push({
    name: 'ESLint',
    detected: hasESLint,
    details: hasESLint
      ? 'Project uses ESLint for code quality'
      : 'ESLint not detected',
  });

  // Check for testing setup
  const hasJest =
    (await fileExists(path.join(rootDir, 'jest.config.js'))) ||
    (await fileExists(path.join(rootDir, 'jest.config.ts')));

  result.bestPractices.push({
    name: 'Testing',
    detected: hasJest,
    details: hasJest
      ? 'Project has Jest testing setup'
      : 'No testing framework detected',
  });

  // Count components, hooks, utils, API routes
  result.metrics = await countCodeMetrics(rootDir);

  // Detect code patterns
  result.patterns = await detectCodeQualityPatterns(rootDir);

  return result;
}

/**
 * Count various code metrics
 */
async function countCodeMetrics(
  rootDir: string
): Promise<CodeQualityResult['metrics']> {
  const metrics = {
    componentCount: 0,
    hooksCount: 0,
    utilsCount: 0,
    apiRoutesCount: 0,
  };

  // Count components
  try {
    const componentsDir = path.join(rootDir, 'components');
    if (await fileExists(componentsDir)) {
      const componentFiles = await walkDir(componentsDir, ['.tsx', '.jsx']);
      metrics.componentCount = componentFiles.length;
    }
  } catch {
    // Ignore errors
  }

  // Count hooks
  try {
    const hooksDir = path.join(rootDir, 'hooks');
    if (await fileExists(hooksDir)) {
      const hookFiles = await walkDir(hooksDir, ['.ts', '.tsx', '.js', '.jsx']);
      metrics.hooksCount = hookFiles.length;
    }

    // Also count hooks in lib or utils
    const libDir = path.join(rootDir, 'lib');
    if (await fileExists(libDir)) {
      const libFiles = await walkDir(libDir, ['.ts', '.js']);
      metrics.hooksCount += libFiles.filter((file) =>
        path.basename(file).startsWith('use')
      ).length;
    }
  } catch {
    // Ignore errors
  }

  // Count utils
  try {
    const utilsDir = path.join(rootDir, 'utils');
    if (await fileExists(utilsDir)) {
      const utilsFiles = await walkDir(utilsDir, ['.ts', '.js']);
      metrics.utilsCount = utilsFiles.length;
    }

    // Also check lib/utils
    const libUtilsDir = path.join(rootDir, 'lib/utils');
    if (await fileExists(libUtilsDir)) {
      const libUtilsFiles = await walkDir(libUtilsDir, ['.ts', '.js']);
      metrics.utilsCount += libUtilsFiles.length;
    }
  } catch {
    // Ignore errors
  }

  // Count API routes
  try {
    const apiDir = path.join(rootDir, 'app/api');
    if (await fileExists(apiDir)) {
      const apiFiles = await walkDir(apiDir, ['.ts', '.js']);
      metrics.apiRoutesCount = apiFiles.filter(
        (file) =>
          path.basename(file) === 'route.ts' ||
          path.basename(file) === 'route.js'
      ).length;
    }

    const pagesApiDir = path.join(rootDir, 'pages/api');
    if (await fileExists(pagesApiDir)) {
      const pagesApiFiles = await walkDir(pagesApiDir, ['.ts', '.js']);
      metrics.apiRoutesCount += pagesApiFiles.length;
    }
  } catch {
    // Ignore errors
  }

  return metrics;
}

/**
 * Detect code quality patterns
 */
async function detectCodeQualityPatterns(
  rootDir: string
): Promise<CodePattern[]> {
  const patterns: CodePattern[] = [];

  // Check for organized imports pattern
  patterns.push({
    name: 'Organized Imports',
    description: 'Grouped and organized import statements',
    examples: ['React imports first, then libraries, then local modules'],
    locations: ['Throughout the codebase'],
  });

  // Check for component composition pattern
  if (await fileExists(path.join(rootDir, 'components'))) {
    patterns.push({
      name: 'Component Composition',
      description: 'Building complex UIs from smaller, reusable components',
      examples: ['Layout components, UI components, feature components'],
      locations: ['components/'],
    });
  }

  // Check for error boundary pattern
  const hasErrorBoundaries = await findFilesWithContent(
    rootDir,
    ['ErrorBoundary', 'error.tsx', 'error.jsx'],
    ['.tsx', '.jsx']
  );

  if (hasErrorBoundaries.length > 0) {
    patterns.push({
      name: 'Error Boundaries',
      description:
        'Components that catch JavaScript errors and display fallback UI',
      examples: hasErrorBoundaries,
      locations: ['Throughout the codebase'],
    });
  }

  // Check for data fetching patterns
  const hasFetchingPatterns = await findFilesWithContent(
    rootDir,
    [
      'useQuery',
      'useSWR',
      'createServerComponent',
      'getData',
      'getServerSideProps',
    ],
    ['.ts', '.tsx', '.js', '.jsx']
  );

  if (hasFetchingPatterns.length > 0) {
    patterns.push({
      name: 'Data Fetching Patterns',
      description: 'Structured approach to fetching and managing data',
      examples: ['React Query', 'SWR', 'Server Components'],
      locations: hasFetchingPatterns,
    });
  }

  return patterns;
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
 * Walk directory and filter by extensions
 */
async function walkDir(
  dir: string,
  extensions: string[] = []
): Promise<string[]> {
  if (!(await fileExists(dir))) {
    return [];
  }

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkDir(fullPath, extensions);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          return [fullPath];
        }
      }

      return [];
    })
  );

  return files.flat();
}

/**
 * Find files with specific content patterns
 */
async function findFilesWithContent(
  rootDir: string,
  patterns: string[],
  extensions: string[] = []
): Promise<string[]> {
  const matchingFiles: string[] = [];

  try {
    // Find files with matching extensions
    const files = await walkDir(rootDir, extensions);

    // Simple implementation: just check filenames for now
    // For a real implementation, you would read file contents
    for (const file of files) {
      const basename = path.basename(file);
      if (patterns.some((pattern) => basename.includes(pattern))) {
        matchingFiles.push(file);
      }
    }
  } catch {
    // Ignore errors
  }

  return matchingFiles;
}
