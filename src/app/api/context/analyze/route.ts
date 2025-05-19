import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { storeAnalysisResult } from '@/lib/firebase/context-service';
import {
  ProjectContext,
  Technology,
  ArchitecturalPattern,
  CodePattern,
} from '@/lib/context/types';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, packageJson } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const mockAnalysis = createMockAnalysis(projectId, packageJson);

    await storeAnalysisResult({
      projectId,
      context: mockAnalysis,
      analysisTimestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      projectId,
      context: mockAnalysis,
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    );
  }
}

const KNOWN_TECHNOLOGIES_CONFIG = [
  // Frameworks
  {
    keyPatterns: ['react'],
    name: 'React',
    type: 'framework',
    targetArray: 'frameworks',
  },
  {
    keyPatterns: ['next'],
    name: 'Next.js',
    type: 'framework',
    targetArray: 'frameworks',
  },
  {
    keyPatterns: ['vue'],
    name: 'Vue.js',
    type: 'framework',
    targetArray: 'frameworks',
  },
  {
    keyPatterns: ['angular'],
    name: 'Angular',
    type: 'framework',
    targetArray: 'frameworks',
  },
  {
    keyPatterns: ['svelte'],
    name: 'Svelte',
    type: 'framework',
    targetArray: 'frameworks',
  },

  // UI Libraries
  {
    keyPatterns: ['shadcn'],
    name: 'Shadcn UI',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['chakra'],
    name: 'Chakra UI',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['tailwindcss'],
    name: 'Tailwind CSS',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['material-ui', '@mui/core'],
    name: 'Material UI',
    type: 'library',
    targetArray: 'technologies',
  },

  // State Management
  {
    keyPatterns: ['redux'],
    name: 'Redux',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['mobx'],
    name: 'MobX',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['zustand'],
    name: 'Zustand',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['recoil'],
    name: 'Recoil',
    type: 'library',
    targetArray: 'technologies',
  },

  // Testing
  {
    keyPatterns: ['jest'],
    name: 'Jest',
    type: 'tool',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['testing-library'],
    name: 'Testing Library',
    type: 'tool',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['cypress'],
    name: 'Cypress',
    type: 'tool',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['playwright'],
    name: 'Playwright',
    type: 'tool',
    targetArray: 'technologies',
  },

  // Other Important Libraries/Tools
  {
    keyPatterns: ['typescript'],
    name: 'TypeScript',
    type: 'language',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['firebase'],
    name: 'Firebase',
    type: 'database',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['graphql'],
    name: 'GraphQL',
    type: 'library',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['prisma'],
    name: 'Prisma',
    type: 'tool',
    targetArray: 'technologies',
  },
  {
    keyPatterns: ['trpc'],
    name: 'tRPC',
    type: 'library',
    targetArray: 'technologies',
  },
];

/**
 * Creates a mock analysis result based on package.json
 * In a real implementation, this would be replaced with actual analysis logic
 */
function createMockAnalysis(
  projectId: string,
  packageJson?: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }
): ProjectContext {
  const technologies: Technology[] = [];
  const frameworks: Technology[] = [];
  const architecturalPatterns: ArchitecturalPattern[] = [];
  const codePatterns: CodePattern[] = [];
  const bestPracticesObserved: string[] = [];

  if (packageJson && typeof packageJson === 'object') {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    Object.keys(allDeps).forEach((dep) => {
      for (const techConfig of KNOWN_TECHNOLOGIES_CONFIG) {
        if (techConfig.keyPatterns.some((pattern) => dep.includes(pattern))) {
          const techInfo = {
            name: techConfig.name,
            type: techConfig.type as Technology['type'],
            version: allDeps[dep],
          };
          if (techConfig.targetArray === 'frameworks') {
            frameworks.push(techInfo);
          } else {
            technologies.push(techInfo);
          }
          break;
        }
      }
    });

    if (frameworks.some((f) => f.name === 'Next.js')) {
      architecturalPatterns.push({
        name: 'Server Components',
        description: 'Utilizes Next.js Server Components',
      });
      const nextVersion =
        packageJson.dependencies?.next || packageJson.devDependencies?.next;
      if (
        nextVersion &&
        (nextVersion.startsWith('13') ||
          nextVersion.startsWith('14') ||
          nextVersion.startsWith('15'))
      ) {
        architecturalPatterns.push({
          name: 'App Router',
          description: 'Next.js App Router for routing and layouts',
        });
      } else {
        architecturalPatterns.push({
          name: 'Pages Router',
          description: 'Next.js Pages Router for routing',
        });
      }
    }

    if (technologies.some((t) => t.name === 'TypeScript')) {
      codePatterns.push({
        name: 'Type-safe components',
        description: 'Components use TypeScript interfaces for props',
      });
      bestPracticesObserved.push('Use proper TypeScript types instead of any');
      bestPracticesObserved.push('Use interfaces for component props');
    }

    if (frameworks.some((f) => f.name === 'React')) {
      codePatterns.push({
        name: 'Functional components',
        description:
          'Components are built using React function components with hooks',
      });
      bestPracticesObserved.push('Prefer hooks over class components');
      bestPracticesObserved.push('Extract reusable logic into custom hooks');
    }

    if (technologies.some((t) => t.name === 'Tailwind CSS')) {
      codePatterns.push({
        name: 'Utility-first CSS',
        description: 'Components use Tailwind utility classes for styling',
      });
      bestPracticesObserved.push(
        "Use Tailwind's utility classes directly in JSX"
      );
      bestPracticesObserved.push(
        'Extract common patterns to component abstractions'
      );
    }
  }

  return {
    projectId,
    technologies: technologies.filter(
      // Ensure unique by name before returning
      (tech, index, self) =>
        index === self.findIndex((t) => t.name === tech.name)
    ),
    architecturalPatterns,
    codePatterns,
    bestPracticesObserved,
    lastAnalyzed: new Date().toISOString(),
  };
}
