import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { AnalyzerResult, AnalyzerProjectContext } from './types';
import { analyzePackageJson, PackageAnalyzerResult } from './package-analyzer';
import {
  analyzeFileStructure,
  FileStructureAnalyzerResult,
} from './file-structure-analyzer';
import { analyzeCodeQuality } from './code-quality-analyzer';

// Helper function to get all file paths in a directory recursively
async function getAllFilePaths(
  dirPath: string,
  baseDir: string = dirPath
): Promise<string[]> {
  let files: string[] = [];
  const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files = files.concat(await getAllFilePaths(fullPath, baseDir));
      }
    } else {
      files.push(relativePath.replace(/\\/g, '/')); // Normalize to forward slashes
    }
  }
  return files;
}

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

  const result: AnalyzerResult = {
    context: {
      projectName: path.basename(projectPath),
      technologies: [],
      architecturalPatterns: [],
      codePatterns: [],
      bestPracticesObserved: [],
      fileStructure: {
        directories: [],
        entryPoints: [],
        configFiles: [],
      },
      analysisMetadata: {
        analyzedAt: new Date(),
        overallConfidence: 0,
      },
    } as AnalyzerProjectContext,
    rawFileContents: {
      packageJson: undefined,
      tsConfig: undefined,
      nextConfig: undefined,
      otherRelevantConfigs: {},
    },
    errors: [],
  };

  try {
    // Get all file paths first
    const allProjectFiles = await getAllFilePaths(projectPath);

    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonRaw = await fsPromises.readFile(
        packageJsonPath,
        'utf-8'
      );
      result.rawFileContents!.packageJson = JSON.parse(packageJsonRaw);
      if (result.rawFileContents!.packageJson) {
        const packageAnalysis: PackageAnalyzerResult = analyzePackageJson(
          result.rawFileContents!.packageJson
        );
        const technologiesFromPackage = packageAnalysis.technologies || [];

        if (result.context.technologies) {
          result.context.technologies.push(...technologiesFromPackage);
        } else {
          result.context.technologies = technologiesFromPackage;
        }
      }
    }

    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfigRaw = await fsPromises.readFile(tsconfigPath, 'utf-8');
      result.rawFileContents!.tsConfig = JSON.parse(tsconfigRaw);
    }

    const nextConfigJsPath = path.join(projectPath, 'next.config.js');
    const nextConfigTsPath = path.join(projectPath, 'next.config.ts');
    let nextConfigPathResolved: string | undefined;

    if (allProjectFiles.includes('next.config.js')) {
      nextConfigPathResolved = nextConfigJsPath;
    } else if (allProjectFiles.includes('next.config.ts')) {
      nextConfigPathResolved = nextConfigTsPath;
    }

    if (nextConfigPathResolved) {
      result.rawFileContents!.nextConfig = { path: nextConfigPathResolved };
    }

    const fileStructureResult: FileStructureAnalyzerResult =
      analyzeFileStructure(allProjectFiles);

    if (result.context.fileStructure) {
      result.context.fileStructure.directories =
        fileStructureResult.fileStructure?.directories || [];
      result.context.fileStructure.entryPoints =
        fileStructureResult.fileStructure?.entryPoints || [];
      result.context.fileStructure.configFiles =
        fileStructureResult.fileStructure?.configFiles || [];
    }

    if (fileStructureResult.architecturalPatterns) {
      result.context.architecturalPatterns = [
        ...(result.context.architecturalPatterns || []),
        ...fileStructureResult.architecturalPatterns,
      ];
    }

    if (fileStructureResult.codePatterns) {
      result.context.codePatterns = [
        ...(result.context.codePatterns || []),
        ...fileStructureResult.codePatterns,
      ];
    }

    const codeQualityResult = await analyzeCodeQuality(projectPath);
    if (codeQualityResult.patterns) {
      result.context.codePatterns = [
        ...(result.context.codePatterns || []),
        ...codeQualityResult.patterns,
      ];
    }

    const hasPackageJson = !!result.rawFileContents!.packageJson;
    const hasTsConfig = !!result.rawFileContents!.tsConfig;
    const hasNextConfig = !!result.rawFileContents!.nextConfig;

    // Use fileStructureResult for commonDirs as result.context.fileStructure might not have it yet
    const componentsInFileStructure =
      fileStructureResult.fileStructure?.commonDirs?.includes('components') ||
      fileStructureResult.fileStructure?.directories?.includes('components') ||
      false;
    const pagesInFileStructure =
      fileStructureResult.fileStructure?.commonDirs?.includes('pages') ||
      fileStructureResult.fileStructure?.directories?.includes('pages') ||
      false;
    const appInFileStructure =
      fileStructureResult.fileStructure?.commonDirs?.includes('app') ||
      fileStructureResult.fileStructure?.directories?.includes('app') ||
      false;

    const hasComponents =
      result.context.fileStructure?.directories?.includes('components') ||
      componentsInFileStructure; // Use the check from fileStructureResult
    const hasPages =
      result.context.fileStructure?.directories?.includes('pages') ||
      pagesInFileStructure; // Use the check from fileStructureResult
    const hasApp =
      result.context.fileStructure?.directories?.includes('app') ||
      appInFileStructure; // Use the check from fileStructureResult

    let confidenceScore = 0.5;

    if (hasPackageJson) confidenceScore += 0.1;
    if (hasTsConfig) confidenceScore += 0.05;
    if (hasNextConfig) confidenceScore += 0.05;
    if (hasComponents) confidenceScore += 0.1;
    if (hasPages || hasApp) confidenceScore += 0.1;
    if (result.context.technologies && result.context.technologies.length > 0)
      confidenceScore += 0.1;

    if (result.context.analysisMetadata) {
      result.context.analysisMetadata.overallConfidence = Math.min(
        1,
        confidenceScore
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during project analysis';
    console.error('Error during project analysis:', error);
    if (result.context.analysisMetadata) {
      result.context.analysisMetadata.overallConfidence = 0.3;
    }
    result.errors = [
      ...(result.errors || []),
      { message, sourceAnalyzer: 'analyzeProjectCatchBlock' },
    ];
  }

  return result;
}

// Re-export types
export * from './types';

// Export individual analyzers
export { analyzePackageJson } from './package-analyzer';
export { analyzeFileStructure } from './file-structure-analyzer';
export { analyzeCodeQuality } from './code-quality-analyzer';
