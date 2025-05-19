import { ArchitecturalPattern, CodePattern } from './types';
export interface FileStructureAnalyzerResult {
  fileStructure?: {
    directories?: string[];
    commonDirs?: string[];
    entryPoints?: string[];
    configFiles?: string[];
  };
  architecturalPatterns?: ArchitecturalPattern[];
  codePatterns?: CodePattern[];
}

const KNOWN_CONFIG_FILES = [
  'next.config.js',
  'next.config.mjs',
  'tailwind.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json',
  'jsconfig.json',
  '.eslintrc.json',
  '.eslintrc.js',
  '.eslint.config.js',
  '.prettierrc.json',
  '.prettierrc.js',
  '.prettier.config.js',
  'components.json',
  'vite.config.ts',
  'vite.config.js',
  'webpack.config.js',
];

const KNOWN_ENTRY_POINT_BASENAMES = [
  'index.ts',
  'index.tsx',
  'index.js',
  'index.jsx',
  'main.ts',
  'main.tsx',
  'main.js',
  'main.jsx',
  'App.ts',
  'App.tsx',
  'App.jsx',
  'app.ts',
  'app.tsx',
  'app.jsx',
  'server.ts',
  'server.js',
];

/**
 * Analyzes the project file structure from a list of all file paths.
 * @param allProjectFiles - Array of file paths, relative to project root.
 * @param rootDir - The root directory path (used for context if needed, but operations should use relative paths from allProjectFiles).
 */
export function analyzeFileStructure(
  allProjectFiles: string[]
): FileStructureAnalyzerResult {
  const result: FileStructureAnalyzerResult = {
    fileStructure: {
      directories: [],
      commonDirs: [],
      entryPoints: [],
      configFiles: [],
    },
    architecturalPatterns: [],
    codePatterns: [],
  };

  if (!allProjectFiles || allProjectFiles.length === 0) {
    return result;
  }

  const uniqueRelativeDirs = new Set<string>();
  allProjectFiles.forEach((filePath) => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      let currentPath = '';
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        uniqueRelativeDirs.add(currentPath);
      }
    }

    const baseName = parts.pop() || normalizedPath;
    if (KNOWN_CONFIG_FILES.includes(baseName)) {
      result.fileStructure!.configFiles!.push(normalizedPath);
    }

    if (KNOWN_ENTRY_POINT_BASENAMES.includes(baseName)) {
      const dirName = parts.join('/');
      if (
        dirName === '' ||
        dirName === 'src' ||
        dirName === 'app' ||
        dirName === 'pages'
      ) {
        result.fileStructure!.entryPoints!.push(normalizedPath);
      }
    }
  });

  const allDirs = Array.from(uniqueRelativeDirs);

  result.fileStructure!.directories = allDirs.filter(
    (dir) => !dir.includes('/')
  );

  const commonDirNames = [
    'src',
    'components',
    'lib',
    'utils',
    'hooks',
    'api',
    'server',
    'styles',
    'public',
    'app',
    'pages',
    'features',
  ];
  result.fileStructure!.commonDirs = allDirs.filter((dir) => {
    const dirBaseName = dir.split('/').pop();
    return dirBaseName && commonDirNames.includes(dirBaseName);
  });

  // Detect architectural patterns
  result.architecturalPatterns = detectArchitecturalPatterns(
    allProjectFiles,
    allDirs
  );

  // Detect code patterns
  result.codePatterns = detectCodePatterns(allProjectFiles, allDirs);

  return result;
}

/**
 * Detects architectural patterns from the directory structure and file list
 */
function detectArchitecturalPatterns(
  allFiles: string[],
  allDirs: string[]
): ArchitecturalPattern[] {
  const patterns: ArchitecturalPattern[] = [];
  const hasDir = (dirName: string) =>
    allDirs.some((d) => d === dirName || d.startsWith(dirName + '/'));
  const fileExists = (filePath: string) =>
    allFiles.includes(filePath.replace(/\\/g, '/'));

  if (
    hasDir('app') &&
    (fileExists('app/layout.tsx') ||
      fileExists('app/layout.jsx') ||
      fileExists('app/layout.ts') ||
      fileExists('app/layout.js'))
  ) {
    patterns.push({
      name: 'Next.js App Router',
      description:
        'Modern Next.js routing system using app directory with nested layouts and server components.',
      components: [
        'app/layout.tsx (or .jsx, .ts, .js)',
        'app/page.tsx (or .jsx, .ts, .js)',
      ],
      locations: ['app/'],
    });
  }

  if (
    hasDir('pages') &&
    (fileExists('pages/_app.tsx') ||
      fileExists('pages/_app.jsx') ||
      fileExists('pages/_document.tsx') ||
      fileExists('pages/_document.jsx'))
  ) {
    if (
      !patterns.some(
        (p) =>
          p.name === 'Next.js App Router' &&
          hasDir('pages/api') &&
          !hasDir('pages/[...slug].tsx')
      )
    ) {
      patterns.push({
        name: 'Next.js Pages Router',
        description:
          'Traditional Next.js routing system using pages directory.',
        components: ['pages/_app.tsx (or .jsx)', 'pages/index.tsx (or .jsx)'],
        locations: ['pages/'],
      });
    }
  }

  if (hasDir('src') && allFiles.some((f) => f.startsWith('src/'))) {
    patterns.push({
      name: 'Source Directory Layout (src)',
      description:
        'Project source code is organized under a top-level "src" directory.',
      locations: ['src/'],
    });
  }

  if (hasDir('components')) {
    patterns.push({
      name: 'Component-Based Architecture',
      description:
        'UI is built using a modular, component-based approach. Common directory "components" found.',
      components: ['components/*'],
      locations: ['components/'],
    });
  }

  if (hasDir('packages') || hasDir('libs')) {
    patterns.push({
      name: 'Monorepo Structure (Potential)',
      description:
        'Project may be a monorepo, indicated by "packages" or "libs" directory.',
      locations: ['packages/', 'libs/'],
    });
  }

  const hasAppApi = hasDir('app/api');
  const hasPagesApi = hasDir('pages/api');
  const hasSrcApi =
    hasDir('src/api') || hasDir('src/pages/api') || hasDir('src/app/api');

  if (hasAppApi || hasPagesApi || hasSrcApi) {
    const locations = [];
    if (hasAppApi) locations.push('app/api/');
    if (hasPagesApi) locations.push('pages/api/');
    if (hasSrcApi && !hasAppApi && !hasPagesApi) {
      if (hasDir('src/app/api')) locations.push('src/app/api/');
      else if (hasDir('src/pages/api')) locations.push('src/pages/api/');
      else if (hasDir('src/api')) locations.push('src/api/');
    }

    if (locations.length > 0) {
      patterns.push({
        name: 'API Routes Structure',
        description:
          'Backend API endpoints are likely defined within the project structure.',
        components: locations.map((loc) => `${loc}*`),
        locations: locations,
      });
    }
  }
  return patterns;
}

/**
 * Detects common code patterns from file list and directory structure
 */
function detectCodePatterns(
  allFiles: string[],
  allDirs: string[]
): CodePattern[] {
  const patterns: CodePattern[] = [];
  const hasDir = (dirName: string) =>
    allDirs.some((d) => d === dirName || d.startsWith(dirName + '/'));
  const fileExistsInDir = (dirName: string, partialFilePath: string) =>
    allFiles.some((f) => f.startsWith(`${dirName}/${partialFilePath}`));
  const dirContainsFileMatching = (dirName: string, regex: RegExp) =>
    allFiles.some(
      (f) => f.startsWith(dirName + '/') && regex.test(f.split('/').pop() || '')
    );

  if (
    hasDir('hooks') ||
    hasDir('src/hooks') ||
    dirContainsFileMatching('lib', /^use[A-Z].*\.(ts|tsx|js|jsx)$/) ||
    dirContainsFileMatching('utils', /^use[A-Z].*\.(ts|tsx|js|jsx)$/)
  ) {
    patterns.push({
      name: 'Custom Hooks',
      description:
        'React custom hooks for reusable stateful logic (e.g., files starting with "use" in "hooks", "lib" or "utils" directories).',
      examples: ['useAuth', 'useForm', 'useLocalStorage'],
      locations: ['hooks/', 'src/hooks/', 'lib/', 'utils/'],
    });
  }

  if (
    hasDir('components/ui') ||
    (hasDir('src/components/ui') &&
      fileExistsInDir(
        hasDir('src/components/ui') ? 'src/components/ui' : 'components/ui',
        'button.'
      ))
  ) {
    patterns.push({
      name: 'Shadcn/UI Components',
      description:
        'Reusable UI components structured similarly to shadcn/ui, often using Radix UI and Tailwind CSS.',
      examples: ['Button', 'Card', 'Dialog (found in components/ui)'],
      locations: [
        hasDir('src/components/ui') ? 'src/components/ui/' : 'components/ui/',
      ],
    });
  }

  if (
    hasDir('store') ||
    hasDir('stores') ||
    hasDir('src/store') ||
    hasDir('src/stores') ||
    fileExistsInDir('lib', 'store.') ||
    fileExistsInDir('app', 'store.')
  ) {
    patterns.push({
      name: 'Centralized State Management (Potential)',
      description:
        'Indicates use of a state management library (e.g., Zustand, Redux, Jotai) by presence of "store(s)" directory or store files.',
      locations: ['store/', 'stores/', 'src/store/', 'src/stores/'],
    });
  }

  if (
    hasDir('context') ||
    hasDir('contexts') ||
    hasDir('src/context') ||
    hasDir('src/contexts')
  ) {
    patterns.push({
      name: 'React Context API Usage',
      description:
        'Indicates usage of React Context API for state sharing, suggested by "context(s)" directory.',
      locations: ['context/', 'contexts/', 'src/context/', 'src/contexts/'],
    });
  }

  if (
    hasDir('utils') ||
    hasDir('src/utils') ||
    hasDir('lib') ||
    hasDir('src/lib')
  ) {
    patterns.push({
      name: 'Utility Modules',
      description:
        'Project contains utility functions/modules, often in "utils" or "lib" directories.',
      locations: ['utils/', 'src/utils/', 'lib/', 'src/lib/'],
    });
  }

  if (
    hasDir('locales') ||
    hasDir('src/locales') ||
    hasDir('i18n') ||
    hasDir('src/i18n') ||
    allFiles.some((f) => f.includes('i18n'))
  ) {
    patterns.push({
      name: 'Internationalization (i18n) Structure',
      description:
        'Project may support multiple languages, indicated by "locales" or "i18n" directories or file names.',
      locations: ['locales/', 'src/locales/', 'i18n/', 'src/i18n/'],
    });
  }

  return patterns;
}
