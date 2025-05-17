import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
export declare const createSearchTool: (searchFunction: (query: string) => Promise<string[]>) => DynamicStructuredTool<z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>, {
    query: string;
}, {
    query: string;
}, string>;
