import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Example tool for searching app's knowledge base
export const createSearchTool = (
  searchFunction: (query: string) => Promise<string[]>
) => {
  return new DynamicStructuredTool({
    name: 'search_knowledge_base',
    description: 'Search the application knowledge base for information',
    schema: z.object({
      query: z.string().describe('The search query to look up'),
    }),
    func: async ({ query }) => {
      const results = await searchFunction(query);
      return JSON.stringify(results);
    },
  });
};
