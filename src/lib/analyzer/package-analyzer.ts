import { PackageJson, Technology } from './types';

// NEW Interface for the analyzer's output
export interface PackageAnalyzerResult {
  projectName?: string;
  technologies: Technology[];
  // rawPackageJson: PackageJson; // The orchestrator will handle storing raw files
}

// Technology categorization knowledge base
const TECH_CATEGORIES: Record<
  string,
  { type: Technology['type']; usage: Technology['usage']; confidence?: number } // Added optional confidence here for defaults
> = {
  react: { type: 'framework', usage: 'core', confidence: 1.0 },
  next: { type: 'framework', usage: 'core', confidence: 1.0 },
  vue: { type: 'framework', usage: 'core', confidence: 1.0 },
  angular: { type: 'framework', usage: 'core', confidence: 1.0 },
  typescript: { type: 'language', usage: 'core', confidence: 1.0 },
  tailwindcss: { type: 'library', usage: 'core', confidence: 1.0 },
  firebase: { type: 'database', usage: 'core', confidence: 1.0 },
  'firebase-admin': { type: 'library', usage: 'core', confidence: 1.0 },
  jest: { type: 'tool', usage: 'development', confidence: 0.9 },
  '@testing-library': {
    type: 'library',
    usage: 'development',
    confidence: 0.9,
  },
  eslint: { type: 'tool', usage: 'development', confidence: 0.9 },
  prettier: { type: 'tool', usage: 'development', confidence: 0.9 }, // Added Prettier
  tsup: { type: 'tool', usage: 'development', confidence: 0.9 },
  zod: { type: 'library', usage: 'core', confidence: 1.0 },
  ai: { type: 'library', usage: 'core', confidence: 1.0 }, // Vercel AI SDK (general)
  '@ai-sdk/react': { type: 'library', usage: 'core', confidence: 1.0 }, // Vercel AI SDK for React
  '@ai-sdk/openai': { type: 'library', usage: 'core', confidence: 1.0 }, // Vercel AI SDK for OpenAI
  langchain: { type: 'library', usage: 'core', confidence: 1.0 }, // Langchain (general)
  '@langchain/core': { type: 'library', usage: 'core', confidence: 1.0 },
  '@langchain/openai': { type: 'library', usage: 'core', confidence: 1.0 },
  axios: { type: 'library', usage: 'core', confidence: 1.0 },
  zustand: { type: 'library', usage: 'core', confidence: 1.0 },
  '@radix-ui': { type: 'library', usage: 'core', confidence: 1.0 },
  'class-variance-authority': {
    type: 'library',
    usage: 'core',
    confidence: 1.0,
  }, // Often with Shadcn
  'lucide-react': { type: 'library', usage: 'core', confidence: 1.0 }, // Often with Shadcn
  clsx: { type: 'library', usage: 'core', confidence: 1.0 },
  'tailwind-merge': { type: 'library', usage: 'core', confidence: 1.0 }, // Often with Shadcn
  '@heroicons': { type: 'library', usage: 'core', confidence: 1.0 },
};

/**
 * Analyzes a package.json file to extract technology information
 */
export function analyzePackageJson(
  packageJson: PackageJson
  // filePath: string // Path to package.json, if needed for context later
): PackageAnalyzerResult {
  // Updated return type
  if (!packageJson) return { technologies: [] };

  const projectName = packageJson.name;
  const technologies: Technology[] = [];
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };

  // Add TypeScript if tsconfig exists or typescript is a dependency
  if (
    packageJson.devDependencies?.typescript ||
    packageJson.dependencies?.typescript
  ) {
    technologies.push({
      name: 'TypeScript',
      version: allDependencies.typescript,
      type: 'language',
      usage: 'core',
      confidence: TECH_CATEGORIES.typescript.confidence || 1.0,
    });
  }

  // Add JavaScript (always present)
  technologies.push({
    name: 'JavaScript',
    type: 'language',
    usage: 'core',
    confidence: 1.0, // JS is fundamental
  });

  // Process dependencies to identify technologies
  for (const [depName, version] of Object.entries(allDependencies)) {
    // Find matching tech in our knowledge base
    const matchedTechEntry = Object.entries(TECH_CATEGORIES).find(
      ([techKey]) => {
        return (
          depName.toLowerCase() === techKey.toLowerCase() || // Exact match (case-insensitive)
          depName.toLowerCase().startsWith(techKey.toLowerCase() + '-') || // e.g., framework-specific-plugin
          depName.toLowerCase().startsWith('@' + techKey.toLowerCase() + '/') // e.g., @scope/framework
        );
      }
    );

    if (matchedTechEntry) {
      const [techKey, categoryDetails] = matchedTechEntry;
      const properName = getProperTechName(depName, techKey); // Pass techKey for better naming

      // Avoid duplicates if a more generic entry (e.g. 'react') would override a specific one already added.
      // Or if the exact same dependency name was already processed (e.g. from dev vs peer)
      if (
        technologies.some(
          (t) => t.name.toLowerCase() === properName.toLowerCase()
        )
      ) {
        // Potentially update version if a new one is found, or merge info. For now, skip.
        continue;
      }

      technologies.push({
        name: properName,
        version: version as string,
        type: categoryDetails.type,
        usage: categoryDetails.usage,
        confidence: categoryDetails.confidence || 0.9, // Default confidence for matched tech
      });
    } else {
      // Unknown technology, make best guess
      // Avoid adding if it's a sub-package of an already identified technology
      const isSubPackage = technologies.some((tech) =>
        depName.startsWith(tech.name.toLowerCase())
      );
      if (isSubPackage) continue;

      technologies.push({
        name: getProperTechName(depName), // Get a capitalized name
        version: version as string,
        type: packageJson.devDependencies?.[depName] ? 'tool' : 'library',
        usage: packageJson.devDependencies?.[depName] ? 'development' : 'core',
        confidence: 0.6, // Lower confidence for unknown/guessed tech
      });
    }
  }

  // Consolidate React and Next.js detection for clarity and to avoid duplicates.
  // The main loop should handle their base detection if they are in TECH_CATEGORIES.
  // This section can refine them.

  const reactTech = technologies.find((t) => t.name.toLowerCase() === 'react');
  if (reactTech && reactTech.version) {
    const isReactModern =
      reactTech.version.startsWith('18') ||
      reactTech.version.startsWith('^18') ||
      reactTech.version.startsWith('~18') ||
      reactTech.version.startsWith('19') ||
      reactTech.version.startsWith('^19') ||
      reactTech.version.startsWith('~19');
    if (isReactModern) {
      reactTech.name = 'React (Modern)';
      // reactTech.description = "React 18+ with Concurrent Features"; // Optional: Add description
    }
  }

  const nextTech = technologies.find((t) => t.name.toLowerCase() === 'next.js');
  if (nextTech && nextTech.version) {
    const isNextModern =
      nextTech.version.startsWith('13') ||
      nextTech.version.startsWith('^13') ||
      nextTech.version.startsWith('~13') ||
      nextTech.version.startsWith('14') ||
      nextTech.version.startsWith('^14') ||
      nextTech.version.startsWith('~14') ||
      nextTech.version.startsWith('15') ||
      nextTech.version.startsWith('^15') ||
      nextTech.version.startsWith('~15');
    if (isNextModern) {
      nextTech.name = 'Next.js (Modern)';
      // nextTech.description = "Next.js 13+ (App Router capable)"; // Optional: Add description
    }
  }

  return { projectName, technologies };
}

/**
 * Returns a proper display name for a technology
 */
function getProperTechName(depName: string, techKey?: string): string {
  // Use the key from TECH_CATEGORIES for known items for consistent casing
  if (techKey && TECH_CATEGORIES[techKey]) {
    // Special handling for namespaced packages to use a base name if defined
    if (depName.startsWith('@') && techKey.startsWith('@')) {
      // e.g. @radix-ui/react-slot and @radix-ui
      const baseKeyName = Object.keys(TECH_SPECIAL_NAMES).find(
        (k) => techKey.toLowerCase() === k.toLowerCase()
      );
      if (baseKeyName) return TECH_SPECIAL_NAMES[baseKeyName];
      return capitalizeFirstLetter(techKey.substring(1).split('/')[0]); // e.g. Radix-ui
    }
    const specialNameKey = Object.keys(TECH_SPECIAL_NAMES).find(
      (k) => techKey.toLowerCase() === k.toLowerCase()
    );
    if (specialNameKey) return TECH_SPECIAL_NAMES[specialNameKey];
    return capitalizeFirstLetter(techKey); // Fallback to capitalized key
  }

  // Handle other namespaced packages if not directly in TECH_CATEGORIES key
  if (depName.startsWith('@')) {
    const parts = depName.substring(1).split('/');
    const namespace = capitalizeFirstLetter(parts[0]);
    const packageName = parts[1] ? capitalizeFirstLetter(parts[1]) : '';
    if (packageName) return `${namespace} ${packageName}`;
    return namespace;
  }

  // Special cases for depName if not found via techKey
  const specialNameKeyFromDep = Object.keys(TECH_SPECIAL_NAMES).find(
    (k) => depName.toLowerCase() === k.toLowerCase()
  );
  if (specialNameKeyFromDep) {
    return TECH_SPECIAL_NAMES[specialNameKeyFromDep];
  }

  // Default capitalization for unknown packages
  return depName
    .split('-')
    .map((part) => capitalizeFirstLetter(part))
    .join(' ');
}

// Moved special names to a separate constant for clarity in getProperTechName
const TECH_SPECIAL_NAMES: Record<string, string> = {
  react: 'React',
  next: 'Next.js',
  vue: 'Vue.js', // Added .js for consistency
  angular: 'Angular',
  typescript: 'TypeScript',
  tailwindcss: 'Tailwind CSS',
  firebase: 'Firebase',
  'firebase-admin': 'Firebase Admin',
  eslint: 'ESLint',
  prettier: 'Prettier',
  jest: 'Jest',
  tsup: 'TSup', // Capitalized
  zod: 'Zod',
  ai: 'Vercel AI SDK', // More descriptive
  '@ai-sdk/react': 'Vercel AI SDK (React)',
  '@ai-sdk/openai': 'Vercel AI SDK (OpenAI)',
  langchain: 'Langchain',
  '@langchain/core': 'Langchain Core',
  '@langchain/openai': 'Langchain OpenAI',
  axios: 'Axios',
  zustand: 'Zustand',
  '@radix-ui': 'Radix UI', // Base name for Radix
  'class-variance-authority': 'Class Variance Authority',
  'lucide-react': 'Lucide React',
  clsx: 'clsx', // Often kept lowercase
  'tailwind-merge': 'Tailwind Merge',
  '@heroicons': 'Heroicons',
  // Add more as needed
};

function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}
