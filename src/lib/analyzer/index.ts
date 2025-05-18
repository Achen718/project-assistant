import fs from 'fs';
import path from 'path';
import { AnalyzerResult } from './types';
import { analyzePackageJson } from './package-analyzer';
import { analyzeFileStructure } from './file-structure-analyzer';
import { analyzeCodeQuality } from './code-quality-analyzer';

/**
 * Analyzes a project codebase and extracts contextual information
 */
export async function analyzeProject(
  projectPath: string
): Promise<AnalyzerResult> {
  // Ensure path exists
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  // Initialize result with empty data
  const result: AnalyzerResult = {
    context: {
      name: path.basename(projectPath),
      technologies: [],
      patterns: {
        code: [],
        architectural: [],
      },
      fileStructure: {
        directories: [],
        entryPoints: [],
        configFiles: [],
      },
      metadata: {
        analyzedAt: new Date(),
        confidence: 0,
      },
    },
    raw: {
      otherConfigs: {},
    },
  };

  try {
    // Parse package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonRaw = fs.readFileSync(packageJsonPath, 'utf-8');
      result.raw.packageJson = JSON.parse(packageJsonRaw);
      // Extract technologies from package.json if package.json exists
      if (result.raw.packageJson) {
        result.context.technologies = analyzePackageJson(
          result.raw.packageJson
        );
      }
    }

    // Parse tsconfig.json if available
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfigRaw = fs.readFileSync(tsconfigPath, 'utf-8');
      result.raw.tsConfig = JSON.parse(tsconfigRaw);
    }

    // Parse next.config.js/ts if available
    const nextConfigPath = fs.existsSync(
      path.join(projectPath, 'next.config.js')
    )
      ? path.join(projectPath, 'next.config.js')
      : path.join(projectPath, 'next.config.ts');

    if (fs.existsSync(nextConfigPath)) {
      // Just note that it exists - parsing would require evaluation
      result.raw.nextConfig = { path: nextConfigPath };
    }

    // Analyze file structure
    const fileStructureResult = await analyzeFileStructure(projectPath);
    result.context.fileStructure.directories = fileStructureResult.directories;
    result.context.fileStructure.entryPoints = fileStructureResult.entryPoints;
    result.context.fileStructure.configFiles = fileStructureResult.configFiles;
    result.context.patterns.architectural =
      fileStructureResult.patterns.architectural;

    // Merge code patterns
    result.context.patterns.code = [...fileStructureResult.patterns.code];

    // Analyze code quality
    const codeQualityResult = await analyzeCodeQuality(projectPath);
    result.context.patterns.code = [
      ...result.context.patterns.code,
      ...codeQualityResult.patterns,
    ];

    // Calculate confidence score based on the completeness of the analysis
    // This is a simple heuristic that can be improved
    const hasPackageJson = !!result.raw.packageJson;
    const hasTsConfig = !!result.raw.tsConfig;
    const hasNextConfig = !!result.raw.nextConfig;
    const hasComponents =
      result.context.fileStructure.directories.includes('components');
    const hasPages = result.context.fileStructure.directories.includes('pages');
    const hasApp = result.context.fileStructure.directories.includes('app');

    // Simple scoring: 0-1 range
    let confidenceScore = 0.5; // Base score

    if (hasPackageJson) confidenceScore += 0.1;
    if (hasTsConfig) confidenceScore += 0.05;
    if (hasNextConfig) confidenceScore += 0.05;
    if (hasComponents) confidenceScore += 0.1;
    if (hasPages || hasApp) confidenceScore += 0.1;
    if (result.context.technologies.length > 0) confidenceScore += 0.1;

    result.context.metadata.confidence = Math.min(1, confidenceScore);
  } catch (error) {
    console.error('Error during project analysis:', error);
    result.context.metadata.confidence = 0.3; // Lower confidence on error
  }

  return result;
}

// Re-export types
export * from './types';

// Export individual analyzers
export { analyzePackageJson } from './package-analyzer';
export { analyzeFileStructure } from './file-structure-analyzer';
export { analyzeCodeQuality } from './code-quality-analyzer';
