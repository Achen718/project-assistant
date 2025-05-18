import { PackageJson, Technology } from './types';

// Technology categorization knowledge base
const TECH_CATEGORIES: Record<
  string,
  { type: Technology['type']; usage: Technology['usage'] }
> = {
  react: { type: 'framework', usage: 'core' },
  next: { type: 'framework', usage: 'core' },
  vue: { type: 'framework', usage: 'core' },
  angular: { type: 'framework', usage: 'core' },
  typescript: { type: 'language', usage: 'core' },
  tailwindcss: { type: 'library', usage: 'core' },
  firebase: { type: 'database', usage: 'core' },
  'firebase-admin': { type: 'library', usage: 'core' },
  jest: { type: 'tool', usage: 'development' },
  '@testing-library': { type: 'library', usage: 'development' },
  eslint: { type: 'tool', usage: 'development' },
  tsup: { type: 'tool', usage: 'development' },
  zod: { type: 'library', usage: 'core' },
  ai: { type: 'library', usage: 'core' },
  '@ai-sdk': { type: 'library', usage: 'core' },
  '@langchain': { type: 'library', usage: 'core' },
  axios: { type: 'library', usage: 'core' },
  zustand: { type: 'library', usage: 'core' },
  '@radix-ui': { type: 'library', usage: 'core' },
  'class-variance-authority': { type: 'library', usage: 'core' },
  'lucide-react': { type: 'library', usage: 'core' },
  clsx: { type: 'library', usage: 'core' },
  'tailwind-merge': { type: 'library', usage: 'core' },
  '@heroicons': { type: 'library', usage: 'core' },
};

/**
 * Analyzes a package.json file to extract technology information
 */
export function analyzePackageJson(packageJson: PackageJson): Technology[] {
  if (!packageJson) return [];

  const technologies: Technology[] = [];
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };

  // Add TypeScript if tsconfig exists
  if (
    packageJson.devDependencies?.typescript ||
    packageJson.dependencies?.typescript
  ) {
    technologies.push({
      name: 'TypeScript',
      version: allDependencies.typescript,
      type: 'language',
      usage: 'core',
    });
  }

  // Add JavaScript (always present)
  technologies.push({
    name: 'JavaScript',
    type: 'language',
    usage: 'core',
  });

  // Process dependencies to identify technologies
  for (const [depName, version] of Object.entries(allDependencies)) {
    // Find matching tech in our knowledge base
    const matchedTech = Object.entries(TECH_CATEGORIES).find(([techName]) => {
      return (
        depName === techName ||
        depName.startsWith(techName + '-') ||
        depName.startsWith('@' + techName + '/')
      );
    });

    if (matchedTech) {
      const [techName, category] = matchedTech;

      // Skip if we already added this tech with a more specific name
      if (
        technologies.some(
          (t) => t.name.toLowerCase() === techName.toLowerCase()
        )
      ) {
        continue;
      }

      // Get proper name (capitalized)
      const properName = getProperTechName(depName);

      technologies.push({
        name: properName,
        version: version as string,
        type: category.type,
        usage: category.usage,
      });
    } else {
      // Unknown technology, make best guess
      technologies.push({
        name: depName,
        version: version as string,
        type: packageJson.devDependencies?.[depName] ? 'tool' : 'library',
        usage: packageJson.devDependencies?.[depName] ? 'development' : 'core',
      });
    }
  }

  // Identify React version (normal or modern)
  const reactVersion = allDependencies?.react;
  if (reactVersion) {
    const isReact18OrHigher =
      reactVersion &&
      (reactVersion.startsWith('18') ||
        reactVersion.startsWith('^18') ||
        reactVersion.startsWith('19') ||
        reactVersion.startsWith('^19'));

    // Update or add React with version indication
    const reactIndex = technologies.findIndex((t) => t.name === 'React');
    if (reactIndex >= 0) {
      technologies[reactIndex].name = isReact18OrHigher
        ? 'React (Modern)'
        : 'React';
    } else {
      technologies.push({
        name: isReact18OrHigher ? 'React (Modern)' : 'React',
        version: reactVersion as string,
        type: 'framework',
        usage: 'core',
      });
    }
  }

  // Identify Next.js (App Router vs Pages Router)
  const nextVersion = allDependencies?.next;
  if (nextVersion) {
    // Next.js 13+ can use App Router
    const isNextModern =
      nextVersion &&
      (nextVersion.startsWith('13') ||
        nextVersion.startsWith('^13') ||
        nextVersion.startsWith('14') ||
        nextVersion.startsWith('^14') ||
        nextVersion.startsWith('15') ||
        nextVersion.startsWith('^15'));

    const nextIndex = technologies.findIndex((t) => t.name.includes('Next.js'));
    if (nextIndex >= 0) {
      // We'll need to analyze the file structure later to confirm App Router usage
      technologies[nextIndex].name = isNextModern ? 'Next.js (13+)' : 'Next.js';
    } else {
      technologies.push({
        name: isNextModern ? 'Next.js (13+)' : 'Next.js',
        version: nextVersion as string,
        type: 'framework',
        usage: 'core',
      });
    }
  }

  return technologies;
}

/**
 * Returns a proper display name for a technology
 */
function getProperTechName(depName: string): string {
  // Handle namespaced packages
  if (depName.startsWith('@')) {
    const [namespace, name] = depName.substring(1).split('/');
    if (name) {
      return `${capitalizeFirstLetter(namespace)} ${capitalizeFirstLetter(
        name
      )}`;
    }
  }

  // Special cases
  const specialCases: Record<string, string> = {
    tailwindcss: 'Tailwind CSS',
    nextjs: 'Next.js',
    next: 'Next.js',
    react: 'React',
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    firebase: 'Firebase',
    'firebase-admin': 'Firebase Admin',
    eslint: 'ESLint',
    jest: 'Jest',
    zod: 'Zod',
    axios: 'Axios',
    zustand: 'Zustand',
  };

  if (specialCases[depName.toLowerCase()]) {
    return specialCases[depName.toLowerCase()];
  }

  // Default case: capitalize each word
  return depName.split('-').map(capitalizeFirstLetter).join(' ');
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
