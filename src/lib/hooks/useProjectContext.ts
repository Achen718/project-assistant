import { useState, useEffect } from 'react';
import { ProjectContext } from '@/lib/context/types';

/**
 * Hook for accessing and managing project context
 */
export function useProjectContext(projectId: string | null) {
  const [context, setContext] = useState<ProjectContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch project context
  useEffect(() => {
    if (!projectId) return;

    const fetchContext = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/context?projectId=${projectId}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch project context: ${response.statusText}`
          );
        }

        const data = await response.json();
        setContext(data.projectContext);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [projectId]);

  // Function to analyze the project and update context
  const analyzeProject = async (packageJson: Record<string, unknown>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/context/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          packageJson,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze project: ${response.statusText}`);
      }

      const data = await response.json();
      setContext(data.context);
      return data.context;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to manually update project context
  const updateContext = async (updatedContext: Partial<ProjectContext>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const newContext: ProjectContext = {
        ...context,
        ...updatedContext,
        projectId,
      } as ProjectContext;

      const response = await fetch('/api/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectContext: newContext,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update project context: ${response.statusText}`
        );
      }

      setContext(newContext);
      return newContext;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    context,
    loading,
    error,
    analyzeProject,
    updateContext,
  };
}
