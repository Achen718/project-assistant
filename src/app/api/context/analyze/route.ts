import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { storeAnalysisResult } from '@/lib/firebase/context-service';
import { ProjectContext } from '@/lib/context/types';

// Authenticate API requests
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
    // Authenticate the request
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract project details from the request
    const { projectId, packageJson } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // This would normally call your analysis logic
    // For now, we'll create a mock analysis
    const mockAnalysis = createMockAnalysis(projectId, packageJson);

    // Store the analysis result
    const resultId = await storeAnalysisResult({
      projectId,
      context: mockAnalysis,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      resultId,
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
  const technologies: string[] = [];
  const frameworks: string[] = [];
  const architecture: string[] = [];
  const codePatterns: Array<{ name: string; description: string }> = [];
  const bestPractices: string[] = [];

  // Extract dependencies from package.json if available
  if (packageJson && typeof packageJson === 'object') {
    // Extract dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Process dependencies to identify technologies
    Object.keys(allDeps).forEach((dep) => {
      // Framework detection
      if (dep === 'react') {
        frameworks.push('React');
      } else if (dep === 'next') {
        frameworks.push('Next.js');
      } else if (dep === 'vue') {
        frameworks.push('Vue.js');
      } else if (dep === 'angular') {
        frameworks.push('Angular');
      } else if (dep === 'svelte') {
        frameworks.push('Svelte');
      }

      // UI libraries
      if (dep.includes('shadcn')) {
        technologies.push('Shadcn UI');
      } else if (dep.includes('chakra')) {
        technologies.push('Chakra UI');
      } else if (dep === 'tailwindcss') {
        technologies.push('Tailwind CSS');
      } else if (dep.includes('material-ui') || dep === '@mui/core') {
        technologies.push('Material UI');
      }

      // State management
      if (dep === 'redux' || dep.includes('redux')) {
        technologies.push('Redux');
      } else if (dep === 'mobx' || dep.includes('mobx')) {
        technologies.push('MobX');
      } else if (dep === 'zustand') {
        technologies.push('Zustand');
      } else if (dep === 'recoil') {
        technologies.push('Recoil');
      }

      // Testing
      if (dep === 'jest' || dep.includes('jest')) {
        technologies.push('Jest');
      } else if (dep.includes('testing-library')) {
        technologies.push('Testing Library');
      } else if (dep === 'cypress') {
        technologies.push('Cypress');
      } else if (dep === 'playwright') {
        technologies.push('Playwright');
      }

      // Other important libraries
      if (dep === 'typescript') {
        technologies.push('TypeScript');
      } else if (dep.includes('firebase')) {
        technologies.push('Firebase');
      } else if (dep.includes('graphql')) {
        technologies.push('GraphQL');
      } else if (dep.includes('prisma')) {
        technologies.push('Prisma');
      } else if (dep.includes('trpc')) {
        technologies.push('tRPC');
      }
    });

    // Infer architecture based on dependencies
    if (frameworks.includes('Next.js')) {
      architecture.push('Server Components');

      // Check for App Router vs Pages Router
      if (
        packageJson.dependencies?.next.startsWith('13') ||
        packageJson.dependencies?.next.startsWith('14') ||
        packageJson.dependencies?.next.startsWith('15')
      ) {
        architecture.push('App Router');
      } else {
        architecture.push('Pages Router');
      }
    }

    // Add some standard code patterns
    if (technologies.includes('TypeScript')) {
      codePatterns.push({
        name: 'Type-safe components',
        description: 'Components use TypeScript interfaces for props',
      });

      bestPractices.push('Use proper TypeScript types instead of any');
      bestPractices.push('Use interfaces for component props');
    }

    if (frameworks.includes('React')) {
      codePatterns.push({
        name: 'Functional components',
        description:
          'Components are built using React function components with hooks',
      });

      bestPractices.push('Prefer hooks over class components');
      bestPractices.push('Extract reusable logic into custom hooks');
    }

    if (technologies.includes('Tailwind CSS')) {
      codePatterns.push({
        name: 'Utility-first CSS',
        description: 'Components use Tailwind utility classes for styling',
      });

      bestPractices.push("Use Tailwind's utility classes directly in JSX");
      bestPractices.push('Extract common patterns to component abstractions');
    }
  }

  return {
    projectId,
    technologies,
    frameworks,
    architecture,
    codePatterns,
    bestPractices,
    lastUpdated: Date.now(),
  };
}
